// index.js
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB connect
const client = new MongoClient(MONGO_URI);

async function connectDB() {
  if (!client.isConnected?.()) await client.connect();
  return client.db("eventDB").collection("events");
}

// GET all events
app.get("/events", async (req, res) => {
  try {
    const collection = await connectDB();
    const events = await collection.find().toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event
app.get("/events/:id", async (req, res) => {
  try {
    const collection = await connectDB();
    const event = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: add event
app.post("/events", async (req, res) => {
  try {
    const { title, description, price, date, image } = req.body;
    if (!title || !price || !image)
      return res.status(400).json({ error: "Missing required fields" });

    const collection = await connectDB();
    const result = await collection.insertOne({ title, description, price, date, image });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: update event
app.put("/events/:id", async (req, res) => {
  try {
    const collection = await connectDB();
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: delete event
app.delete("/events/:id", async (req, res) => {
  try {
    const collection = await connectDB();
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
