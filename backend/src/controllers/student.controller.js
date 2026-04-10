const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /students
const getStudents = async (req, res) => {
    try {
        const { search } = req.query;

        // Faculty and Admin only route (protected via middleware)

        const whereClause = search ? {
            OR: [
                { user: { name: { contains: search } } },
                { user: { email: { contains: search } } },
                { course: { contains: search } }
            ]
        } : {};

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { user: { name: 'asc' } }
        });

        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

// GET /students/:id
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        res.json(student);
    } catch (error) {
        console.error('Get student details error:', error);
        res.status(500).json({ error: 'Failed to fetch student details' });
    }
};

module.exports = { getStudents, getStudentById };
