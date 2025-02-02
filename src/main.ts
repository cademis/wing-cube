import express from "express";
import { apiRouter } from "./api";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api", apiRouter);

app.listen(3000, () => console.log("listening on http://localhost:3000"));
