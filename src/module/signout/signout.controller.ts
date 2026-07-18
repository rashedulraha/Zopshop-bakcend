import { auth } from "../../lib/auth.js";

export const signoutController = async (req: any, res: any) => {
  try {
    await auth.api.signOut({
      headers: req.headers,
    });

    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to sign out", error });
  }
};
