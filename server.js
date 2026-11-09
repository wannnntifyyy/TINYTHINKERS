
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================
// 1. MIDDLEWARE
// ======================================

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// ======================================
// 2. GEMINI AI CONFIGURATION
// ======================================

if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY tidak dijumpai dalam .env');
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ======================================
// 3. AI SYSTEM INSTRUCTION
// ======================================

const systemInstruction = `
You are Tiny Thinkers AI Learning Buddy.

You are an educational assistant designed
for preschool children aged 4 to 6.

Your responsibilities:

1. Teach basic English alphabets.
2. Teach simple English words.
3. Teach syllables and pronunciation.
4. Teach basic counting and mathematics.
5. Introduce simple financial literacy.
6. Encourage children to learn through games.
7. Help teachers and parents with educational activities.

Communication rules:

- Use simple English.
- Keep answers short and friendly.
- Use cute and encouraging language.
- Use emojis where appropriate.
- Give one question or task at a time.
- Never shame children for incorrect answers.
- Encourage children to try again.
- Explain difficult concepts using simple examples.

For parents and teachers, you may provide
more detailed educational guidance.

For BIM (Bahasa Isyarat Malaysia),
do not invent or claim an unverified hand sign
is correct. Recommend guidance from a qualified
BIM instructor.

You are a learning assistant, not a replacement
for teachers or parents.
`;

// ======================================
// 4. HEALTH CHECK
// ======================================

app.get('/api/health', (req, res) => {

    res.json({
        status: 'online',
        message: 'Tiny Thinkers backend is running!',
        ai: 'Gemini configured',
        timestamp: new Date().toISOString()
    });

});

// ======================================
// 5. AI CHAT FUNCTION
// ======================================
// Retry apabila Gemini mengalami kesesakan sementara
async function generateWithRetry(prompt, maxRetries = 3) {

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {

            return await ai.models.generateContent({
                model: 'gemini-3.8-flash',

                config: {
                    systemInstruction: systemInstruction
                },

                contents: prompt
            });

        } catch (error) {

            const errorMessage = String(error.message || error);
            const isTemporaryError =
                errorMessage.includes('503') ||
                errorMessage.includes('UNAVAILABLE') ||
                errorMessage.includes('429') ||
                errorMessage.includes('RESOURCE_EXHAUSTED') ||
                errorMessage.includes('500');

            if (!isTemporaryError || attempt === maxRetries) {
                throw error;
            }

            const delay = attempt * 2000;

            console.log(
                `Gemini busy. Retry ${attempt}/${maxRetries} in ${delay / 1000}s`
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function handleAI(req, res) {

    try {

        const {
            message,
            studentName,
            mode,
            studentProgress
        } = req.body;

        if (!message || !message.trim()) {

            return res.status(400).json({
                error: 'Mesej diperlukan.'
            });

        }

        console.log('Incoming AI message:', message);

        const context = `
Student name: ${studentName || 'Little Explorer'}

Learning mode: ${mode || 'general'}

Student progress:
${JSON.stringify(studentProgress || {})}

Remember to follow your educational instructions.
`;

        const response = await generateWithRetry( context + '\nStudent message: ' + message);

        const reply = response.text;

        if (!reply) {

            throw new Error('Gemini returned an empty response.');

        }

        console.log('Gemini response received.');

        return res.json({

            success: true,
            reply: reply

        });

    } catch (error) {

        console.error('Gemini error:', error);

        return res.status(500).json({

            success: false,

            error: 'Gagal berhubung dengan Gemini AI.',

            details: error.message

        });

    }

}

// ======================================
// 6. AI ENDPOINTS
// ======================================

// Main endpoint used by script.js
app.post('/api/agent', handleAI);

// Alternative endpoint
app.post('/api/chat', handleAI);

// ======================================
// 7. START SERVER
// ======================================

app.listen(PORT, () => {

    console.log('');
    console.log('====================================');
    console.log('   TINY THINKERS AI SERVER');
    console.log('====================================');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`AI Endpoint: http://localhost:${PORT}/api/agent`);
    console.log('Status: READY');
    console.log('====================================');
    console.log('');

});
