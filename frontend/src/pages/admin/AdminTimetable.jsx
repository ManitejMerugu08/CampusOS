import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Calendar, BookOpen, User, MapPin, Search } from 'lucide-react';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import Skeleton from '../../components/ui/Skeleton';

const EMPTY_FORM = { department: '', year: '', day: '', subject: '', facultyName: '', startTime: '', endTime: '', roomNumber: '' };
const DEPARTMENTS = ['Blockchain', 'CSE', 'AI', 'Data Science', 'Other'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTimetable() {
    const [timetable, setTimetable] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    const [filters, setFilters] = useState({ department: '', year: '' });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchTimetable = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const data = await api.get(`/timetable/all?${query}`);
            setTimetable(data);
        } catch (err) {
            console.error('Fetch timetable error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTimetable(); }, [filters]);

    const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ ...item, year: item.year.toString() }); setShowModal(true); };
    const closeModal = () => { setShowModal(false); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editItem) {
                await api.put(`/timetable/${editItem.id}`, form);
                showToast('Timetable entry updated!');
            } else {
                await api.post('/timetable', form);
                showToast('New entry added!');
            }
            closeModal();
            fetchTimetable();
        } catch (err) {
            showToast('Failed to save entry.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete ${item.subject} on ${item.day}?`)) return;
        try {
            await api.delete(`/timetable/${item.id}`);
            showToast('Deleted successfully.');
            fetchTimetable();
        } catch (err) {
            showToast('Deletion failed.');
        }
    };

    if (isLoading) return (
        <div className="animate-fade-in">
            <Skeleton width="220px" height="38px" className="mb-6" />
            <Skeleton width="100%" height="48px" className="mb-4" />
            <Skeleton width="100%" height="350px" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 right-6 z-[9999] bg-text-main text-white px-5 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2"
                    >
                        <Calendar size={16} /> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Timetable Management</h1>
                    <p className="page-subtitle">Schedule and manage classes across all departments.</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={18} /> Add Entry
                </button>
            </div>

            {/* Filters */}
            <div className="card glass-card mb-6 p-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Search size={18} className="text-muted" />
                    <span className="font-bold text-sm text-secondary uppercase tracking-widest">Filters:</span>
                </div>
                <select 
                    className="form-input !w-48 !mb-0" 
                    value={filters.department} 
                    onChange={e => setFilters({ ...filters, department: e.target.value })}
                >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                    className="form-input !w-32 !mb-0" 
                    value={filters.year} 
                    onChange={e => setFilters({ ...filters, year: e.target.value })}
                >
                    <option value="">All Years</option>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <CustomTable
                    columns={[
                        { key: 'slot', header: 'Time Slot' },
                        { key: 'subject', header: 'Subject & Faculty' },
                        { key: 'meta', header: 'Dept / Year' },
                        { key: 'room', header: 'Room' },
                        { key: 'actions', header: 'Actions' }
                    ]}
                    data={timetable.map(slot => ({
                        slot: (
                            <div className="flex flex-col">
                                <span className="font-bold text-primary">{slot.day}</span>
                                <span className="text-xs text-muted">{slot.startTime} - {slot.endTime}</span>
                            </div>
                        ),
                        subject: (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-bg-color flex items-center justify-center">
                                    <BookOpen size={18} className="text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-main">{slot.subject}</span>
                                    <span className="text-xs text-muted flex items-center gap-1"><User size={12} /> {slot.facultyName}</span>
                                </div>
                            </div>
                        ),
                        meta: (
                            <div className="flex gap-2">
                                <Badge variant="info">{slot.department}</Badge>
                                <Badge variant="outline">Year {slot.year}</Badge>
                            </div>
                        ),
                        room: (
                            <span className="flex items-center gap-1 font-medium text-secondary">
                                <MapPin size={14} /> {slot.roomNumber}
                            </span>
                        ),
                        actions: (
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(slot)} className="p-2 rounded-lg hover:bg-bg-color text-blue-500 transition-colors">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(slot)} className="p-2 rounded-lg hover:bg-bg-color text-danger transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )
                    }))}
                    emptyMessage="No timetable entries found."
                />
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="modal-card max-w-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-card-header">
                                <div className="modal-card-header-icon"><Calendar size={22} /></div>
                                <div>
                                    <h2 className="modal-card-title">{editItem ? 'Edit Entry' : 'Add New Entry'}</h2>
                                    <p className="modal-card-subtitle">Define a new class slot in the schedule.</p>
                                </div>
                                <button className="modal-card-close" onClick={closeModal}><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSave} className="modal-card-body">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                                            <option value="">Select Dept</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Academic Year</label>
                                        <select className="form-input" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required>
                                            <option value="">Select Year</option>
                                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Day</label>
                                        <select className="form-input" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} required>
                                            <option value="">Select Day</option>
                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Room Number</label>
                                        <input className="form-input" placeholder="e.g. 301 or Lab 2" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} required />
                                    </div>
                                    <div className="form-group col-span-2">
                                        <label className="form-label">Subject Name</label>
                                        <input className="form-input" placeholder="e.g. Blockchain Fundamentals" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                                    </div>
                                    <div className="form-group col-span-2">
                                        <label className="form-label">Faculty Name</label>
                                        <input className="form-input" placeholder="e.g. Prof. Shilpa" value={form.facultyName} onChange={e => setForm({ ...form, facultyName: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Start Time</label>
                                        <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Time</label>
                                        <input className="form-input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="modal-card-actions">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : (editItem ? 'Update Entry' : 'Create Entry')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
