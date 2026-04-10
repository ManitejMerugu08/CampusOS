import React, { useState, useEffect } from 'react';
import { Search, User, BookOpen, BarChart2 } from 'lucide-react';
import { api } from '../../utils/api';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import Skeleton from '../../components/ui/Skeleton';

const AdminStudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.get('/students');
                setStudents(data);
            } catch (err) {
                console.error('Fetch students error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filtered = students.filter(s =>
        s.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.course || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getGpaColor = (gpa) => {
        if (gpa >= 3.5) return 'success';
        if (gpa >= 2.5) return 'warning';
        return 'danger';
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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manage Students</h1>
                    <p className="page-subtitle">{students.length} students registered in the system.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: List */}
                <div className="lg:col-span-2">
                    <div className="relative mb-4">
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input w-full"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Search students by name, email, or course..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <CustomTable
                            columns={[
                                { key: 'student', header: 'Student' },
                                { key: 'course', header: 'Course' },
                                { key: 'year', header: 'Year' },
                                { key: 'gpa', header: 'GPA' },
                                { key: 'attendance', header: 'Attendance' }
                            ]}
                            data={filtered.map(s => ({
                                student: (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <User size={18} style={{ color: 'var(--primary-color)' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', margin: 0 }}>{s.user.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{s.user.email}</p>
                                        </div>
                                    </div>
                                ),
                                course: <Badge variant="info">{s.course || 'N/A'}</Badge>,
                                year: <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Year {s.year || 'N/A'}</span>,
                                gpa: <Badge variant={getGpaColor(s.gpa)}>{s.gpa?.toFixed(2) || 'N/A'}</Badge>,
                                attendance: <Badge variant={s.attendance >= 85 ? 'success' : 'danger'}>{s.attendance || 'N/A'}%</Badge>,
                                _originalRow: s
                            }))}
                            onRowClick={row => setSelected(row._originalRow)}
                            emptyMessage="No students match your search."
                        />
                    </div>
                </div>

                {/* Right: Profile Card */}
                <div>
                    {selected ? (
                        <div className="card sticky" style={{ top: '6rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative' }}>
                                    <User size={32} style={{ color: 'var(--primary-color)' }} />
                                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--surface-color)', backgroundColor: selected.attendance >= 85 ? 'var(--success)' : 'var(--warning)' }}></div>
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-main)', margin: '0 0 4px' }}>{selected.user.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{selected.user.email}</p>
                            </div>

                            {[
                                { icon: <BookOpen size={16} />, label: 'Course', value: selected.course || 'N/A' },
                                { icon: <User size={16} />, label: 'Year', value: `Year ${selected.year || 'N/A'}` },
                                { icon: <BarChart2 size={16} />, label: 'GPA', value: <Badge variant={getGpaColor(selected.gpa)}>{selected.gpa?.toFixed(2)}</Badge> },
                                { icon: <BarChart2 size={16} />, label: 'Attendance', value: <Badge variant={selected.attendance >= 85 ? 'success' : 'danger'}>{selected.attendance}%</Badge> },
                                { icon: <BarChart2 size={16} />, label: 'Balance', value: `₹${selected.balance?.toFixed(2) || '0.00'}` },
                            ].map(({ icon, label, value }) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-light)', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{icon} {label}</div>
                                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', borderWidth: '2px', position: 'sticky', top: '6rem' }}>
                            <User size={48} style={{ margin: '0 auto 16px', opacity: 0.15, color: 'var(--text-muted)' }} />
                            <p style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Click on a student to view their profile</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminStudentsPage;
