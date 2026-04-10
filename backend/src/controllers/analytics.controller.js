const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /analytics/overview
const getAnalyticsOverview = async (req, res) => {
    try {
        // Only admins
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 1. Tickets breakdown
        const tickets = await prisma.ticket.groupBy({
            by: ['status'],
            _count: { id: true }
        });

        const ticketStats = tickets.map(t => ({
            name: t.status,
            value: t._count.id
        }));

        // 2. Revenue over the last 7 days (mocking chronological data with current orders)
        // In a real app we would group by date. For this demo, since seed data is created at the same time,
        // we will just pull completed orders to chart them.

        const orders = await prisma.order.findMany({
            where: { status: 'COMPLETED' },
            select: { total: true, createdAt: true, id: true }
        });

        // Group by day for the chart (simplified)
        const revenueMap = {};
        orders.forEach(o => {
            const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!revenueMap[dateStr]) revenueMap[dateStr] = 0;
            revenueMap[dateStr] += o.total;
        });

        // Ensure we have at least some data points for the chart even if DB is fresh
        if (Object.keys(revenueMap).length === 0) {
            revenueMap['Today'] = 0;
            revenueMap['Yesterday'] = 0;
        }

        const revenueChartData = Object.keys(revenueMap).map(date => ({
            date,
            revenue: revenueMap[date]
        }));

        res.json({
            ticketStats,
            revenueChartData
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to aggregate analytics' });
    }
};

module.exports = { getAnalyticsOverview };
