import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../app";
import { loginSchema } from "bsc-shared";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;

    const token = jwt.sign({ userId: user.id }, secret, {
      expiresIn: "8h",
    });
    const refreshToken = jwt.sign({ userId: user.id }, refreshSecret, {
      expiresIn: "7d",
    });

    res.json({ token, refreshToken, username: user.username, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET!;
  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      userId: string;
    };
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign({ userId: decoded.userId }, secret, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;