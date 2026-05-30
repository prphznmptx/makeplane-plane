import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET = "mock-secret-key";

function extractToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return authHeader.split(" ")[1] || null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      jwt.verify(token, SECRET);
      res.json({
        overdue_issues: [],
        upcoming_issues: [],
        state_distribution: {},
        completed_issues: [],
        total_issues: 0,
      });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
