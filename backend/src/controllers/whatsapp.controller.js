const { PrismaClient } = require('@prisma/client');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// OpenRouter AI Fallback
// ─────────────────────────────────────────────
async function getAIResponse(userMessage) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://campusos.local",
                "X-Title": "CampusOS WhatsApp Bot",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    {
                        role: "system",
                        content: "You are CampusOS assistant helping students and faculty with academic, campus, and administrative queries. Keep responses short, professional, and helpful. Do not use markdown like **."
                    },
                    { role: "user", content: userMessage }
                ]
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.error('OpenRouter AI error:', err.message);
        return null;
    }
}

// ─────────────────────────────────────────────
// State map for multi-step conversations
// ─────────────────────────────────────────────
const conversationState = new Map();

// ─────────────────────────────────────────────
// Get Active User (Simulation) 
// ─────────────────────────────────────────────
// In a real app we'd query by Phone Number (req.body.From).
// For demo purposes, we will default to "Manitej" for student actions.
async function getDemoStudentUser() {
    return await prisma.user.findFirst({
        where: { name: 'Manitej', role: 'student' },
        include: { studentProfile: true }
    });
}

// ─────────────────────────────────────────────
// POST /whatsapp/webhook
// ─────────────────────────────────────────────
const handleWebhook = async (req, res) => {
    const twiml = new MessagingResponse();
    const rawBody = req.body.Body ? req.body.Body.trim() : '';
    const incomingMsg = rawBody.toLowerCase();
    const sender = req.body.From || '';

    console.log(`[WhatsApp] From: ${sender} | Message: "${rawBody}"`);

    let reply = '';

    try {
        const state = conversationState.get(sender) || { step: 'idle' };

        // ── 1. FACULTY MODE ──
        if (incomingMsg.startsWith('?faculty')) {
            // Remove the command prefix and clean up brackets
            const commandBody = incomingMsg.slice(8).trim(); 
            const cleanedBody = commandBody.replace(/[<>]/g, ''); 
            const parts = cleanedBody.split(/\s+/); 

            if (parts.length >= 2) {
                const rollNo = parts[0].toUpperCase().trim();
                const action = parts[1].toLowerCase().trim();

                const studentData = await prisma.student.findUnique({
                    where: { rollNo: rollNo },
                    include: { user: true }
                });

                if (!studentData) {
                    reply = `⚠️ Student with Roll Number ${rollNo} not found.`;
                } else {
                    if (action === 'details') {
                        reply = `🎓 *Student Academic Profile*\n\nName: ${studentData.user.name}\nDepartment: ${studentData.department}\nGPA: ${studentData.gpa}\nAttendance: ${studentData.attendance}%\nFee Status: ${studentData.feeStatus}`;
                    } else if (action === 'fee') {
                        reply = `💰 *Fee Data: ${rollNo}*\nName: ${studentData.user.name}\nStatus: ${studentData.feeStatus}\nCanteen Balance: ₹${studentData.balance}`;
                    } else if (action === 'result') {
                        reply = `📊 *Academic Result: ${rollNo}*\nName: ${studentData.user.name}\nGPA: ${studentData.gpa}\nYear: ${studentData.year}`;
                    } else if (action === 'timetable') {
                        // Get student's current day timetable
                        const today = new Date().toLocaleString('en-US', { weekday: 'long' });
                        const slots = await prisma.timetable.findMany({
                            where: { department: studentData.department, year: studentData.year, day: today },
                            orderBy: { startTime: 'asc' }
                        });
                        if (slots.length === 0) {
                            reply = `📅 No classes scheduled for ${studentData.user.name} today (${today}).`;
                        } else {
                            reply = `📅 *${studentData.user.name}'s Schedule (${today})*\n\n` + 
                                    slots.map(s => `• ${s.startTime}–${s.endTime} → ${s.subject} (${s.roomNumber})`).join('\n');
                        }
                    } else {
                        reply = `⚠️ Unknown faculty action. Try: details, fee, result, or timetable.`;
                    }
                }
            } else {
                reply = "👨‍🏫 *Faculty Mode Usage:*\n?faculty <roll_no> details\n?faculty <roll_no> fee\n?faculty <roll_no> timetable";
            }
        }
        
        // ── 2. PRE-DEFINED WORKFLOW: LOST ID CARD ──
        else if (incomingMsg.includes('lost my id card') || incomingMsg.includes('lost id card')) {
            const activeUser = await getDemoStudentUser();
            
            if (activeUser && activeUser.studentProfile) {
                // Auto-create ticket
                const ticket = await prisma.ticket.create({
                    data: {
                        userId: activeUser.id,
                        title: 'Request for Reissue of ID Card',
                        description: 'User reported lost ID card via WhatsApp.',
                        priority: 'HIGH',
                        status: 'OPEN'
                    }
                });

                // Generate Letter
                reply = `Your ticket has been created ✅ (ID: #${ticket.id.substring(0,6)})\n\nFollow these steps:\n1. Write an application letter\n2. Get signature from your HOD\n3. Submit to Admin Block, Room No: 101\n\nHere is your letter format to copy/print:\n\n---\nSubject: Request for Reissue of ID Card\n\nRespected Sir/Madam,\nI am ${activeUser.name}, a student of B.Tech ${activeUser.studentProfile.department} department. I lost my ID card. I kindly request you to issue me a new one.\n\nThank you.\n\nStudent Name: ${activeUser.name}\nRoll No: ${activeUser.studentProfile.rollNo}\n---`;
            } else {
                reply = "⚠️ Error: Active student profile missing from database.";
            }
        }

        // ── 3. TICKET CREATION WORKFLOW (STANDARD) ──
        else if (state.step === 'awaiting_ticket_desc') {
            conversationState.delete(sender);

            if (rawBody.length < 5) {
                reply = "❌ Description too short. Please try again with more detail.\n\nSend 'ticket' to start over.";
            } else {
                const student = await getDemoStudentUser();
                if (student) {
                    const ticket = await prisma.ticket.create({
                        data: {
                            userId: student.id,
                            title: `WhatsApp: ${rawBody.substring(0, 50)}`,
                            description: rawBody,
                            priority: 'MEDIUM',
                            status: 'OPEN'
                        }
                    });
                    reply = `✅ *Ticket Created Successfully!*\n\n🔖 ID: #${ticket.id.substring(0, 8).toUpperCase()}\n📋 Issue: ${rawBody.substring(0, 60)}\n📊 Status: OPEN\n⏱️ Priority: Medium\n\nOur team will respond soon. Type 'status' to track your tickets.`;
                } else {
                    reply = "⚠️ Could not create ticket. Please try via the CampusOS web app.";
                }
            }
        }

        // ── 4. STANDARD COMMANDS ──
        else if (incomingMsg.includes('menu') || incomingMsg === 'food') {
            const items = await prisma.menuItem.findMany({ where: { isAvailable: true } });
            if (items.length === 0) {
                reply = "🍽️ The canteen has no items available right now. Check back later!";
            } else {
                const grouped = {};
                items.forEach(item => {
                    if (!grouped[item.category]) grouped[item.category] = [];
                    grouped[item.category].push(item);
                });

                let menuText = "🍽️ *Today's Canteen Menu*\n\n";
                for (const [cat, catItems] of Object.entries(grouped)) {
                    menuText += `*${cat}*\n`;
                    catItems.forEach(i => {
                        menuText += `  • ${i.name} — ₹${i.price.toFixed(0)}\n`;
                    });
                    menuText += '\n';
                }
                menuText += "🛒 To order, visit the CampusOS app > Canteen tab.";
                reply = menuText;
            }
        }

        else if (incomingMsg === 'ticket' || incomingMsg === 'raise ticket' || incomingMsg === 'create ticket') {
            conversationState.set(sender, { step: 'awaiting_ticket_desc' });
            reply = "📝 *Raise a Support Ticket*\n\nPlease describe your issue in the next message and I'll create a ticket for you immediately.";
        }

        else if (incomingMsg === 'status' || incomingMsg === 'my tickets' || incomingMsg === 'ticket status') {
            const student = await getDemoStudentUser();
            if (student) {
                const tickets = await prisma.ticket.findMany({
                    where: { userId: student.id },
                    orderBy: { createdAt: 'desc' },
                    take: 3
                });
                if (tickets.length === 0) {
                    reply = "📭 You have no tickets yet.\n\nSend 'ticket' to raise one.";
                } else {
                    let statusText = "📋 *Your Recent Tickets*\n\n";
                    tickets.forEach((t, i) => {
                        const emoji = t.status === 'RESOLVED' ? '✅' : t.status === 'IN_PROGRESS' ? '🔄' : '🔓';
                        statusText += `${emoji} *#${i + 1}*\n`;
                        statusText += `  📌 ${t.title.substring(0, 40)}\n`;
                        statusText += `  Status: ${t.status} | Priority: ${t.priority}\n\n`;
                    });
                    reply = statusText.trim();
                }
            } else {
                reply = "⚠️ Could not retrieve tickets. Please use the CampusOS web app.";
            }
        }

        else if (incomingMsg === 'order' || incomingMsg === 'how to order') {
            reply = "🛒 *How to Order Food*\n\n1️⃣ Open CampusOS in your browser\n2️⃣ Go to the *Canteen* tab\n3️⃣ Browse the menu and add items to cart\n4️⃣ Place your order and collect via QR code\n\n💡 Send 'menu' to see today's available items!";
        }

        else if (incomingMsg === 'timetable' || incomingMsg === 'schedule' || incomingMsg === 'my classes') {
            const student = await getDemoStudentUser();
            if (student && student.studentProfile) {
                const today = new Date().toLocaleString('en-US', { weekday: 'long' });
                const slots = await prisma.timetable.findMany({
                    where: { 
                        department: student.studentProfile.department, 
                        year: student.studentProfile.year, 
                        day: today 
                    },
                    orderBy: { startTime: 'asc' }
                });

                if (slots.length === 0) {
                    reply = `📅 No classes scheduled for you today (${today}). Enjoy your day off! 🌟`;
                } else {
                    let timetableText = `📅 *Your Timetable Today (${today})*\n\n`;
                    slots.forEach(s => {
                        timetableText += `• ${s.startTime}–${s.endTime} → ${s.subject}\n  📍 Room: ${s.roomNumber} | 👨‍🏫 ${s.facultyName}\n\n`;
                    });
                    
                    // Logic for next class
                    const now = new Date();
                    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const nextClass = slots.find(s => s.startTime > currentTimeStr);
                    
                    if (nextClass) {
                        timetableText += `➡️ *Next Class:* ${nextClass.subject} at ${nextClass.startTime}`;
                    }

                    reply = timetableText.trim();
                }
            } else {
                reply = "⚠️ Error: Student profile not found in system.";
            }
        }

        else if (['hi', 'hello', 'hey', 'help', 'start', 'commands'].includes(incomingMsg)) {
            reply = `👋 *Welcome to CampusOS Assistant!*\n\nHere's what I can help you with:\n\n📅 *timetable* — View today's class schedule\n🍽️ *menu* — View today's canteen menu\n🎫 *ticket* — Raise a support ticket\n📋 *status* — Check your ticket status\n\n👨‍🏫 *Faculty Mode:* Use '?faculty <roll_no> details'\n\n💬 Or just ask any question natively!`;
        }

        // ── 5. AI FALLBACK ──
        else {
            const aiReply = await getAIResponse(rawBody);
            if (aiReply) {
                reply = aiReply;
            } else {
                reply = `🤔 I'm not sure about that.\n\nTry one of these commands:\n• menu\n• ticket\n• status\n• help`;
            }
        }

    } catch (error) {
        console.error('[WhatsApp Webhook Error]', error);
        reply = "⚠️ Sorry, something went wrong. Please try again or visit the CampusOS web app.";
    }

    twiml.message(reply);
    res.type('text/xml').send(twiml.toString());
};

module.exports = { handleWebhook };
