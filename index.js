const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb"); // <-- fix
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db("eventDB");
  const eventsCollection = db.collection("events");

  // Get all events
  app.get("/events", async (req, res) => {
    const result = await eventsCollection.find().toArray();
    res.send(result);
  });

  // POST: Add a new event
  app.post("/events", async (req, res) => {
    const event = req.body;

    if (!event.title || !event.price || !event.image) {
      return res.send({ error: "Missing required fields" });
    }

    const result = await eventsCollection.insertOne(event);
    res.send(result);
  });

  // Get single event by ID
  app.get("/events/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
      if (!event) return res.status(404).send({ message: "Event not found" });
      res.send(event);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  });

    // DELETE
  app.delete('/events/:id', async (req, res) => {
    const result = await eventsCollection.deleteOne({ _id: new ObjectId(req.params.id) })
    res.send(result)
  })

    // PUT (update)
  app.put('/events/:id', async (req, res) => {
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    )
    res.send(result)
  })
}


run().catch(err => console.error(err));

app.listen(5000, () => console.log("Server running on 5000"));
