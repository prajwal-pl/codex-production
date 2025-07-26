import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Worker backend is running on http://localhost:${port}`);
});
