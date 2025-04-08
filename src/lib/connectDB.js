import { MongoClient, ServerApiVersion } from "mongodb";

let clientPromise;
let db;

// Ensure the MongoDB client is only initialized on the server side
if (typeof window === "undefined") {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vnidizo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  const options = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  };

  const client = new MongoClient(uri, options);

  // Initialize clientPromise to connect MongoClient
  clientPromise = client.connect();
}

const connectDB = async () => {
  if (db) return db;

  if (!clientPromise) {
    throw new Error("MongoClient is not initialized.");
  }

  try {
    // Wait for MongoClient to connect and select the database
    const client = await clientPromise;
    db = client.db("dbdoctwintech");

    // Log a successful connection to the terminal
    console.log("MongoDB connected successfully to database:");

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Database connection failed");
  }
};

export default connectDB;
