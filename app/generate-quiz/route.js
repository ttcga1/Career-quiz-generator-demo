import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      industry,
      careerField,
      experienceLevel,
      roleContext,
    } = body;

    const prompt = `
Create a professional skills assessment quiz.

Industry: ${industry}
Career Field: ${careerField}
Experience Level: ${experienceLevel}
Role Context: ${JSON.stringify(roleContext)}

Requirements:
- 5 multiple-choice questions
- 4 options per question
- One correct answer
- Provide a short explanation for each correct answer
- Return ONLY valid JSON

JSON format:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctIndex": 0,
      "explanation": ""
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const quiz = JSON.parse(text);

    return Response.json({ quiz });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate quiz" }),
      { status: 500 }
    );
  }
}
