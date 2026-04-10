import React, { useState, useEffect } from 'react';
import { Users, Ticket, CheckCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatisticCard from '../../components/ui/StatisticCard';
import CustomTable from '../../components/ui/CustomTable';
import Badge from '../../components/ui/Badge';
import ActivityFeed from '../../components/ui/ActivityFeed';
import { api } from '../../utils/api';
import { motion } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsData, ticketsData, timetableData] = await Promise.all([
                    api.get('/students'),
                    api.get('/tickets'),
                    api.get('/timetable/faculty')
                ]);
                setStudents(studentsData);
                setTickets(ticketsData);
                setTimetable(timetableData);
            } catch (error) {
                console.error("Error fetching faculty data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const recentStudents = students.slice(0, 4);
    const activeTicketsCount = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    const resolvedTicketsCount = tickets.filter(t => t.status === 'RESOLVED').length;

    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const todayClasses = timetable.filter(t => t.day === today);
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentClass = todayClasses.find(s => s.startTime <= currentTimeStr && s.endTime >= currentTimeStr);
    const distinctCourses = [...new Set(timetable.map(t => t.subject))].length;

    const recentActivities = [
        { id: 1, title: 'Directory Synced', description: `Verified ${students.length} student records today.`, time: '1 hour ago', type: 'success' },
        { id: 2, title: 'Ticket Updates', description: `${activeTicketsCount} tickets require your attention.`, time: '2 hours ago', type: 'warning' },
        { id: 3, title: 'Faculty Meeting', description: 'Scheduled for Friday 10:00 AM.', time: '2 days ago', type: 'primary' },
    ];

    if (isLoading) {
        return (
            <div className="animate-fade-in space-y-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <Skeleton width="250px" height="40px" className="mb-2" />
                        <Skeleton width="300px" height="20px" />
                    </div>
                    <Skeleton width="120px" height="40px" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card h-[140px] flex flex-col justify-between">
                            <Skeleton width="100px" height="16px" />
                            <Skeleton width="80px" height="32px" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card h-[300px]" />
                    <div className="card h-[300px]" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="page-header">
                <div>
                    <h1 className="page-title">Faculty Overview</h1>
                    <p className="page-subtitle">Manage your department and student relations.</p>
                </div>
                <div className="header-actions flex items-center gap-4">
                    <button className="btn btn-secondary" onClick={() => navigate('/faculty/directory')}>
                        <BookOpen size={18} /> View Directory
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatisticCard
                    title="Total Students"
                    value={students.length.toString()}
                    icon={Users}
                    trend="up"
                    trendValue="2.4"
                    colorClass="primary"
                />
                <StatisticCard
                    title="Assigned Tickets"
                    value={activeTicketsCount.toString()}
                    icon={Ticket}
                    trend="down"
                    trendValue="1.5"
                    colorClass="warning"
                />
                <StatisticCard
                    title="Resolved Tickets"
                    value={resolvedTicketsCount.toString()}
                    icon={CheckCircle}
                    trend="up"
                    trendValue="12"
                    colorClass="success"
                />
                <StatisticCard
                    title="Active Courses"
                    value={distinctCourses.toString()}
                    icon={BookOpen}
                    colorClass="info"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex-col gap-6 flex">
                    <div className="card glass-card hover-lift">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <BookOpen size={20} className="text-primary" /> Today's Teaching Schedule ({today})
                            </h2>
                        </div>
                        {todayClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todayClasses.map((item) => {
                                    const isCurrent = item.id === currentClass?.id;
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                                                isCurrent 
                                                ? 'bg-primary/10 border-primary shadow-glow ring-1 ring-primary/30 scale-[1.02]' 
                                                : 'bg-surface-color border-border-color opacity-90'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs ${isCurrent ? 'bg-primary text-white' : 'bg-bg-color text-muted'}`}>
                                                    <span>{item.startTime}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-main flex items-center gap-2">
                                                        {item.subject}
                                                        {isCurrent && <Badge variant="success" className="animate-pulse">Active Session</Badge>}
                                                    </h3>
                                                    <p className="text-sm text-secondary font-medium">{item.department} {item.year} Year • Room {item.roomNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-muted uppercase tracking-wider">{item.startTime} - {item.endTime}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-bg-color rounded-2xl border border-dashed border-border-color">
                                <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-muted font-medium">No classes scheduled for you today.</p>
                            </div>
                        )}
                    </div>

                    <div className="card glass-card hover-lift">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Recent Student Registrations</h2>
                            <button className="btn btn-ghost text-sm" onClick={() => navigate('/faculty/directory')}>View Directory</button>
                        </div>
                        <CustomTable
                            columns={[
                                { key: 'userId', header: 'ID (User)' },
                                { key: 'name', header: 'Name' },
                                { key: 'course', header: 'Course/Email' }
                            ]}
                            data={recentStudents.map(row => ({
                                userId: <span className="font-semibold font-mono text-primary-color">{row.userId.substring(0, 8)}...</span>,
                                name: <span className="font-medium text-main">{row.user.name}</span>,
                                course: <Badge variant="info">{row.course || row.user.email}</Badge>
                            }))}
                            emptyMessage="No recent students."
                        />
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="flex-col gap-6 flex">
                    <div className="card glass-card hover-lift">
                        <h2 className="text-lg font-bold mb-6">Department Feed</h2>
                        <ActivityFeed items={recentActivities} />
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default FacultyDashboard;
