// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import * as XLSX from 'xlsx';
// import { Search, Download, Edit, Save, Trash2, ExternalLink, X, CheckCircle, Clock } from 'lucide-react';

// const AdminPortal = () => {
//     const [applications, setApps] = useState([]);
//     const [search, setSearch] = useState("");
//     const [editId, setEditId] = useState(null);
//     const [editForm, setEditForm] = useState({});
//     const [selectedFile, setSelectedFile] = useState(null);

//     const API_URL = "https://gcasadmin.onrender.com/api/admin";

//     useEffect(() => { fetchAll(); }, []);

//     const fetchAll = async () => {
//         try {
//             const res = await axios.get(`${API_URL}/applications`);
//             setApps(res.data);
//         } catch (err) { console.error("Fetch Error:", err); }
//     };

//     const handleUpdate = async (id) => {
//         const data = new FormData();
//         // Append all text fields from the edit state
//         Object.keys(editForm).forEach(key => {
//             if (key !== 'gcasfilelast' && key !== 'files') data.append(key, editForm[key]);
//         });
//         // Append the new file if one was selected
//         if (selectedFile) data.append('gcasfilelast', selectedFile);

//         try {
//             await axios.put(`${API_URL}/update/${id}`, data);
//             setEditId(null);
//             setSelectedFile(null);
//             fetchAll();
//             alert("Database Updated Successfully!");
//         } catch (err) { alert("Update Failed. Check console."); }
//     };

//     const deleteRecord = async (id) => {
//         if(window.confirm("Permanently delete this student record?")) {
//             await axios.delete(`${API_URL}/delete/${id}`);
//             fetchAll();
//         }
//     };

//     const exportToExcel = () => {
//         const excelData = applications.map(app => ({
//             "Student Name": app.name,
//             "12th Marksheet No": app.marksheet12Number || "N/A",
//             "Mobile": app.mobile,
//             "GCAS User": app.gcasusername || "Pending",
//             "GCAS Pass": app.gcaspassword || "Pending",
//             "Final Doc Link": app.gcasfilelast?.path || "Not Uploaded",
//             "Filled By": app.whofill || "---",
//             "Medium": app.medium || "---",
//             "Degree": app.degree || "---",
//             "Entry Date": app.date || "---",
//             "Entry Timing": app.timing || "---"
//         }));

//         const ws = XLSX.utils.json_to_sheet(excelData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "GCAS_Master_Sheet");
//         XLSX.writeFile(wb, `GCAS_Report_${new Date().toLocaleDateString()}.xlsx`);
//     };

//     return (
//         <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
//             {/* Header Section */}
//             <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
//                 <div>
//                     <h1 className="text-3xl font-black tracking-tight text-slate-800">GCAS ADMIN <span className="text-blue-600">PORTAL</span></h1>
//                     <p className="text-slate-500 font-medium">Manage student applications and login credentials</p>
//                 </div>
                
//                 <div className="flex flex-wrap gap-3">
//                     <div className="relative">
//                         <Search className="absolute left-3 top-3 text-slate-400" size={18} />
//                         <input 
//                             placeholder="Search 12th Marksheet No..." 
//                             className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                     </div>
//                     <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-green-100 transition-all">
//                         <Download size={18}/> Export Excel
//                     </button>
//                 </div>
//             </div>

//             {/* Main Table Container */}
//             <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                         <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-widest">
//                             <tr>
//                                 <th className="p-5">Student Info</th>
//                                 <th className="p-5">GCAS Credentials</th>
//                                 <th className="p-5">Processing Details</th>
//                                 <th className="p-5">Documents</th>
//                                 <th className="p-5 text-center">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100">
//                             {applications.filter(a => a.marksheet12Number?.includes(search)).map(app => (
//                                 <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
//                                     <td className="p-5">
//                                         <div className="font-bold text-slate-800 text-base">{app.name}</div>
//                                         <div className="text-blue-600 font-semibold text-xs mt-1">12th No: {app.marksheet12Number || "PENDING"}</div>
//                                         <div className="text-slate-400 text-[11px] mt-1 italic">{app.mobile}</div>
//                                     </td>
                                    
//                                     <td className="p-5">
//                                         {editId === app._id ? (
//                                             <div className="flex flex-col gap-2">
//                                                 <input className="border p-2 rounded-lg text-xs" placeholder="User ID" defaultValue={app.gcasusername} onChange={(e)=>setEditForm({...editForm, gcasusername: e.target.value})}/>
//                                                 <input className="border p-2 rounded-lg text-xs" placeholder="Password" defaultValue={app.gcaspassword} onChange={(e)=>setEditForm({...editForm, gcaspassword: e.target.value})}/>
//                                             </div>
//                                         ) : (
//                                             <div className="space-y-1">
//                                                 <div className="text-xs font-mono bg-slate-100 p-1 px-2 rounded">U: {app.gcasusername || "---"}</div>
//                                                 <div className="text-xs font-mono bg-slate-100 p-1 px-2 rounded">P: {app.gcaspassword || "---"}</div>
//                                             </div>
//                                         )}
//                                     </td>

//                                     <td className="p-5">
//                                         {editId === app._id ? (
//                                             <div className="grid grid-cols-2 gap-2">
//                                                 <input className="border p-2 text-xs rounded-lg" placeholder="Filled By" defaultValue={app.whofill} onChange={(e)=>setEditForm({...editForm, whofill: e.target.value})}/>
//                                                 <input className="border p-2 text-xs rounded-lg" placeholder="Degree" defaultValue={app.degree} onChange={(e)=>setEditForm({...editForm, degree: e.target.value})}/>
//                                                 <input className="border p-2 text-xs rounded-lg" placeholder="Medium" defaultValue={app.medium} onChange={(e)=>setEditForm({...editForm, medium: e.target.value})}/>
//                                                 <input className="border p-2 text-xs rounded-lg" type="date" defaultValue={app.date} onChange={(e)=>setEditForm({...editForm, date: e.target.value})}/>
//                                             </div>
//                                         ) : (
//                                             <div className="text-xs text-slate-600 space-y-1">
//                                                 <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> By: {app.whofill || "---"}</div>
//                                                 <div className="flex items-center gap-1"><Clock size={12} className="text-blue-500"/> {app.degree || "---"}</div>
//                                             </div>
//                                         )}
//                                     </td>

//                                     <td className="p-5">
//                                         <div className="flex flex-col gap-2">
//                                             <a href={app.files?.marksheet12?.[0]?.path} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline text-xs font-bold">
//                                                 <ExternalLink size={12}/> View 12th Marksheet
//                                             </a>
//                                             {editId === app._id ? (
//                                                 <input type="file" className="text-[10px] mt-2" onChange={(e)=>setSelectedFile(e.target.files[0])}/>
//                                             ) : (
//                                                 app.gcasfilelast && (
//                                                     <a href={app.gcasfilelast.path} target="_blank" rel="noreferrer" className="text-emerald-600 flex items-center gap-1 font-black text-xs">
//                                                         <ExternalLink size={12}/> Final Confirmation
//                                                     </a>
//                                                 )
//                                             )}
//                                         </div>
//                                     </td>

//                                     <td className="p-5">
//                                         <div className="flex justify-center gap-3">
//                                             {editId === app._id ? (
//                                                 <>
//                                                     <button onClick={() => handleUpdate(app._id)} className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-100 hover:scale-110 transition-transform"><Save size={18}/></button>
//                                                     <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-600 p-2.5 rounded-xl hover:scale-110 transition-transform"><X size={18}/></button>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <button onClick={() => {setEditId(app._id); setEditForm(app);}} className="text-blue-500 bg-blue-50 p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit size={18}/></button>
//                                                     <button onClick={() => deleteRecord(app._id)} className="text-red-500 bg-red-50 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminPortal;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';
import { 
    Search, Download, Edit, Save, Trash2, ExternalLink, X, 
    CheckCircle, Clock, Users, FileText, AlertCircle, 
    Filter, Eye, ChevronDown, Printer, Upload, Shield,
    UserCheck, Calendar, Hash, Mail, Phone, Award,
    FolderOpen, Image, File, Link2, RefreshCw, Loader,
    User, SearchCode
} from 'lucide-react';

const AdminPortal = () => {
    const [applications, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState('name'); // 'name', 'marksheet', 'mobile'
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const API_URL = "https://gcasadmin.onrender.com/api/admin";

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
        
        // Apply search based on search type
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            
            switch(searchType) {
                case 'name':
                    filtered = filtered.filter(app => 
                        app.name?.toLowerCase().includes(term)
                    );
                    break;
                case 'marksheet':
                    filtered = filtered.filter(app => 
                        app.marksheet12Number?.toLowerCase().includes(term)
                    );
                    break;
                case 'mobile':
                    filtered = filtered.filter(app => 
                        app.mobile?.includes(term)
                    );
                    break;
                default:
                    filtered = filtered.filter(app => 
                        app.name?.toLowerCase().includes(term) ||
                        app.marksheet12Number?.toLowerCase().includes(term) ||
                        app.mobile?.includes(term)
                    );
            }
        }
        
        // Apply status filter
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
            if (key !== 'gcasfilelast' && key !== 'files') data.append(key, editForm[key]);
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
        if(window.confirm("⚠️ Are you sure you want to permanently delete this student record? This action cannot be undone.")) {
            try {
                await axios.delete(`${API_URL}/delete/${id}`);
                fetchAll();
                showToast("Record deleted successfully", "success");
            } catch (err) {
                showToast("Delete failed", "error");
            }
        }
    };

    const exportToExcel = () => {
        const excelData = filteredApps.map(app => ({
            "Student Name": app.name,
            "Mobile Number": app.mobile,
            "Email": app.email || "N/A",
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

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-100`}>
                    <Icon className={`text-${color}-600`} size={24} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto text-blue-600" size={48} />
                    <p className="mt-4 text-gray-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 animate-slide-in ${
                    toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                                    <Shield className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        GCAS Admin Portal
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Manage student applications and credentials
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <button 
                                onClick={exportToExcel} 
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-200 transition-all"
                            >
                                <Download size={18}/> 
                                Export Excel
                            </button>
                            <button 
                                onClick={fetchAll} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all"
                            >
                                <RefreshCw size={18}/>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Applications" value={stats.total} icon={Users} color="blue" />
                    <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" />
                    <StatCard title="Pending" value={stats.pending} icon={Clock} color="yellow" />
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Type Selector */}
                        <div className="lg:w-64">
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                Search By
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSearchType('name')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                        searchType === 'name'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <User size={16} />
                                    Name
                                </button>
                                <button
                                    onClick={() => setSearchType('marksheet')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                        searchType === 'marksheet'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Hash size={16} />
                                    Marksheet
                                </button>
                                <button
                                    onClick={() => setSearchType('mobile')}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                        searchType === 'mobile'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <Phone size={16} />
                                    Mobile
                                </button>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                {searchType === 'name' && 'Student Name'}
                                {searchType === 'marksheet' && '12th Marksheet Number'}
                                {searchType === 'mobile' && 'Mobile Number'}
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder={
                                        searchType === 'name' ? 'Search by student name...' :
                                        searchType === 'marksheet' ? 'Enter 12th marksheet number...' :
                                        'Enter mobile number...'
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="lg:w-64">
                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                Status Filter
                            </label>
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            >
                                <option value="all">All Applications</option>
                                <option value="completed">Completed (Has Credentials)</option>
                                <option value="pending">Pending (No Credentials)</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Results Info */}
                    {searchTerm && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-700">
                                <SearchCode size={18} />
                                <span className="text-sm font-medium">
                                    Found {filteredApps.length} result{filteredApps.length !== 1 && 's'} for "{searchTerm}" in {searchType}
                                </span>
                            </div>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Table Container */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                                <tr>
                                    <th className="p-5 text-sm font-semibold">Student Details</th>
                                    <th className="p-5 text-sm font-semibold">GCAS Credentials</th>
                                    <th className="p-5 text-sm font-semibold">Academic Info</th>
                                    <th className="p-5 text-sm font-semibold">Documents</th>
                                    <th className="p-5 text-sm font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApps.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-5">
                                            <div className="space-y-2">
                                                <div className="font-bold text-gray-800 text-base flex items-center gap-2">
                                                    {app.name}
                                                    {!app.gcasusername && (
                                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full animate-pulse">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {searchType === 'name' && searchTerm && app.name?.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                            Match
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Hash size={14} className="text-gray-400" />
                                                    <span className="font-mono text-xs">12th: {app.marksheet12Number || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span>{app.mobile}</span>
                                                </div>
                                                {app.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        <span className="text-xs truncate max-w-[180px]">{app.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="p-5">
                                            {editId === app._id ? (
                                                <div className="space-y-2">
                                                    <input 
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                                        placeholder="GCAS Username" 
                                                        defaultValue={app.gcasusername} 
                                                        onChange={(e) => setEditForm({...editForm, gcasusername: e.target.value})}
                                                    />
                                                    <input 
                                                        className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                                        placeholder="GCAS Password" 
                                                        defaultValue={app.gcaspassword} 
                                                        onChange={(e) => setEditForm({...editForm, gcaspassword: e.target.value})}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {app.gcasusername ? (
                                                        <>
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                                                <div className="text-xs text-gray-500 mb-1">Username</div>
                                                                <div className="font-mono text-sm font-semibold text-green-700">{app.gcasusername}</div>
                                                            </div>
                                                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                                                <div className="text-xs text-gray-500 mb-1">Password</div>
                                                                <div className="font-mono text-sm font-semibold text-green-700">{app.gcaspassword}</div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                                            <Clock size={16} className="inline text-yellow-600 mr-1" />
                                                            <span className="text-xs text-yellow-700">Credentials Not Generated</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-5">
                                            <div className="space-y-2 text-sm">
                                                {app.whofill && (
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck size={14} className="text-blue-500" />
                                                        <span className="text-gray-700">By: <span className="font-medium">{app.whofill}</span></span>
                                                    </div>
                                                )}
                                                {app.degree && (
                                                    <div className="flex items-center gap-2">
                                                        <Award size={14} className="text-purple-500" />
                                                        <span className="text-gray-700">{app.degree}</span>
                                                    </div>
                                                )}
                                                {app.medium && (
                                                    <div className="flex items-center gap-2">
                                                        <FileText size={14} className="text-gray-500" />
                                                        <span className="text-gray-700">Medium: {app.medium}</span>
                                                    </div>
                                                )}
                                                {app.date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-500" />
                                                        <span className="text-xs text-gray-500">{app.date}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div className="space-y-2">
                                                {app.files?.marksheet12?.[0]?.path && (
                                                    <a 
                                                        href={app.files.marksheet12[0].path} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium group/link"
                                                    >
                                                        <File size={14} />
                                                        <span>12th Marksheet</span>
                                                        <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition" />
                                                    </a>
                                                )}
                                                
                                                {editId === app._id ? (
                                                    <div className="mt-2">
                                                        <label className="block text-xs text-gray-500 mb-1">Upload Final Document</label>
                                                        <input 
                                                            type="file" 
                                                            className="text-xs w-full border border-gray-300 rounded-lg p-1.5"
                                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                                        />
                                                    </div>
                                                ) : (
                                                    app.gcasfilelast && (
                                                        <a 
                                                            href={app.gcasfilelast.path} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium group/link"
                                                        >
                                                            <Link2 size={14} />
                                                            <span>Final Document</span>
                                                            <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition" />
                                                        </a>
                                                    )
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                {editId === app._id ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleUpdate(app._id)} 
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all transform hover:scale-105"
                                                            title="Save Changes"
                                                        >
                                                            <Save size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditId(null)} 
                                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2.5 rounded-xl transition-all transform hover:scale-105"
                                                            title="Cancel"
                                                        >
                                                            <X size={18}/>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => {setEditId(app._id); setEditForm(app);}} 
                                                            className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white p-2.5 rounded-xl transition-all transform hover:scale-105"
                                                            title="Edit Application"
                                                        >
                                                            <Edit size={18}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteRecord(app._id)} 
                                                            className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white p-2.5 rounded-xl transition-all transform hover:scale-105"
                                                            title="Delete Record"
                                                        >
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
                            <div className="text-center py-16">
                                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">No applications found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm ? 'Try adjusting your search criteria' : 'No applications available'}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live Database Connected</span>
                        <div className="w-px h-4 bg-gray-300 mx-2"></div>
                        <span>Total Records: {applications.length}</span>
                        <div className="w-px h-4 bg-gray-300 mx-2"></div>
                        <span>Showing: {filteredApps.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
                        <span className="text-xs">+ F to search</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPortal;