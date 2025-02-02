import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users, UsersInsert } from "../../db/schema";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email: string) => {
  return db.query.users.findFirst({ where: eq(users.email, email) });
};

export const createUser = async ({ email, password }: UsersInsert) => {
  const hashedPassword = bcrypt.hashSync(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email, password: hashedPassword })
    .returning({ id: users.id });
  return user;
};

export const findUserById = async (id: number) => {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
};
