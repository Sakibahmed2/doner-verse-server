const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("charity-compass");
    const collection = db.collection("users");
    const supplyCollection = db.collection("supplies");
    const testimonialsCollection = db.collection("testimonials");
    const volunteersCollection = db.collection("volunteers");
    const commentsCollection = db.collection("Comments");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.header(
        "Access-Control-Allow-Origin",
        "https://charity-compass.vercel.app"
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    // Create supply
    app.post("/api/v1/supplies", async (req, res) => {
      const { image, category, title, description, amount } = req.body;

      const result = await supplyCollection.insertOne({
        image,
        category,
        title,
        description,
        amount,
      });

      res.status(201).json({
        success: true,
        message: "Supply created successfully",
        data: result,
      });
    });

    //Get all supply
    app.get("/api/v1/supplies", async (req, res) => {
      const result = await supplyCollection.find().toArray();

      res.status(200).json({
        success: true,
        message: "Supply retrieved successfully",
        data: result,
      });
    });

    //Get a supply
    app.get("/api/v1/supplies/:id", async (req, res) => {
      const { id } = req.params;

      const query = { _id: new ObjectId(id) };

      const result = await supplyCollection.findOne(query);

      res.status(200).json({
        success: true,
        message: "Supply retrieved successfully",
        data: result,
      });
    });

    //delete a supply
    app.delete("/api/v1/supplies/:id", async (req, res) => {
      const { id } = req.params;

      const query = { _id: new ObjectId(id) };

      const result = await supplyCollection.deleteOne(query);

      res.status(200).json({
        success: true,
        message: "Supply delete successfully",
        data: result,
      });
    });

    //create testimonials
    app.post("/api/v1/testimonials", async (req, res) => {
      const { name, title, description } = req.body;

      await testimonialsCollection.insertOne({
        name,
        title,
        description,
      });
      res.status(201).json({
        success: true,
        message: "Testimonials created successfully",
      });
    });

    //get testimonials
    app.get("/api/v1/testimonials", async (re1, res) => {
      const result = await testimonialsCollection.find().toArray();
      res.status(201).json({
        success: true,
        message: "Testimonials retrieved successfully",
        data: result,
      });
    });

    //create volunteer
    app.post("/api/v1/volunteers", async (req, res) => {
      // { name, image, birthDate, contactNo, email, address }
      const volunteerData = req.body;
      await volunteersCollection.insertOne(volunteerData);

      res.status(201).json({
        success: true,
        message: "Volunteer created successfully",
      });
    });

    // get all volunteer
    app.get("/api/v1/volunteers", async (re1, res) => {
      const result = await volunteersCollection.find().toArray();
      res.status(201).json({
        success: true,
        message: "Volunteers retrieved successfully",
        data: result,
      });
    });

    //create volunteer
    app.post("/api/v1/comments", async (req, res) => {
      // { name, image, birthDate, contactNo, email, address }
      const commentData = req.body;
      await commentsCollection.insertOne(commentData);

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
      });
    });

    // get all volunteer
    app.get("/api/v1/comments", async (re1, res) => {
      const result = await commentsCollection.find().toArray();
      res.status(201).json({
        success: true,
        message: "Comments retrieved successfully",
        data: result,
      });
    });

    app.options("*", cors());

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
