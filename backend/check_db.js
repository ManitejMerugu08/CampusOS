const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkDB() {
    const users = await p.user.count();
    const menuItems = await p.menuItem.count();
    const orders = await p.order.count();
    const tickets = await p.ticket.count();

    console.log('=== CampusOS Database Stats ===');
    console.log('Users:', users);
    console.log('Menu Items:', menuItems);
    console.log('Orders:', orders);
    console.log('Tickets:', tickets);

    await p.$disconnect();
}
checkDB();
