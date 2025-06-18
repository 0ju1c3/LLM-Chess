import express from "express";
import path from "path";
import chessRoutes from "./routes/chess.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api/game", chessRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("Set ANTHROPIC_API_KEY environment variable to enable LLM features");
  }
});
