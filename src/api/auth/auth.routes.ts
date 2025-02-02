import express, { NextFunction, Request, Response } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { users } from "../../db/schema";
import * as dotenv from "dotenv";

import { z, ZodError, ZodSchema } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createInsertSchema } from "drizzle-zod";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../users/users.services";
import {
  addRefreshTokenToWhiteList,
  deleteRefreshToken,
  findRefreshTokenById,
  generateTokens,
  hashToken,
  sendRefreshToken,
  userExists,
} from "../auth/auth.services";
dotenv.config();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

const router = express.Router();

const UserInsertSchema = createInsertSchema(users);
type UserInsert = z.infer<typeof UserInsertSchema>;

const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

router.post("/signup", validate(UserInsertSchema), async (req, res) => {
  const { email, password } = req.body as UserInsert;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const user = await createUser({ email, password });

  const jti = uuidv4();

  const { accessToken, refreshToken } = generateTokens(user.id, jti);
  await addRefreshTokenToWhiteList({ jti, refreshToken, userId: user.id });

  sendRefreshToken(res, refreshToken);

  return res.status(200).json({ message: "Signup successful", accessToken });
});

router.post("/signin", validate(UserInsertSchema), async (req, res) => {
  const { email, password } = req.body as UserInsert;

  if (!(await userExists(email))) {
    return res.status(400).json({ error: "User not found." });
  }

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return res.status(400).json({ error: "Invalid login credentials." });
  }

  const validPassword = bcrypt.compareSync(password, existingUser.password);
  if (!validPassword) {
    res.status(403).json({ error: "Invalid login credentials." });
  }

  const jti = uuidv4();

  const { accessToken, refreshToken } = generateTokens(existingUser.id, jti);
  await addRefreshTokenToWhiteList({
    jti,
    refreshToken,
    userId: existingUser.id,
  });
  sendRefreshToken(res, refreshToken);

  return res.status(200).json({ message: "Signin successful", accessToken });
});

router.post("/refreshToken", async (req, res, next) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(400).json({ error: "Missing refresh token" });
  }

  const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;

  const savedRefreshToken = await findRefreshTokenById(payload.jti!);

  if (!savedRefreshToken || savedRefreshToken.revoked === true) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const hashedToken = hashToken(refreshToken);

  if (hashedToken !== savedRefreshToken.hashedToken) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  const user = await findUserById(payload.userId);

  if (!user) {
    return res.status(401).json({ error: "Unauthorised" });
  }

  await deleteRefreshToken(savedRefreshToken.id);

  const jti = uuidv4();
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id,
    jti
  );
  await addRefreshTokenToWhiteList({
    jti,
    refreshToken: newRefreshToken,
    userId: user.id,
  });

  sendRefreshToken(res, newRefreshToken);

  return res.json({ message: "Refreshed token successfully", accessToken });
});

//placeholder for future use
router.post("/revokeRefreshTokens", async (req, res, next) => {});

export { router as authRouter };
