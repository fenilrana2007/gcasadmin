import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';
import { 
    Search, Download, Edit, Save, Trash2, ExternalLink, X, 
    CheckCircle, Clock, Users, FileText, AlertCircle, 
    Filter, Eye, ChevronDown, Upload, Shield,
    UserCheck, Calendar, Hash, Mail, Phone, Award,
    File, Link2, RefreshCw, Loader,
    User, SearchCode, Plus, Image, FileSpreadsheet
} from 'lucide-react';

const AdminPortal = () => {
    const [applications, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState('name');
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [newApplication, setNewApplication] = useState({
        name: '', mobile: '', email: '', adhar: '',
        whofill: '', timing: '', date: '', medium: '', degree: '',
        gcasusername: '', gcaspassword: ''
    });

    const API_URL = "https://gcasadmin.onrender.com/api/admin";

    // Helper function to get full file URL
    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        
        // If it's already a full URL
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }
        
        // If it's a Cloudinary path, construct the full URL
        if (filePath.includes('cloudinary') || filePath.includes('res.cloudinary.com')) {
            return filePath;
        }
        
        // For local paths or relative paths
        if (filePath.startsWith('/')) {
            return `https://gcasadmin.onrender.com${filePath}`;
        }
        
        return filePath;
    };

    // Open PDF in new tab
    const openDocument = (filePath, fileName) => {
        const fullUrl = getFileUrl(filePath);
        if (fullUrl) {
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
        } else {
            showToast("Document URL not available", "error");
        }
    };

    useEffect(() => { 
        fetchAll(); 
    }, []);

    useEffect(() => {
        filterApplications();
    }, [searchTerm, applications, selectedFilter, searchType]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/applications`);
            setApps(res.data);
            setFilteredApps(res.data);
            
            const total = res.data.length;
            const completed = res.data.filter(app => app.gcasusername && app.gcaspassword).length;
            setStats({ total, pending: total - completed, completed });
        } catch (err) { 
            console.error("Fetch Error:", err);
            showToast("Failed to fetch applications", "error");
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = [...applications];
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            
            if (searchType === 'name') {
                filtered = filtered.filter(app => app.name?.toLowerCase().includes(term));
            } else if (searchType === 'mobile') {
                filtered = filtered.filter(app => app.mobile?.includes(term));
            }
        }
        
        if (selectedFilter === 'completed') {
            filtered = filtered.filter(app => app.gcasusername && app.gcaspassword);
        } else if (selectedFilter === 'pending') {
            filtered = filtered.filter(app => !app.gcasusername || !app.gcaspassword);
        }
        
        setFilteredApps(filtered);
    };

    const handleUpdate = async (id) => {
        const data = new FormData();
        Object.keys(editForm).forEach(key => {
            if (key !== 'gcasfilelast' && key !== 'files' && key !== '_id' && key !== '__v') {
                data.append(key, editForm[key] || '');
            }
        });
        if (selectedFile) data.append('gcasfilelast', selectedFile);

        try {
            await axios.put(`${API_URL}/update/${id}`, data);
            setEditId(null);
            setSelectedFile(null);
            fetchAll();
            showToast("Application updated successfully!", "success");
        } catch (err) { 
            console.error(err);
            showToast("Update failed. Please try again.", "error");
        }
    };

    const deleteRecord = async (id) => {
        if(window.confirm("⚠️ Are you sure you want to permanently delete this student record?")) {
            try {
                await axios.delete(`${API_URL}/delete/${id}`);
                fetchAll();
                showToast("Record deleted successfully", "success");
            } catch (err) {
                showToast("Delete failed", "error");
            }
        }
    };

    const handleAddApplication = async () => {
        try {
            await axios.post(`${API_URL}/add`, newApplication);
            setShowAddModal(false);
            setNewApplication({
                name: '', mobile: '', email: '', adhar: '',
                whofill: '', timing: '', date: '', medium: '', degree: '',
                gcasusername: '', gcaspassword: ''
            });
            fetchAll();
            showToast("New application added successfully!", "success");
        } catch (err) {
            showToast("Failed to add application", "error");
        }
    };

    const exportToExcel = () => {
        const excelData = filteredApps.map(app => ({
            "Student Name": app.name,
            "Mobile Number": app.mobile,
            "Email": app.email || "N/A",
            "Aadhar Number": app.adhar || "N/A",
            "12th Marksheet No": app.marksheet12Number || "N/A",
            "GCAS Username": app.gcasusername || "Pending",
            "GCAS Password": app.gcaspassword || "Pending",
            "Final Document Link": app.gcasfilelast?.path || "Not Uploaded",
            "Filled By": app.whofill || "---",
            "Medium": app.medium || "---",
            "Degree": app.degree || "---",
            "Entry Date": app.date || "---",
            "Entry Timing": app.timing || "---"
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GCAS_Master_Sheet");
        XLSX.writeFile(wb, `GCAS_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast("Excel report exported successfully!", "success");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <Loader className="loading-spinner" size={48} />
                    <p className="loading-text">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Header Section */}
            <div className="admin-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="logo-title">GCAS Admin Portal</h1>
                            <p className="logo-subtitle">Manage student applications and credentials</p>
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <button onClick={exportToExcel} className="btn btn-success">
                            <Download size={18}/> Export Excel
                        </button>
                        <button onClick={fetchAll} className="btn btn-outline">
                            <RefreshCw size={18}/> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Full Width */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div>
                            <p className="stat-title">Total Applications</p>
                            <p className="stat-value">{stats.total}</p>
                        </div>
                        <div className="stat-icon bg-blue-100">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div>
                            <p className="stat-title">Completed</p>
                            <p className="stat-value">{stats.completed}</p>
                        </div>
                        <div className="stat-icon bg-green-100">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div>
                            <p className="stat-title">Pending</p>
                            <p className="stat-value">{stats.pending}</p>
                        </div>
                        <div className="stat-icon bg-yellow-100">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="search-section">
                <div className="search-card">
                    <div className="search-controls">
                        <div className="search-type-group">
                            <label className="search-label">Search By</label>
                            <div className="search-type-buttons">
                                <button
                                    onClick={() => setSearchType('name')}
                                    className={`search-type-btn ${searchType === 'name' ? 'active' : 'inactive'}`}
                                >
                                    <User size={16} /> Name
                                </button>
                                <button
                                    onClick={() => setSearchType('mobile')}
                                    className={`search-type-btn ${searchType === 'mobile' ? 'active' : 'inactive'}`}
                                >
                                    <Phone size={16} /> Mobile
                                </button>
                            </div>
                        </div>

                        <div className="search-input-group">
                            <label className="search-label">
                                {searchType === 'name' ? 'Student Name' : 'Mobile Number'}
                            </label>
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={18} />
                                <input 
                                    type="text"
                                    placeholder={searchType === 'name' ? 'Search by student name...' : 'Enter mobile number...'}
                                    className="search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="clear-search">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="search-label">Status Filter</label>
                            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="filter-select">
                                <option value="all">All Applications</option>
                                <option value="completed">Completed (Has Credentials)</option>
                                <option value="pending">Pending (No Credentials)</option>
                            </select>
                        </div>
                    </div>

                    {searchTerm && (
                        <div className="search-results-info">
                            <div className="search-results-text">
                                <SearchCode size={18} />
                                <span>Found {filteredApps.length} result{filteredApps.length !== 1 && 's'} for "{searchTerm}"</span>
                            </div>
                            <button onClick={() => setSearchTerm('')} className="clear-search-btn">Clear Search</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Table Container */}
            <div className="table-container">
                <div className="data-table-wrapper">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead className="table-header">
                                <tr>
                                    <th>Student Details</th>
                                    <th>GCAS Credentials</th>
                                    <th>Processing Details</th>
                                    <th>All Documents</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {filteredApps.map((app) => (
                                    <tr key={app._id}>
                                        <td>
                                            <div className="student-info">
                                                <div className="student-name">
                                                    {app.name}
                                                    {!app.gcasusername && <span className="badge-pending">Pending</span>}
                                                </div>
                                                <div className="student-detail">
                                                    <Hash size={14} /> <span>12th: {app.marksheet12Number || "N/A"}</span>
                                                </div>
                                                <div className="student-detail">
                                                    <Phone size={14} /> <span>{app.mobile}</span>
                                                </div>
                                                {app.email && (
                                                    <div className="student-detail">
                                                        <Mail size={14} /> <span>{app.email}</span>
                                                    </div>
                                                )}
                                                {app.adhar && (
                                                    <div className="student-detail">
                                                        <Shield size={14} /> <span>Aadhar: {app.adhar}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td>
                                            {editId === app._id ? (
                                                <div className="edit-credentials">
                                                    <input className="edit-input" placeholder="GCAS Username" defaultValue={app.gcasusername} 
                                                        onChange={(e) => setEditForm({...editForm, gcasusername: e.target.value})}/>
                                                    <input className="edit-input" placeholder="GCAS Password" defaultValue={app.gcaspassword} 
                                                        onChange={(e) => setEditForm({...editForm, gcaspassword: e.target.value})}/>
                                                </div>
                                            ) : (
                                                <div>
                                                    {app.gcasusername ? (
                                                        <div className="credential-box">
                                                            <div className="credential-label">Username</div>
                                                            <div className="credential-value">{app.gcasusername}</div>
                                                            <div className="credential-label mt-2">Password</div>
                                                            <div className="credential-value">{app.gcaspassword}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="empty-credentials">
                                                            <Clock size={16} />
                                                            <span>Credentials Not Generated</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {editId === app._id ? (
                                                <div className="edit-fields">
                                                    <input className="edit-input" placeholder="Filled By" defaultValue={app.whofill} 
                                                        onChange={(e) => setEditForm({...editForm, whofill: e.target.value})}/>
                                                    <input className="edit-input" placeholder="Degree" defaultValue={app.degree} 
                                                        onChange={(e) => setEditForm({...editForm, degree: e.target.value})}/>
                                                    <input className="edit-input" placeholder="Medium" defaultValue={app.medium} 
                                                        onChange={(e) => setEditForm({...editForm, medium: e.target.value})}/>
                                                    <input className="edit-input" type="date" defaultValue={app.date} 
                                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}/>
                                                    <input className="edit-input" type="time" placeholder="Timing" defaultValue={app.timing} 
                                                        onChange={(e) => setEditForm({...editForm, timing: e.target.value})}/>
                                                </div>
                                            ) : (
                                                <div className="academic-info">
                                                    {app.whofill && <div><UserCheck size={14} /> By: {app.whofill}</div>}
                                                    {app.degree && <div><Award size={14} /> {app.degree}</div>}
                                                    {app.medium && <div><FileText size={14} /> Medium: {app.medium}</div>}
                                                    {app.date && <div><Calendar size={14} /> Date: {app.date}</div>}
                                                    {app.timing && <div><Clock size={14} /> Time: {app.timing}</div>}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <div className="documents-list">
                                                {/* Debug: Log the file path */}
                                                {console.log('File paths for', app.name, app.files?.marksheet12?.[0]?.path)}
                                                
                                                {app.files?.marksheet10?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.marksheet10[0].path, '10th Marksheet')} className="doc-link">
                                                        <File size={14} /> 📄 10th Marksheet
                                                    </button>
                                                )}
                                                {app.files?.marksheet12?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.marksheet12[0].path, '12th Marksheet')} className="doc-link">
                                                        <File size={14} /> 📄 12th Marksheet
                                                    </button>
                                                )}
                                                {app.files?.casteCert?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.casteCert[0].path, 'Caste Certificate')} className="doc-link">
                                                        <File size={14} /> 📜 Caste Certificate
                                                    </button>
                                                )}
                                                {app.files?.nclCert?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.nclCert[0].path, 'Non-Creamy Layer')} className="doc-link">
                                                        <File size={14} /> ⭐ Non-Creamy Layer
                                                    </button>
                                                )}
                                                {app.files?.leavingCert?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.leavingCert[0].path, 'Leaving Certificate')} className="doc-link">
                                                        <File size={14} /> 🎓 Leaving Certificate
                                                    </button>
                                                )}
                                                {app.files?.incomeCert?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.incomeCert[0].path, 'Income Certificate')} className="doc-link">
                                                        <File size={14} /> 💰 Income Certificate
                                                    </button>
                                                )}
                                                {app.files?.photo?.[0]?.path && (
                                                    <button onClick={() => openDocument(app.files.photo[0].path, 'Passport Photo')} className="doc-link">
                                                        <Image size={14} /> 📸 Passport Photo
                                                    </button>
                                                )}
                                                {editId === app._id && (
                                                    <div className="upload-doc">
                                                        <label>Upload Final Document</label>
                                                        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])}/>
                                                    </div>
                                                )}
                                                {app.gcasfilelast && (
                                                    <button onClick={() => openDocument(app.gcasfilelast.path, 'Final Confirmation')} className="doc-link-final">
                                                        <Link2 size={14} /> ✅ Final Confirmation
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                {editId === app._id ? (
                                                    <>
                                                        <button onClick={() => handleUpdate(app._id)} className="action-btn-save" title="Save">
                                                            <Save size={18}/>
                                                        </button>
                                                        <button onClick={() => setEditId(null)} className="action-btn-cancel" title="Cancel">
                                                            <X size={18}/>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => {setEditId(app._id); setEditForm(app);}} className="action-btn-edit" title="Edit">
                                                            <Edit size={18}/>
                                                        </button>
                                                        <button onClick={() => deleteRecord(app._id)} className="action-btn-delete" title="Delete">
                                                            <Trash2 size={18}/>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredApps.length === 0 && (
                            <div className="empty-state">
                                <AlertCircle size={48} />
                                <p className="empty-title">No applications found</p>
                                <p className="empty-subtitle">{searchTerm ? 'Try adjusting your search criteria' : 'No applications available'}</p>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="empty-clear-btn">Clear Search</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <div className="live-indicator">
                        <div className="live-dot"></div>
                        <span>Live Database Connected</span>
                        <span className="separator">|</span>
                        <span>Total Records: {applications.length}</span>
                        <span className="separator">|</span>
                        <span>Showing: {filteredApps.length}</span>
                    </div>
                    <div className="keyboard-hint">
                        <kbd>⌘</kbd> <span>+ F to search</span>
                    </div>
                </div>
            </div>

            {/* Add Application Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title"><Plus size={20} /> Add New Application</h2>
                            <button onClick={() => setShowAddModal(false)} className="modal-close"><X size={20}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>Full Name *</label>
                                    <input type="text" value={newApplication.name} onChange={(e) => setNewApplication({...newApplication, name: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Mobile Number *</label>
                                    <input type="tel" value={newApplication.mobile} onChange={(e) => setNewApplication({...newApplication, mobile: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Email *</label>
                                    <input type="email" value={newApplication.email} onChange={(e) => setNewApplication({...newApplication, email: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Aadhar Number *</label>
                                    <input type="text" value={newApplication.adhar} onChange={(e) => setNewApplication({...newApplication, adhar: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Filled By</label>
                                    <input type="text" value={newApplication.whofill} onChange={(e) => setNewApplication({...newApplication, whofill: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Degree</label>
                                    <input type="text" value={newApplication.degree} onChange={(e) => setNewApplication({...newApplication, degree: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Medium</label>
                                    <input type="text" value={newApplication.medium} onChange={(e) => setNewApplication({...newApplication, medium: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Date</label>
                                    <input type="date" value={newApplication.date} onChange={(e) => setNewApplication({...newApplication, date: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>Timing</label>
                                    <input type="time" value={newApplication.timing} onChange={(e) => setNewApplication({...newApplication, timing: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>GCAS Username</label>
                                    <input type="text" value={newApplication.gcasusername} onChange={(e) => setNewApplication({...newApplication, gcasusername: e.target.value})} />
                                </div>
                                <div className="form-field">
                                    <label>GCAS Password</label>
                                    <input type="text" value={newApplication.gcaspassword} onChange={(e) => setNewApplication({...newApplication, gcaspassword: e.target.value})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => setShowAddModal(false)} className="btn-cancel">Cancel</button>
                                <button onClick={handleAddApplication} className="btn-submit">Add Application</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;