import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET = "mock-secret-key";
const demoUser = {
  id: "1",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  is_active: true,
  is_onboarded: true,
  is_tour_completed: false,
  assigned_issues: 5,
  workspace_invites: 0,
  last_workspace_id: "workspace-1",
  role: "admin",
  theme: { theme: "system" },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email !== "demo@example.com") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { user_id: demoUser.id, email: demoUser.email },
      SECRET,
      { expiresIn: "24h" }
    );
    const refreshToken = jwt.sign({ user_id: demoUser.id }, SECRET, {
      expiresIn: "7d",
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: demoUser,
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
