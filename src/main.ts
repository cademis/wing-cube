import express from "express";
import { apiRouter } from "./api";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", apiRouter);

app.listen(3000, () => console.log("http://localhost:3000"));
