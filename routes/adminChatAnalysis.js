import express from "express";
import Message from "../models/message.js"; // adjust path if needed

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const query = req.body.query?.toLowerCase();

  try {
    const messages = await Message.find({}).select("content");

    const words = messages.flatMap(m => m.content?.toLowerCase().split(/\s+/) || []);
    const wordFreq = {};

    for (const word of words) {
      if (word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);

    if (query.includes("most used") || query.includes("most frequent")) {
      return res.json({
        answer: `🔠 Most used word is "${sorted[0][0]}" (${sorted[0][1]} times)`
      });
    }

    if (query.includes("top 5")) {
      const top5 = sorted.slice(0, 5).map(([w, c]) => `${w} (${c})`).join(", ");
      return res.json({
        answer: `🔝 Top 5 frequent words: ${top5}`
      });
    }

    return res.json({ answer: "❓ Sorry, I couldn't understand the query." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
