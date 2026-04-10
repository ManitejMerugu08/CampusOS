const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting clear and seed process...');

    // 0. Clean DB
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();

    // Password for all seeded accounts "password123"
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    console.log('Seeding Admin...');
    await prisma.user.create({
        data: { name: 'Admin', email: 'admin@campusos.edu', password: defaultPassword, role: 'admin' }
    });

    // 2. Create Faculty
    console.log('Seeding Faculty...');
    const faculty1 = await prisma.user.create({
        data: { name: 'Shilpa', email: 'shilpa@faculty.campusos.edu', password: defaultPassword, role: 'faculty' }
    });
    await prisma.faculty.create({
        data: { userId: faculty1.id, department: 'Computer Science' }
    });

    const faculty2 = await prisma.user.create({
        data: { name: 'Krishna', email: 'krishna@faculty.campusos.edu', password: defaultPassword, role: 'faculty' }
    });
    await prisma.faculty.create({
        data: { userId: faculty2.id, department: 'Blockchain' }
    });

    // 3. Create Students
    console.log('Seeding Students...');
    const studentsData = [
        { name: 'Manitej', rollNo: '2411CS070024', dept: 'Blockchain', year: 2, gpa: 8.5, attendance: 92, feeStatus: 'Paid' },
        { name: 'Alice', rollNo: '2411CS070025', dept: 'CSE', year: 3, gpa: 7.9, attendance: 85, feeStatus: 'Paid' },
        { name: 'Bob', rollNo: '2411CS070026', dept: 'AI', year: 1, gpa: 9.1, attendance: 98, feeStatus: 'Pending' },
        { name: 'Charlie', rollNo: '2411CS070027', dept: 'Data Science', year: 4, gpa: 8.2, attendance: 76, feeStatus: 'Paid' },
        { name: 'Diana', rollNo: '2411CS070028', dept: 'Blockchain', year: 2, gpa: 7.5, attendance: 88, feeStatus: 'Paid' },
        { name: 'Eve', rollNo: '2411CS070029', dept: 'CSE', year: 2, gpa: 8.9, attendance: 95, feeStatus: 'Pending' },
        { name: 'Frank', rollNo: '2411CS070030', dept: 'AI', year: 3, gpa: 6.8, attendance: 70, feeStatus: 'Paid' },
        { name: 'Grace', rollNo: '2411CS070031', dept: 'Data Science', year: 1, gpa: 9.5, attendance: 99, feeStatus: 'Paid' },
        { name: 'Harry', rollNo: '2411CS070032', dept: 'Blockchain', year: 4, gpa: 8.0, attendance: 81, feeStatus: 'Pending' },
        { name: 'Ivy', rollNo: '2411CS070033', dept: 'CSE', year: 2, gpa: 9.2, attendance: 90, feeStatus: 'Paid' }
    ];

    const studentUsers = [];
    for (let i = 0; i < studentsData.length; i++) {
        const sData = studentsData[i];
        const user = await prisma.user.create({
            data: {
                name: sData.name,
                email: `${sData.name.toLowerCase()}@campusos.edu`,
                password: defaultPassword,
                role: 'student'
            }
        });
        studentUsers.push(user);

        await prisma.student.create({
            data: {
                userId: user.id,
                rollNo: sData.rollNo,
                department: sData.dept,
                course: 'B.Tech',
                year: sData.year,
                gpa: sData.gpa,
                attendance: sData.attendance,
                feeStatus: sData.feeStatus,
                balance: Math.floor(Math.random() * 5000) + 1000
            }
        });
    }

    console.log('Users and Roles created.');

    // 4. Create Menu Items
    console.log('Seeding Canteen Menu...');
    const menuData = [
        { name: 'Paneer Butter Masala', description: 'Rich and creamy cottage cheese curry.', price: 180.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80&w=400' },
        { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken, exotic spices.', price: 250.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=400' },
        { name: 'Chole Bhature', description: 'Spicy chickpea curry served with fried bread.', price: 150.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400' },
        { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato mixture.', price: 120.00, category: 'Mains', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=400' },
        { name: 'Cold Coffee', description: 'Chilled coffee blended with milk and sugar.', price: 80.00, category: 'Beverages', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400' },
        { name: 'Mango Lassi', description: 'Sweet and creamy yogurt-based mango drink.', price: 90.00, category: 'Beverages', image: 'https://images.unsplash.com/photo-1546850422-0d20739c941c?auto=format&fit=crop&q=80&w=400' },
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes.', price: 40.00, category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400' },
        { name: 'Gulab Jamun (2 pcs)', description: 'Deep-fried sweets soaked in sugar syrup.', price: 60.00, category: 'Desserts', image: 'https://images.unsplash.com/photo-1593701461250-d7b21841ced1?auto=format&fit=crop&q=80&w=400' }
    ];

    for (const item of menuData) {
        await prisma.menuItem.create({ data: item });
    }

    // 5. Create Timetable (Blockchain 2nd Year)
    console.log('Seeding Timetable...');
    const timetableData = [
        // Monday
        { day: 'Monday', subject: 'Blockchain Fundamentals', facultyName: 'Shilpa', startTime: '09:00', endTime: '10:00', roomNumber: '301' },
        { day: 'Monday', subject: 'Data Structures', facultyName: 'Krishna', startTime: '10:00', endTime: '11:00', roomNumber: '302' },
        { day: 'Monday', subject: 'Cryptography', facultyName: 'Krishna', startTime: '11:00', endTime: '12:00', roomNumber: '405' },
        { day: 'Monday', subject: 'Smart Contract Dev', facultyName: 'Shilpa', startTime: '14:00', endTime: '15:30', roomNumber: 'Lab 1' },
        
        // Tuesday
        { day: 'Tuesday', subject: 'Network Security', facultyName: 'Shilpa', startTime: '09:00', endTime: '10:30', roomNumber: '301' },
        { day: 'Tuesday', subject: 'Distributed Systems', facultyName: 'Krishna', startTime: '10:30', endTime: '12:00', roomNumber: '302' },
        
        // Wednesday
        { day: 'Wednesday', subject: 'Blockchain Fundamentals', facultyName: 'Shilpa', startTime: '09:00', endTime: '10:00', roomNumber: '301' },
        { day: 'Wednesday', subject: 'Mathematics III', facultyName: 'Krishna', startTime: '10:00', endTime: '11:30', roomNumber: '302' },
        { day: 'Wednesday', subject: 'Web3 Paradigms', facultyName: 'Shilpa', startTime: '13:00', endTime: '14:30', roomNumber: '401' },
        
        // Thursday
        { day: 'Thursday', subject: 'Data Structures', facultyName: 'Krishna', startTime: '09:00', endTime: '11:00', roomNumber: 'Lab 2' },
        { day: 'Thursday', subject: 'Ethics in AI/BC', facultyName: 'Shilpa', startTime: '11:00', endTime: '12:00', roomNumber: '301' },
        
        // Friday
        { day: 'Friday', subject: 'Consensus Algorithms', facultyName: 'Krishna', startTime: '09:00', endTime: '10:30', roomNumber: '405' },
        { day: 'Friday', subject: 'Blockchain Dev Lab', facultyName: 'Shilpa', startTime: '10:30', endTime: '13:00', roomNumber: 'Lab 10' }
    ];

    for (const slot of timetableData) {
        await prisma.timetable.create({
            data: {
                ...slot,
                department: 'Blockchain',
                year: 2
            }
        });
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
