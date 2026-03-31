import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const GEMINI_MODEL = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  try {
    const { content, numQuestions, difficulty } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const difficultyInstruction =
      difficulty === 'mixed'
        ? 'Create a mix of easy, medium, and hard questions.'
        : `All questions should be ${difficulty} difficulty.`;

    const prompt = `You are an expert quiz creator. Based on the following study material, generate exactly ${numQuestions} quiz questions.

RULES:
- Create a mix of multiple choice (MCQ) and true/false questions (roughly 70% MCQ, 30% true/false)
- MCQ questions must have exactly 4 options
- True/false questions must have exactly 2 options: ["True", "False"]
- Questions should test understanding, not just memorization
- ${difficultyInstruction}
- Each question needs a brief explanation of the correct answer
- Questions must be directly based on the provided material

Respond ONLY with valid JSON in this exact format, no markdown fences, no extra text:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Because...",
      "difficulty": "medium"
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "Statement is true or false?",
      "options": ["True", "False"],
      "correctIndex": 0,
      "explanation": "This is true because...",
      "difficulty": "easy"
    }
  ]
}

STUDY MATERIAL:
${content.slice(0, 30000)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    };

    // Retry up to 3 times with backoff for rate limits (429)
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429) {
        const waitMs = (attempt + 1) * 5000; // 5s, 10s, 15s
        console.log(`Rate limited, retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/3)`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const errBody = response ? await response.text() : 'No response';
      console.error('Gemini API error:', response?.status, errBody);
      const errMsg =
        response?.status === 429
          ? 'Rate limit exceeded. Please wait a minute and try again.'
          : `Gemini API error: ${response?.status}. Check terminal for details.`;
      throw new Error(errMsg);
    }

    const data = await response.json();

    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    // Parse JSON, stripping markdown fences if present
    const cleaned = responseText.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz format returned');
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (error: any) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
