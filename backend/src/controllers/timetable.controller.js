const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get student's timetable based on their department and year
const getStudentTimetable = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const timetable = await prisma.timetable.findMany({
            where: {
                department: student.department,
                year: student.year
            },
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json(timetable);
    } catch (error) {
        console.error('getStudentTimetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get faculty's timetable based on their name (linked to User name)
const getFacultyTimetable = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        const timetable = await prisma.timetable.findMany({
            where: { facultyName: user.name },
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json(timetable);
    } catch (error) {
        console.error('getFacultyTimetable error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllTimetable = async (req, res) => {
    try {
        const { department, year } = req.query;
        const where = {};
        if (department) where.department = department;
        if (year) where.year = parseInt(year);

        const timetable = await prisma.timetable.findMany({
            where,
            orderBy: [
                { day: 'asc' },
                { startTime: 'asc' }
            ]
        });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const createEntry = async (req, res) => {
    try {
        const entry = await prisma.timetable.create({
            data: {
                ...req.body,
                year: parseInt(req.body.year)
            }
        });
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ error: 'Bad request' });
    }
};

const updateEntry = async (req, res) => {
    try {
        const entry = await prisma.timetable.update({
            where: { id: req.params.id },
            data: {
                ...req.body,
                year: req.body.year ? parseInt(req.body.year) : undefined
            }
        });
        res.json(entry);
    } catch (error) {
        res.status(400).json({ error: 'Update failed' });
    }
};

const deleteEntry = async (req, res) => {
    try {
        await prisma.timetable.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Deletion failed' });
    }
};

module.exports = {
    getStudentTimetable,
    getFacultyTimetable,
    getAllTimetable,
    createEntry,
    updateEntry,
    deleteEntry
};
