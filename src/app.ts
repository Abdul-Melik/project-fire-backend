import "dotenv/config";
import express from "express";
import helloworld from "./routes/helloworld-route";

const app = express();
app.use("/api/", helloworld);
export default app;
