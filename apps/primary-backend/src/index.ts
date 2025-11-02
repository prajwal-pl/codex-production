import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.route.js";
import practiceRoutes from "./routes/practice.route.js";
import commentRoutes from "./routes/comment.route.js";
import postRoutes from "./routes/post.route.js";
import profileRoutes from "./routes/user.route.js";
import problemRoutes from "./routes/problem.route.js";
import submissionRoutes from "./routes/submission.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";

const app = express();
const port = process.env.PORT || 5000;

// console.log("client secret", process.env.GOOGLE_CLIENT_SECRET);
// console.log("client id", process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
