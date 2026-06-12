import apiErrorMiddleware from "#middlewares/api/apiErrorMiddleware.ts";
import router from "#router/index.ts";
import { API_ROUTES_PREFIX } from "@speak-up/shared";
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

app.use(API_ROUTES_PREFIX, router);
app.use(apiErrorMiddleware);

export default app;
