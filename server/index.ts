import app from "#utils/app.ts";
import createIO from "#utils/io.ts";
import { config } from "dotenv";
import { createServer } from "http";

config();

const PORT = +(process.env.PORT || 7000);
const server = createServer(app);

createIO(server);

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
