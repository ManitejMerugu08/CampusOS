const apiKey = process.env.OPENROUTER_API_KEY || "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";

async function fetchModels() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models");
        const data = await response.json();
        
        if (data && data.data) {
            const freeModels = data.data.filter(m => m.id.includes('free')).map(m => m.id);
            console.log("Available Free Models:\n", freeModels.slice(0, 10).join('\n'));
        } else {
            console.log("Failed to fetch models:", data);
        }
    } catch(err) {
        console.error("Fetch Exception:", err.message);
    }
}

fetchModels();
