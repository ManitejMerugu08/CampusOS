const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const studentRoutes = require('./routes/students');
const canteenRoutes = require('./routes/canteen');
const timetableRoutes = require('./routes/timetable');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/canteen', canteenRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
