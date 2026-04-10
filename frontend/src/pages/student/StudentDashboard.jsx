import React, { useState, useEffect } from 'react';
import { CreditCard, Ticket, Calendar, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatisticCard from '../../components/ui/StatisticCard';
import CustomTable from '../../components/ui/CustomTable';
import Badge from '../../components/ui/Badge';
import ActivityFeed from '../../components/ui/ActivityFeed';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { motion } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsData, ordersData, timetableData] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/canteen/orders'),
                    api.get('/timetable/student')
                ]);
                setTickets(ticketsData);
                setOrders(ordersData);
                setTimetable(timetableData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Compute stats
    const activeTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    const recentTickets = tickets.slice(0, 3);

    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const todayClasses = timetable.filter(t => t.day === today);
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextClass = todayClasses.find(s => s.startTime > currentTimeStr);
    const currentClass = todayClasses.find(s => s.startTime <= currentTimeStr && s.endTime >= currentTimeStr);

    // Create an activity feed combining recent tickets and orders
    const recentActivities = [
        ...tickets.slice(0, 2).map(t => ({
            id: `t-${t.id}`,
            title: 'Ticket Status',
            description: `Ticket "${t.title}" is ${t.status}`,
            time: new Date(t.updatedAt).toLocaleDateString(),
            type: t.status === 'RESOLVED' ? 'success' : 'warning'
        })),
        ...orders.slice(0, 2).map(o => ({
            id: `o-${o.id}`,
            title: 'Canteen Order',
            description: `Order total ₹${o.total.toFixed(2)} is ${o.status}`,
            time: new Date(o.updatedAt).toLocaleDateString(),
            type: o.status === 'COMPLETED' ? 'success' : 'info'
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RESOLVED': return <Badge variant="success">Resolved</Badge>;
            case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
            case 'CLOSED': return <Badge variant="outline">Closed</Badge>;
            case 'OPEN': return <Badge variant="info">Open</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

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
                    <h1 className="page-title">Student Overview</h1>
                    <p className="page-subtitle">Welcome back, {user?.name}. Here is what's happening today.</p>
                </div>
                <div className="header-actions flex items-center gap-4">
                    <button className="btn btn-primary" onClick={() => navigate('/student/canteen')}>
                        <Utensils size={18} /> Order Food
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatisticCard
                    title="Canteen Balance"
                    value="₹1,500.00"
                    icon={CreditCard}
                    trend="down"
                    trendValue="12"
                    colorClass="primary"
                />
                <StatisticCard
                    title="Active Tickets"
                    value={activeTickets.toString()}
                    icon={Ticket}
                    colorClass="warning"
                />
                <StatisticCard
                    title="Upcoming Classes"
                    value={todayClasses.filter(c => c.startTime > currentTimeStr).length.toString()}
                    icon={Calendar}
                    colorClass="info"
                />
                <StatisticCard
                    title="Meals Ordered"
                    value={orders.length.toString()}
                    icon={Utensils}
                    trend="up"
                    trendValue="8"
                    colorClass="success"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex-col gap-6 flex">

                    <div className="card glass-card hover-lift">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Recent Tickets</h2>
                            <button className="btn btn-ghost text-sm" onClick={() => navigate('/student/tickets')}>View All</button>
                        </div>
                        <CustomTable
                            headers={['Subject', 'Status', 'Last Updated']}
                            data={recentTickets}
                            renderRow={(row, index) => (
                                <tr key={index}>
                                    <td className="font-semibold text-main">{row.title}</td>
                                    <td>{getStatusBadge(row.status)}</td>
                                    <td className="text-muted">{new Date(row.updatedAt).toLocaleDateString()}</td>
                                </tr>
                            )}
                        />
                    </div>

                    <div className="card glass-card hover-lift border-primary/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Calendar size={20} className="text-primary" /> Today's Schedule ({today})
                            </h2>
                        </div>
                        {todayClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todayClasses.map((item, idx) => {
                                    const isCurrent = item.id === currentClass?.id;
                                    const isNext = item.id === nextClass?.id;
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                                                isCurrent 
                                                ? 'bg-primary/10 border-primary shadow-glow ring-1 ring-primary/30 scale-[1.02]' 
                                                : isNext 
                                                ? 'bg-surface-color border-primary/30 border-dashed opacity-90' 
                                                : 'bg-surface-color border-border-color opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs ${isCurrent ? 'bg-primary text-white' : 'bg-bg-color text-muted'}`}>
                                                    <span>{item.startTime}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-main flex items-center gap-2">
                                                        {item.subject}
                                                        {isCurrent && <Badge variant="success" className="animate-pulse">Ongoing</Badge>}
                                                        {isNext && <Badge variant="info">Upcoming</Badge>}
                                                    </h3>
                                                    <p className="text-sm text-secondary font-medium">{item.facultyName} • Room {item.roomNumber}</p>
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
                                <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-muted font-medium">No classes scheduled for today.</p>
                                <p className="text-xs text-muted/60 mt-1">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="flex-col gap-6 flex">
                    <div className="card glass-card hover-lift">
                        <h2 className="text-lg font-bold mb-6">Activity Feed</h2>
                        {recentActivities.length > 0 ? (
                            <ActivityFeed items={recentActivities} />
                        ) : (
                            <p className="text-muted text-sm pb-4">No recent activity.</p>
                        )}
                    </div>

                    {/* Quick Action Widget */}
                    <div className="card bg-gradient-primary text-white border-0 hover-lift shadow-glow">
                        <h2 className="text-lg font-bold mb-2">Need Help?</h2>
                        <p className="text-sm opacity-90 mb-6">Open a new support ticket for IT or Maintenance.</p>
                        <button className="btn w-full bg-white text-primary hover:bg-gray-50 font-bold border-0 shadow-sm" onClick={() => navigate('/student/tickets')}>
                            Create Ticket
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
