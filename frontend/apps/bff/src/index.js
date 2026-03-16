const express = require("express");
const env = require("./config/env");
const routes = require("./routes/index.routes");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin || process.env.CORS_ORIGIN || "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  return next();
});
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({ status: "bff-ready", env: env.nodeEnv });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`BFF listening on ${env.port}`);
});
