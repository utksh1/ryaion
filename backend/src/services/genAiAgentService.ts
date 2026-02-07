
export const chatWithGenAiAgent = async (messages: any[]) => {
    const GENAI_AGENT_URL = process.env.GENAI_AGENT_URL;
    const GENAI_AGENT_KEY = process.env.GENAI_AGENT_KEY;

    if (!GENAI_AGENT_URL || !GENAI_AGENT_KEY) {
        throw new Error("GENAI_AGENT configuration missing in backend environment");
    }

    const payload = {
        messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
    };

    try {
        const response = await fetch(GENAI_AGENT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GENAI_AGENT_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error("GenAI Agent API Error Response:", JSON.stringify(error, null, 2));
            throw new Error(`GenAI Agent API Error: ${response.status}`);
        }

        const data = await response.json();
        // The API returns choices[0].message.content for non-streaming
        const text = data.choices?.[0]?.message?.content || "No response";
        return text;
    } catch (error) {
        console.error("GenAI Agent Service Exception:", error);
        throw error;
    }
};
