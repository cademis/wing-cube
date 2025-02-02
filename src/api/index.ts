import express from "express";
import { authRouter } from "./auth/auth.routes";
import { usersRouter } from "./users/users.routes";

const apiRouter = express.Router();

apiRouter.get("/", async (req, res) => { res.json({ hello: "world" }) });

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

export { apiRouter };
