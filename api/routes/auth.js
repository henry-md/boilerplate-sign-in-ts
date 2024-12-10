import { User } from "../models/User.js";
import { hash, verify } from "@node-rs/argon2";
import { Router } from 'express';
import { initializeLucia } from "../db/auth.js";

const authRouter = Router();

const hashOptions = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

const lucia = await initializeLucia();

authRouter.post("/sign-up", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const passwordHash = await hash(password, hashOptions);

    // Could delete later with correct validation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      passwordHash,
      username,
    });

    // Create a session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader("Set-Cookie", sessionCookie.serialize());

    return res.json({
      success: true,
      message: "User signed in successfully",
      user,
    });
  } catch (error) {
    console.error(error);
  }
});

authRouter.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    const validPassword = await verify(
      user.passwordHash,
      password,
      hashOptions
    );
    if (!validPassword) {
      return res.json({
        success: false,
        message: "Incorrect password or email",
      });
    }

    // Create a session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader("Set-Cookie", sessionCookie.serialize(), {
      append: true,
    });

    return res.json({
      success: true,
      message: "User signed in successfully",
      user,
    });
  } catch (error) {
    console.error(error);
  }
});

authRouter.post("/sign-out", async (req, res) => {
  const cookie = req.header("Cookie") ?? "";
  const sessionId = lucia.readSessionCookie(cookie);
  if (!sessionId) {
    return res.json(
      {
        success: false,
        message: "No session found",
      },
      401
    );
  }

  await lucia.invalidateSession(sessionId);
  const sessionCookie = lucia.createBlankSessionCookie();
  res.setHeader("Set-Cookie", sessionCookie.serialize()); // Remove the session cookie from the client

  return res.json(
    {
      success: true,
      message: "You have been signed out!",
    },
    200
  );
});

authRouter.get("/validate-session", async (req, res) => {
  const cookie = req.header("Cookie") ?? "";
  const sessionId = lucia.readSessionCookie(cookie);
  if (!sessionId) {
    return res.json(
      {
        success: false,
        message: "No session found",
      },
      401
    );
  }
  const session = await lucia.validateSession(sessionId);
  if (!session) {
    return res.json(
      {
        success: false,
        message: "Invalid session",
      },
      401
    );
  }

  return res.json({
    success: true,
    message: "Session is valid",
  });
});

authRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users", success: false });
  }
});

export default authRouter;