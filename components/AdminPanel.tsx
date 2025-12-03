
import React, { useState, useEffect } from 'react';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement, fetchAllUsers, updateUserStatus } from '../services/db';
import { Announcement, AppUser } from '../types';
import { Shield, Megaphone, Users, Trash2, Plus, CheckCircle, Ban, Search, Crown, DollarSign, XCircle } from 'lucide-react';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'announcements'>('users');
    const [users, setUsers] = useState<AppUser[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    
    // Announcement Form
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await fetchAllUsers();
                setUsers(data);
            } else {
                const data = await fetchAnnouncements();
                setAnnouncements(data);
            }
        } catch (e) {
            console.error("Admin Load Error", e);
        }
        setLoading(false);
    };

    const handlePostAnnouncement = async () => {
        if (!newTitle || !newContent) return;
        const newAnn: Announcement = {
            id: Date.now().toString(),
            title: newTitle,
            content: newContent,
            type: newType,
            createdAt: Date.now(),
            createdBy: 'Admin',
            isActive: true
        };
        await createAnnouncement(newAnn);
        setNewTitle('');
        setNewContent('');
        loadData();
    };

    const handleDeleteAnn = async (id: string) => {
        if (window.confirm("Delete this announcement?")) {
            await deleteAnnouncement(id);
            loadData();
        }
    };

    const handleApproveSub = async (uid: string) => {
        if (window.confirm("Confirm payment received (50 THB) and activate subscription?")) {
            await updateUserStatus(uid, { subscriptionStatus: 'active' });
            loadData();
        }
    };

    const handleBanUser = async (uid: string, currentStatus: boolean | undefined) => {
        const action = currentStatus ? "Unban" : "Ban";
        if (window.confirm(`${action} this user?`)) {
            await updateUserStatus(uid, { isBanned: !currentStatus });
            loadData();
        }
    };
    
    const handleToggleAdmin = async (uid: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (window.confirm(`Change role to ${newRole}?`)) {
             await updateUserStatus(uid, { role: newRole });
             loadData();
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Shield className="text-emerald-500" size={32} /> Admin Backend
                </h1>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users size={16}/> Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('announcements')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === 'announcements' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Megaphone size={16}/> Announcements
                    </button>
                </div>
            </div>

            {loading ? <div className="text-center text-slate-500">Loading data...</div> : (
                <>
                {activeTab === 'users' && (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Subscription</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {users.map(u => (
                                        <tr key={u.uid} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{u.email}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">ID: {u.uid}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-900/30 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded text-xs font-bold ${
                                                    u.subscriptionStatus === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 
                                                    u.subscriptionStatus === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                                                }`}>
                                                    {u.subscriptionStatus === 'active' ? <CheckCircle size={12}/> : u.subscriptionStatus === 'pending' ? <DollarSign size={12}/> : <XCircle size={12}/>}
                                                    {u.subscriptionStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                 {u.isBanned ? <span className="text-red-500 font-bold">BANNED</span> : <span className="text-slate-400">Normal</span>}
                                            </td>
                                            <td className="p-4 flex justify-end gap-2">
                                                {u.subscriptionStatus !== 'active' && (
                                                    <button onClick={() => handleApproveSub(u.uid)} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded" title="Approve Payment (50 THB)">
                                                        <DollarSign size={16}/>
                                                    </button>
                                                )}
                                                <button onClick={() => handleToggleAdmin(u.uid, u.role)} className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded" title="Toggle Admin">
                                                    <Crown size={16}/>
                                                </button>
                                                <button onClick={() => handleBanUser(u.uid, u.isBanned)} className={`p-2 rounded text-white ${u.isBanned ? 'bg-slate-600' : 'bg-red-600 hover:bg-red-500'}`} title={u.isBanned ? "Unban" : "Ban"}>
                                                    <Ban size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 h-fit">
                            <h3 className="font-bold text-white mb-4">Post New Announcement</h3>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Title"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-emerald-500"
                                />
                                <textarea 
                                    placeholder="Message content..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-emerald-500 h-24"
                                />
                                <select 
                                    value={newType}
                                    onChange={e => setNewType(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white outline-none"
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Yellow)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="alert">Alert (Red)</option>
                                </select>
                                <button onClick={handlePostAnnouncement} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow-lg">
                                    Post Announcement
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                             {announcements.map(ann => (
                                 <div key={ann.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-start">
                                     <div>
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                                                 ann.type === 'info' ? 'bg-blue-600' : 
                                                 ann.type === 'warning' ? 'bg-yellow-600' :
                                                 ann.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                                             }`}>
                                                 {ann.type}
                                             </span>
                                             <span className="text-slate-500 text-xs">{new Date(ann.createdAt).toLocaleString()}</span>
                                         </div>
                                         <h4 className="text-white font-bold">{ann.title}</h4>
                                         <p className="text-slate-400 text-sm mt-1">{ann.content}</p>
                                     </div>
                                     <button onClick={() => handleDeleteAnn(ann.id)} className="text-slate-600 hover:text-red-400">
                                         <Trash2 size={16}/>
                                     </button>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
    );
};

export default AdminPanel;
