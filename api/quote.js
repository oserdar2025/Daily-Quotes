export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  // Vercel Environment Variables-dan Gemini API Key alýarys
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on Vercel." });
  }

  try {
    const prompt = `Generate a unique, inspiring quote. Return strictly a JSON object with two fields: "t" for the quote text and "a" for the author. Do not include markdown codeblocks or any extra text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "Gemini API Error" });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const quoteJson = JSON.parse(rawText);

    return res.status(200).json(quoteJson);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}