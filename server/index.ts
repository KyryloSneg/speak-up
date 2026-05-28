import apiErrorMiddleware from "#middlewares/apiErrorMiddleware.ts";
import router from "#router/index.ts";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { createServer } from "http";

config();

const PORT = +(process.env.PORT || 7000);
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

const server = createServer(app);

const start = async () => {
  try {
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`Server started on PORT = ${PORT}`),
    );
  } catch (e) {
    console.log(e);
  }
};

start();
