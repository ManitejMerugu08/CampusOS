const apiKey = "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";

async function testOpenRouter() {
    console.log("Testing openrouter/free model...");
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
                "messages": [
                    { role: "user", content: "hi, say hello back in one word" }
                ]
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Raw Response:", text.substring(0, 500));
    } catch(err) {
        console.error("Error:", err.message);
    }
}
testOpenRouter();
