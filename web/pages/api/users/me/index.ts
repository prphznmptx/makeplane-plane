import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET = "mock-secret-key";
let demoUser = {
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

function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return authHeader.split(" ")[1] || null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    jwt.verify(token, SECRET);

    if (req.method === "GET") {
      res.json(demoUser);
    } else if (req.method === "PATCH") {
      Object.assign(demoUser, req.body);
      res.json(demoUser);
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
