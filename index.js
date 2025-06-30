import fetch from 'node-fetch';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/generate', async (req, res) => {
  const { topic } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "InstaCaption AI"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct", // You can also try "openai/gpt-3.5-turbo"
        messages: [
          {
            role: "user",
            content: `Write 3 short, viral Instagram captions about "${topic}". Include emojis and hashtags.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150
      }),
    });

    const data = await response.json();

    if (data && data.choices && data.choices[0]) {
      const captionsRaw = data.choices[0].message.content;
      const captions = captionsRaw
        .split('\n')
        .filter(line => line.trim().length > 5)
        .slice(0, 3);

      res.status(200).json({ captions });
    } else {
      console.log("OpenRouter invalid response:", data);
      res.status(500).json({ error: "Invalid response from OpenRouter" });
    }
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenRouter" });
  }
});

app.listen(5000, () => {
  console.log("✅ OpenRouter backend running on http://localhost:5000");
});
