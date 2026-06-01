import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
    },
    sequence: {
      concurrent: false,
    },
    pool: "forks",
    fileParallelism: false,
    maxWorkers: 1,
  },
});
