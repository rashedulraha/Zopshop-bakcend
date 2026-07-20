import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";

const me = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    return res.json(session);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get session", error });
  }
};

const signout = async (req: Request, res: Response) => {
  try {
    await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sign out", error });
  }
};

export const authControllers = {
  me,
  signout,
};
