const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /tickets
const createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const userId = req.user.id;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                userId
            }
        });

        await prisma.notification.create({
            data: {
                userId,
                title: 'Ticket Created',
                message: `Your ticket "${title}" has been created successfully.`,
                type: 'SUCCESS'
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

// GET /tickets
const getTickets = async (req, res) => {
    try {
        const { role, id } = req.user;
        let tickets = [];

        if (role === 'admin' || role === 'faculty') {
            // Admins and faculty can see all tickets (for simplicity in this demo)
            tickets = await prisma.ticket.findMany({
                include: { user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Students only see their own tickets
            tickets = await prisma.ticket.findMany({
                where: { userId: id },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(tickets);
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// PUT /tickets/:id
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
        const role = req.user.role;

        if (role === 'student' && status !== 'CLOSED') {
            return res.status(403).json({ error: 'Students can only close their tickets' });
        }

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status }
        });

        await prisma.notification.create({
            data: {
                userId: ticket.userId,
                title: 'Ticket Status Updated',
                message: `Your ticket "${ticket.title}" status is now ${status}.`,
                type: 'INFO'
            }
        });

        res.json(ticket);
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};

module.exports = { createTicket, getTickets, updateTicketStatus };
