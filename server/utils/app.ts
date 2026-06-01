import apiErrorMiddleware from "#middlewares/apiErrorMiddleware.ts";
import router from "#router/index.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";

config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.use("/api", router);
app.use(apiErrorMiddleware);

export default app;
