import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import projectRoutes from "./routes/project.route.js";

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);

app.listen(port, () => {
  console.log(`Worker backend is running on http://localhost:${port}`);
});
