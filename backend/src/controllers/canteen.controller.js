const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /canteen/menu
const getMenuItems = async (req, res) => {
    try {
        const menu = await prisma.menuItem.findMany({
            where: { isAvailable: true }
        });
        res.json(menu);
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
};

// POST /canteen/orders
const createOrder = async (req, res) => {
    try {
        const { items } = req.body; // Array of { menuItemId, quantity }
        const userId = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }

        // Calculate total and prepare order items
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem) return res.status(404).json({ error: `Item ${item.menuItemId} not found` });

            const itemTotal = menuItem.price * item.quantity;
            total += itemTotal;

            orderItemsData.push({
                menuItemId: menuItem.id,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        // In a real app, you would check/deduct balance from generic Student wallet here.

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'PENDING',
                items: {
                    create: orderItemsData
                }
            },
            include: { items: { include: { menuItem: true } } }
        });

        await prisma.notification.create({
            data: {
                userId,
                title: 'Order Placed',
                message: `Your canteen order has been placed successfully. Order total: $${total.toFixed(2)}`,
                type: 'SUCCESS'
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// GET /canteen/orders
const getOrders = async (req, res) => {
    try {
        const { role, id } = req.user;
        let orders = [];

        if (role === 'admin') {
            orders = await prisma.order.findMany({
                include: {
                    user: { select: { name: true } },
                    items: { include: { menuItem: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else { // student
            orders = await prisma.order.findMany({
                where: { userId: id },
                include: { items: { include: { menuItem: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// PUT /canteen/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });

        await prisma.notification.create({
            data: {
                userId: order.userId,
                title: 'Order Status Updated',
                message: `Your order status has been updated to ${status}.`,
                type: 'INFO'
            }
        });

        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// GET /canteen/menu/all  — Admin: see all menu items (inc. unavailable)
const getAllMenuItems = async (req, res) => {
    try {
        const menu = await prisma.menuItem.findMany({ orderBy: { category: 'asc' } });
        res.json(menu);
    } catch (error) {
        console.error('Get all menu error:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
};

// POST /canteen/menu  — Admin: create a new menu item
const createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, isAvailable } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }
        const item = await prisma.menuItem.create({
            data: { name, description: description || '', price: parseFloat(price), category, isAvailable: isAvailable !== false }
        });
        res.status(201).json(item);
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
};

// PUT /canteen/menu/:id  — Admin: update a menu item
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, isAvailable } = req.body;
        const item = await prisma.menuItem.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(category !== undefined && { category }),
                ...(isAvailable !== undefined && { isAvailable })
            }
        });
        res.json(item);
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
};

// DELETE /canteen/menu/:id  — Admin: delete a menu item
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({ where: { id } });
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
};

module.exports = { getMenuItems, getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, createOrder, getOrders, updateOrderStatus };
