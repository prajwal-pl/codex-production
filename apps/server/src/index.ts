import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route";
import practiceRoutes from "./routes/practice.route";
import commentRoutes from "./routes/comment.route";
import postRoutes from "./routes/post.route";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/posts", postRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
