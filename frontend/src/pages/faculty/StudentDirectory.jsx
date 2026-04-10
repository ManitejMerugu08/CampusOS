import React, { useState, useEffect } from 'react';
import { Search, User, BookOpen, BarChart2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import CustomTable from '../../components/ui/CustomTable';
import { api } from '../../utils/api';

const StudentDirectory = () => {
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

    if (isLoading) return <div className="p-8 text-center text-muted">Loading student directory...</div>;

    const getGpaColor = (gpa) => {
        if (gpa >= 3.5) return 'success';
        if (gpa >= 2.5) return 'warning';
        return 'danger';
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Student Directory</h1>
                    <p className="page-subtitle">{students.length} students registered in your institution.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: List */}
                <div className="lg:col-span-2">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            className="input w-full pl-10"
                            placeholder="Search by name, email, or course..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="card p-0 overflow-hidden border-none shadow-[var(--shadow-md)]">
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
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                                            <User size={18} className="text-primary-color" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[0.95rem] text-main">{s.user.name}</p>
                                            <p className="text-[0.8rem] text-muted">{s.user.email}</p>
                                        </div>
                                    </div>
                                ),
                                course: <Badge variant="info">{s.course || 'N/A'}</Badge>,
                                year: <span className="text-muted font-medium">Year {s.year || 'N/A'}</span>,
                                gpa: <Badge variant={getGpaColor(s.gpa)}>{s.gpa?.toFixed(2) || 'N/A'}</Badge>,
                                attendance: <Badge variant={s.attendance >= 85 ? 'success' : 'danger'}>{s.attendance || 'N/A'}%</Badge>,
                                _originalRow: s // Keep reference for click handling
                            }))}
                            onRowClick={(row) => setSelected(row._originalRow)}
                            emptyMessage="No students match your search."
                        />
                    </div>
                </div>

                {/* Right: Profile Card */}
                <div>
                    {selected ? (
                        <div className="card sticky top-[6rem]">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 relative">
                                    <User size={36} className="text-primary-color" />
                                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface-color ${selected.attendance >= 85 ? 'bg-success' : 'bg-warning'}`}></div>
                                </div>
                                <h3 className="font-bold text-xl tracking-tight text-main">{selected.user.name}</h3>
                                <p className="text-muted text-[0.85rem] mt-1">{selected.user.email}</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-bg-color border border-border-light cursor-default hover:bg-surface-hover transition-colors">
                                    <div className="flex items-center gap-2 text-muted text-[0.85rem] font-medium"><BookOpen size={16} /> Course</div>
                                    <span className="font-bold text-main">{selected.course || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-bg-color border border-border-light cursor-default hover:bg-surface-hover transition-colors">
                                    <div className="flex items-center gap-2 text-muted text-[0.85rem] font-medium"><User size={16} /> Year</div>
                                    <span className="font-bold text-main">Year {selected.year || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-bg-color border border-border-light cursor-default hover:bg-surface-hover transition-colors">
                                    <div className="flex items-center gap-2 text-muted text-[0.85rem] font-medium"><BarChart2 size={16} /> GPA</div>
                                    <Badge variant={getGpaColor(selected.gpa)}>{selected.gpa?.toFixed(2) || 'N/A'}</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-bg-color border border-border-light cursor-default hover:bg-surface-hover transition-colors">
                                    <div className="flex items-center gap-2 text-muted text-[0.85rem] font-medium"><BarChart2 size={16} /> Attendance</div>
                                    <Badge variant={selected.attendance >= 85 ? 'success' : 'danger'}>{selected.attendance}%</Badge>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-16 text-muted sticky top-[6rem] border-dashed border-2">
                            <User size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium text-[0.95rem]">Click on a student to view their profile</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDirectory;
