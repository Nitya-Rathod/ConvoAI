import express from "express";
import Thread from "../models/Thread.js";
import getAPIresponse from "../utils/groqAI.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// get all threads on the  basis of desc order of "updatedAt"
router.get("/thread", verifyToken, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// get a single thread messages - sequence of chats
router.get("/thread/:threadId", verifyToken, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId, userId: req.user.id });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

// delete a thread
router.delete("/thread/:threadId", verifyToken, async (req, res) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      userId: req.user.id,
    });

    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

// create a new chat or update an existing chat thread
router.post("/chat", verifyToken, async (req, res) => {
  const { threadId, msg } = req.body;

  if (!threadId || !msg) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId, userId: req.user.id });

    if (!thread) {
      thread = new Thread({
        userId: req.user.id,
        threadId,
        title: msg.length > 40 ? msg.substring(0, 40) + "..." : msg,
        messages: [{ role: "user", content: msg }],
      });
    } else {
      thread.messages.push({ role: "user", content: msg });
    }

    const assistantReply = await getAPIresponse(msg);
    thread.messages.push({ role: "assistant", content: assistantReply });

    await thread.save();

    res.json({ reply: assistantReply }); // sending reply to frontend
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Edit the last user message and regenerate AI response
router.put("/thread/:threadId/edit", verifyToken, async (req, res) => {
  const { threadId } = req.params;
  const { editedMessage } = req.body;

  if (!editedMessage) {
    return res.status(400).json({
      error: "Edited message is required",
    });
  }

  try {
    // Find the thread belonging to the logged-in user
    const thread = await Thread.findOne({
      threadId,
      userId: req.user.id,
    });

    if (!thread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    // Find the last user message
    let lastUserIndex = -1;

    for (let i = thread.messages.length - 1; i >= 0; i--) {
      if (thread.messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) {
      return res.status(400).json({
        error: "No user message found",
      });
    }

    thread.messages[lastUserIndex].content = editedMessage;
    thread.messages = thread.messages.slice(0, lastUserIndex + 1); // Remove everything after that message

    const assistantReply = await getAPIresponse(editedMessage);

    // Save new reply
    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    await thread.save();
    res.json({
      message: "Message updated successfully.",
      thread,
      reply: assistantReply,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to edit message",
    });
  }
});

export default router;
