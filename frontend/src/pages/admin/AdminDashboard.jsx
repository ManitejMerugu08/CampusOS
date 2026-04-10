import React, { useState, useEffect } from 'react';
import { Users, Server, AlertTriangle, Activity, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatisticCard from '../../components/ui/StatisticCard';
import CustomTable from '../../components/ui/CustomTable';
import Badge from '../../components/ui/Badge';
import ActivityFeed from '../../components/ui/ActivityFeed';
import { api } from '../../utils/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import Skeleton from '../../components/ui/Skeleton';

const AdminDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState({ ticketStats: [], revenueChartData: [] });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsData, ordersData, analyticsData] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/canteen/orders'),
                    api.get('/analytics/overview')
                ]);
                setTickets(ticketsData);
                setOrders(ordersData);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Compute stats
    const pendingTickets = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const systemAlerts = [
        { id: 1, title: 'High Server Load', description: 'Database CPU utilization at 85%.', time: '10 mins ago', type: 'danger' },
        { id: 2, title: 'New Faculty Account', description: 'Prof. Davis registration pending approval.', time: '2 hours ago', type: 'warning' },
        ...tickets.filter(t => t.priority === 'HIGH').slice(0, 2).map(t => ({
            id: `t-${t.id}`,
            title: 'High Priority Ticket',
            description: t.title,
            time: new Date(t.createdAt).toLocaleDateString(),
            type: 'danger'
        }))
    ];

    const recentTransactions = orders.slice(0, 4).map(o => ({
        id: `ORD-${o.id.substring(0, 4)}`,
        user: o.user.name,
        type: 'Canteen',
        amount: `₹${o.total.toFixed(2)}`,
        status: o.status === 'COMPLETED' ? 'Completed' : (o.status === 'CANCELLED' ? 'Failed' : 'Pending')
    }));

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <Badge variant="success">Completed</Badge>;
            case 'Pending': return <Badge variant="warning">Pending</Badge>;
            case 'Failed': return <Badge variant="danger">Failed</Badge>;
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
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            <div className="card h-[300px]" />
                            <div className="card h-[300px]" />
                        </div>
                        <div className="card h-[300px]" />
                    </div>
                    <div className="card h-[600px]" />
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
                    <h1 className="page-title">Admin Console</h1>
                    <p className="page-subtitle">System overview and critical alerts.</p>
                </div>
                <div className="header-actions flex items-center gap-4">
                    <button className="btn btn-primary" onClick={() => alert('Report generation coming soon!')}>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatisticCard
                    title="Total Tickets"
                    value={tickets.length.toString()}
                    icon={AlertTriangle}
                    trend="up"
                    trendValue="5.2"
                    colorClass="primary"
                />
                <StatisticCard
                    title="System Health"
                    value="98.9%"
                    icon={Activity}
                    trend="down"
                    trendValue="0.1"
                    colorClass="success"
                />
                <StatisticCard
                    title="Pending Tickets"
                    value={pendingTickets.toString()}
                    icon={AlertTriangle}
                    trend="down"
                    trendValue="12"
                    colorClass="warning"
                />
                <StatisticCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toFixed(2)}`}
                    icon={Coffee}
                    trend="up"
                    trendValue="8.4"
                    colorClass="info"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 flex-col gap-6 flex">

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <div className="card glass-card hover-lift">
                            <h2 className="text-lg font-bold mb-6">Revenue Trend</h2>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={analytics.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card glass-card hover-lift">
                            <h2 className="text-lg font-bold mb-6">Tickets by Status</h2>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={analytics.ticketStats}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {analytics.ticketStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-card hover-lift">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold">Recent Financial Transactions</h2>
                            <button className="btn btn-ghost text-sm" onClick={() => navigate('/admin/tickets')}>View All</button>
                        </div>
                        <CustomTable
                            columns={[
                                { key: 'id', header: 'ID' },
                                { key: 'user', header: 'User' },
                                { key: 'type', header: 'Type' },
                                { key: 'amount', header: 'Amount' },
                                { key: 'status', header: 'Status' }
                            ]}
                            data={recentTransactions.map(row => ({
                                id: <span className="font-semibold font-mono text-primary-color">{row.id}</span>,
                                user: <span className="font-medium text-main">{row.user}</span>,
                                type: <Badge variant="info">{row.type}</Badge>,
                                amount: <span className="font-bold text-main">{row.amount}</span>,
                                status: getStatusBadge(row.status)
                            }))}
                            emptyMessage="No recent transactions."
                        />
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="flex-col gap-6 flex">
                    <div className="card border-danger bg-danger-bg/10 hover-lift shadow-lg">
                        <h2 className="text-lg font-bold mb-6 text-danger"><AlertTriangle size={20} className="inline mr-2 -mt-1" />System Alerts</h2>
                        <ActivityFeed items={systemAlerts} />
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default AdminDashboard;
