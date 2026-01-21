const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("GoogleGenerativeAI")
    try {
        // Need to find how to list models.
        // The SDK doesn't expose listModels directly on genAI instance in some versions?
        // Actually normally it is via model. 
        // Let's try to just run a simple prompt with 'gemini-1.5-flash-001' directly in this script.
        // If that works, we know the name is good.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash-001 works!", result.response.text());
    } catch (err) {
        console.error("gemini-1.5-flash-001 failed:", err.message);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("gemini-pro works!", result.response.text());
        } catch (err2) {
            console.error("gemini-pro failed:", err2.message);
        }
    }
}

listModels();
