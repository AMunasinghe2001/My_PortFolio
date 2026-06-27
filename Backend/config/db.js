const mongoose = require("mongoose");

// Cache the connection across serverless invocations so each request reuses one
// connection instead of opening a new one (which exhausts the pool and causes
// FUNCTION_INVOCATION_TIMEOUT on Vercel).
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set. Add it to your .env (and Vercel env vars).");
    }
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, {
                // Fail fast (under the Vercel function timeout) with a clear
                // error instead of hanging if the DB is unreachable.
                serverSelectionTimeoutMS: 8000,
                maxPoolSize: 10,
            })
            .then((m) => {
                console.log("Connected to MongoDB");
                return m;
            })
            .catch((err) => {
                cached.promise = null; // allow a later retry
                throw err;
            });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;
