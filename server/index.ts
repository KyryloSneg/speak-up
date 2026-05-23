import { config } from "dotenv";
import express from "express";
import { createServer } from "http";

config();

const PORT = +(process.env.PORT || 7000);

const app = express();
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
