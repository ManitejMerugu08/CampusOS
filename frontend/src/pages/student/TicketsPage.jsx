import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, Search, Filter, Clock, ChevronRight, Ticket, Sparkles } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';
import CustomTable from '../../components/ui/CustomTable';

const TicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchTickets = async () => {
        try {
            const data = await api.get('/tickets');
            setTickets(data);
        } catch (err) {
            console.error('Fetch tickets error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) { setError('Please fill in all fields.'); return; }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/tickets', form);
            setForm({ title: '', description: '', priority: 'MEDIUM' });
            setShowForm(false);
            await fetchTickets();
        } catch (err) {
            setError('Failed to create ticket. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = { OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'outline' };
        return <Badge variant={map[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
    };

    const getPriorityBadge = (priority) => {
        const map = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'outline' };
        return <Badge variant={map[priority] || 'outline'}>{priority}</Badge>;
    };

    const priorityColor = (p) => {
        if (p === 'HIGH') return '#EF4444';
        if (p === 'MEDIUM') return '#F59E0B';
        return '#94A3B8';
    };

    const statusFilters = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const columns = [
        { key: 'id', header: 'Ticket ID' },
        { key: 'title', header: 'Issue Title' },
        { key: 'priority', header: 'Priority' },
        { key: 'status', header: 'Status' },
        { key: 'createdAt', header: 'Date Submitted' }
    ];

    const tableData = filteredTickets.map(t => ({
        id: <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '6px' }}>#{t.id.substring(0, 8)}</span>,
        title: (
            <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 2px' }}>{t.title}</p>
                <p style={{ fontSize: '0.835rem', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</p>
            </div>
        ),
        priority: getPriorityBadge(t.priority),
        status: getStatusBadge(t.status),
        createdAt: <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
    }));

    if (isLoading) {
        return (
            <div className="animate-fade-in" style={{ padding: '0' }}>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <Skeleton width="200px" height="36px" className="mb-2" />
                        <Skeleton width="280px" height="18px" />
                    </div>
                    <Skeleton width="130px" height="42px" />
                </div>
                <Skeleton width="100%" height="48px" className="mb-6" />
                <div className="flex flex-col gap-4">
                    <Skeleton width="100%" height="300px" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Tickets</h1>
                    <p className="page-subtitle">Submit and track your support requests.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ gap: '8px' }}>
                        <Plus size={18} /> New Ticket
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="tickets-search-bar">
                <div className="tickets-search-input-wrap">
                    <Search size={18} className="tickets-search-icon" />
                    <input
                        type="text"
                        placeholder="Search tickets by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="tickets-search-input"
                    />
                    {searchTerm && (
                        <button className="tickets-search-clear" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="tickets-filter-chips">
                    <Filter size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    {statusFilters.map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`tickets-filter-chip ${filterStatus === status ? 'tickets-filter-chip-active' : ''}`}
                        >
                            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ticket Cards */}
            <div className="mt-4">
                {filteredTickets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="tickets-empty"
                    >
                        <div className="tickets-empty-icon">
                            <Ticket size={32} />
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                            {searchTerm || filterStatus !== 'ALL' ? 'No tickets match your filters' : "You haven't submitted any tickets yet"}
                        </h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                            {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your search or filter criteria.' : 'Create your first support ticket to get started.'}
                        </p>
                        {!searchTerm && filterStatus === 'ALL' && (
                            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ gap: '8px' }}>
                                <Sparkles size={16} /> Create your first ticket
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <CustomTable
                            columns={columns}
                            data={tableData}
                            emptyMessage="No tickets match."
                        />
                    </motion.div>
                )}
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => { setShowForm(false); setError(''); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="modal-card"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="modal-card-header">
                                <div className="modal-card-header-icon">
                                    <Ticket size={22} />
                                </div>
                                <div>
                                    <h2 className="modal-card-title">Create Support Ticket</h2>
                                    <p className="modal-card-subtitle">We'll get back to you as soon as possible.</p>
                                </div>
                                <button className="modal-card-close" onClick={() => { setShowForm(false); setError(''); }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="modal-card-body">
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="modal-error"
                                        >
                                            <AlertCircle size={16} /> {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g., Wi-Fi not working in Library"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="Describe the issue in detail so we can help you faster..."
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <div className="priority-selector">
                                        {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setForm({ ...form, priority: p })}
                                                className={`priority-option ${form.priority === p ? 'priority-option-active' : ''}`}
                                                data-priority={p.toLowerCase()}
                                            >
                                                <span className="priority-dot" style={{ background: priorityColor(p) }} />
                                                {p.charAt(0) + p.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-card-actions">
                                    <button type="button" className="btn-modal-cancel" onClick={() => { setShowForm(false); setError(''); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-modal-submit" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <span className="btn-spinner" /> Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> Submit Ticket
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TicketsPage;
