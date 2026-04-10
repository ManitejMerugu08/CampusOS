const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// PUT /notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        if (notification.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

module.exports = { getNotifications, markAsRead };
