const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export const chatWithGemini = async (messages: any[]) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured in backend environment");
    }

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // If there's a system message, Gemini 1.5 handle it as system_instruction
    const systemMessage = messages.find(m => m.role === 'system');
    const filteredContents = contents.filter(c => c.role !== 'system');

    // Note: In beta, system_instruction is a separate field
    const payload: any = {
        contents: filteredContents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        }
    };

    if (systemMessage) {
        payload.system_instruction = {
            parts: [{ text: systemMessage.content }]
        };
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Gemini API Error Response:", JSON.stringify(error, null, 2));
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        return text;
    } catch (error) {
        console.error("Gemini Service Exception:", error);
        throw error;
    }
};
