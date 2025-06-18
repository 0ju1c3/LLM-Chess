import express from "express";
import path from "path";
import chessRoutes from "./routes/chess.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// Chess game API routes
app.use("/api/game", chessRoutes);

// Serve the main page
app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Set ANTHROPIC_API_KEY environment variable to enable LLM features");
});
