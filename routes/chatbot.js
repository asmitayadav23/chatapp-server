import express from "express";
import { Configuration, OpenAIApi } from "openai";
import { Message } from "../models/message.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

router.post("/chatbot", async (req, res) => {
  const { userId, chatId, message } = req.body;

  try {
    const history = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(5);

    const context = history
      .reverse()
      .map((msg) => `${msg.sender === userId ? "Admin" : "Bot"}: ${msg.content}`)
      .join("\n");

    const prompt = `Conversation so far:\n${context}\nAdmin: ${message}\nBot:`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant for WhatsViz admin." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.data.choices[0].message.content;

    await Message.create({
      chat: chatId,
      sender: "chatbot",
      content: reply,
    });

    res.json({ message: reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bot failed to respond." });
  }
});

export default router;
