import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { api } from '../../utils/api';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import Skeleton from '../../components/ui/Skeleton';

const FacultyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/tickets/${id}`, { status });
            await fetchTickets();
        } catch (err) {
            console.error('Update ticket error:', err);
        }
    };

    const statusFilters = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    const filteredTickets = tickets.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusBadge = (status) => {
        const map = { OPEN: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'outline' };
        return <Badge variant={map[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
    };
    const getPriorityBadge = (p) => {
        const map = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'outline' };
        return <Badge variant={map[p] || 'outline'}>{p}</Badge>;
    };

    if (isLoading) return (
        <div className="animate-fade-in">
            <Skeleton width="220px" height="38px" className="mb-6" />
            <Skeleton width="100%" height="48px" className="mb-4" />
            <Skeleton width="100%" height="300px" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Assigned Tickets</h1>
                    <p className="page-subtitle">Review and update student support tickets.</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="tickets-search-bar">
                <div className="tickets-search-input-wrap">
                    <Search size={18} className="tickets-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by title or student name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="tickets-search-input"
                    />
                    {searchTerm && (
                        <button className="tickets-search-clear" onClick={() => setSearchTerm('')}><X size={14} /></button>
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

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <CustomTable
                    columns={[
                        { key: 'id', header: 'ID' },
                        { key: 'student', header: 'Student' },
                        { key: 'title', header: 'Issue' },
                        { key: 'priority', header: 'Priority' },
                        { key: 'status', header: 'Status' },
                        { key: 'action', header: 'Update' }
                    ]}
                    data={filteredTickets.map(t => ({
                        id: <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '2px 8px', borderRadius: '6px' }}>#{t.id.substring(0, 8)}</span>,
                        student: <span style={{ fontWeight: 600 }}>{t.user?.name || 'Unknown'}</span>,
                        title: (
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>{t.title}</p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                        ),
                        priority: getPriorityBadge(t.priority),
                        status: getStatusBadge(t.status),
                        action: (
                            <select
                                value={t.status}
                                onChange={e => updateStatus(t.id, e.target.value)}
                                style={{
                                    padding: '6px 10px', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', background: 'var(--surface-color)',
                                    fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)',
                                    cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        )
                    }))}
                    emptyMessage="No tickets found."
                />
            </div>
        </motion.div>
    );
};

export default FacultyTicketsPage;
