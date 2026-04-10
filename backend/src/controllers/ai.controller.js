// POST /ai/chat
const handleChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.json({ reply: 'I am currently offline (Missing API Config). Please try again later.' });
        }

        const systemPrompt = `You are a helpful and friendly Campus Assistant AI for CampusOS. 
        Your goal is to help students and faculty with university-related queries.
        
        Guidelines:
        - If a user asks about their timetable, schedule, or next class, inform them they can check the 'Timetable' section in their dashboard or send 'timetable' to the WhatsApp bot.
        - If a user asks about a lost ID or card, tell them to visit the Administration Office (Room 101) or create an IT/Support ticket in the 'Tickets' tab.
        - If a user asks about the canteen, inform them they can order food directly from the 'Canteen' page.
        - Be concise, polite, and helpful. Keep answers relatively short. Do not format with markdown headers unless necessary.`;

        // Format history for OpenRouter
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: message }
        ];

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://campusos.local",
                    "X-Title": "CampusOS API",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "openrouter/free",
                    "messages": messages
                })
            });

            if (!response.ok) {
                console.error("OpenRouter API returned status:", response.status);
                return res.json({ reply: "I'm having trouble connecting to the AI services right now. Please try again later!" });
            }

            const data = await response.json();
            const replyText = data.choices && data.choices[0] && data.choices[0].message.content
                ? data.choices[0].message.content
                : "Sorry, I couldn't understand that.";

            res.json({ reply: replyText });
        } catch (fetchError) {
            console.error('Fetch to OpenRouter failed:', fetchError);
            res.json({ reply: "I couldn't reach the AI server. Please check your connection or try again later." });
        }

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.json({ reply: "Oops! Something went wrong on my end. Please try again." });
    }
};

module.exports = { handleChat };
