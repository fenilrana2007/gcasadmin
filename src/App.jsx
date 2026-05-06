import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Search, Download, Edit, Save, Trash2, ExternalLink, X, CheckCircle, Clock } from 'lucide-react';

const AdminPortal = () => {
    const [applications, setApps] = useState([]);
    const [search, setSearch] = useState("");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const API_URL = "https://gcasadmin.onrender.com/api/admin";

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const res = await axios.get(`${API_URL}/applications`);
            setApps(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const handleUpdate = async (id) => {
        const data = new FormData();
        // Append all text fields from the edit state
        Object.keys(editForm).forEach(key => {
            if (key !== 'gcasfilelast' && key !== 'files') data.append(key, editForm[key]);
        });
        // Append the new file if one was selected
        if (selectedFile) data.append('gcasfilelast', selectedFile);

        try {
            await axios.put(`${API_URL}/update/${id}`, data);
            setEditId(null);
            setSelectedFile(null);
            fetchAll();
            alert("Database Updated Successfully!");
        } catch (err) { alert("Update Failed. Check console."); }
    };

    const deleteRecord = async (id) => {
        if(window.confirm("Permanently delete this student record?")) {
            await axios.delete(`${API_URL}/delete/${id}`);
            fetchAll();
        }
    };

    const exportToExcel = () => {
        const excelData = applications.map(app => ({
            "Student Name": app.name,
            "12th Marksheet No": app.marksheet12Number || "N/A",
            "Mobile": app.mobile,
            "GCAS User": app.gcasusername || "Pending",
            "GCAS Pass": app.gcaspassword || "Pending",
            "Final Doc Link": app.gcasfilelast?.path || "Not Uploaded",
            "Filled By": app.whofill || "---",
            "Medium": app.medium || "---",
            "Degree": app.degree || "---",
            "Entry Date": app.date || "---",
            "Entry Timing": app.timing || "---"
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GCAS_Master_Sheet");
        XLSX.writeFile(wb, `GCAS_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800">GCAS ADMIN <span className="text-blue-600">PORTAL</span></h1>
                    <p className="text-slate-500 font-medium">Manage student applications and login credentials</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            placeholder="Search 12th Marksheet No..." 
                            className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-green-100 transition-all">
                        <Download size={18}/> Export Excel
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-widest">
                            <tr>
                                <th className="p-5">Student Info</th>
                                <th className="p-5">GCAS Credentials</th>
                                <th className="p-5">Processing Details</th>
                                <th className="p-5">Documents</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.filter(a => a.marksheet12Number?.includes(search)).map(app => (
                                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-800 text-base">{app.name}</div>
                                        <div className="text-blue-600 font-semibold text-xs mt-1">12th No: {app.marksheet12Number || "PENDING"}</div>
                                        <div className="text-slate-400 text-[11px] mt-1 italic">{app.mobile}</div>
                                    </td>
                                    
                                    <td className="p-5">
                                        {editId === app._id ? (
                                            <div className="flex flex-col gap-2">
                                                <input className="border p-2 rounded-lg text-xs" placeholder="User ID" defaultValue={app.gcasusername} onChange={(e)=>setEditForm({...editForm, gcasusername: e.target.value})}/>
                                                <input className="border p-2 rounded-lg text-xs" placeholder="Password" defaultValue={app.gcaspassword} onChange={(e)=>setEditForm({...editForm, gcaspassword: e.target.value})}/>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="text-xs font-mono bg-slate-100 p-1 px-2 rounded">U: {app.gcasusername || "---"}</div>
                                                <div className="text-xs font-mono bg-slate-100 p-1 px-2 rounded">P: {app.gcaspassword || "---"}</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-5">
                                        {editId === app._id ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <input className="border p-2 text-xs rounded-lg" placeholder="Filled By" defaultValue={app.whofill} onChange={(e)=>setEditForm({...editForm, whofill: e.target.value})}/>
                                                <input className="border p-2 text-xs rounded-lg" placeholder="Degree" defaultValue={app.degree} onChange={(e)=>setEditForm({...editForm, degree: e.target.value})}/>
                                                <input className="border p-2 text-xs rounded-lg" placeholder="Medium" defaultValue={app.medium} onChange={(e)=>setEditForm({...editForm, medium: e.target.value})}/>
                                                <input className="border p-2 text-xs rounded-lg" type="date" defaultValue={app.date} onChange={(e)=>setEditForm({...editForm, date: e.target.value})}/>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-600 space-y-1">
                                                <div className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/> By: {app.whofill || "---"}</div>
                                                <div className="flex items-center gap-1"><Clock size={12} className="text-blue-500"/> {app.degree || "---"}</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-5">
                                        <div className="flex flex-col gap-2">
                                            <a href={app.files?.marksheet12?.[0]?.path} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline text-xs font-bold">
                                                <ExternalLink size={12}/> View 12th Marksheet
                                            </a>
                                            {editId === app._id ? (
                                                <input type="file" className="text-[10px] mt-2" onChange={(e)=>setSelectedFile(e.target.files[0])}/>
                                            ) : (
                                                app.gcasfilelast && (
                                                    <a href={app.gcasfilelast.path} target="_blank" rel="noreferrer" className="text-emerald-600 flex items-center gap-1 font-black text-xs">
                                                        <ExternalLink size={12}/> Final Confirmation
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-5">
                                        <div className="flex justify-center gap-3">
                                            {editId === app._id ? (
                                                <>
                                                    <button onClick={() => handleUpdate(app._id)} className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-100 hover:scale-110 transition-transform"><Save size={18}/></button>
                                                    <button onClick={() => setEditId(null)} className="bg-slate-200 text-slate-600 p-2.5 rounded-xl hover:scale-110 transition-transform"><X size={18}/></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => {setEditId(app._id); setEditForm(app);}} className="text-blue-500 bg-blue-50 p-2.5 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit size={18}/></button>
                                                    <button onClick={() => deleteRecord(app._id)} className="text-red-500 bg-red-50 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPortal;