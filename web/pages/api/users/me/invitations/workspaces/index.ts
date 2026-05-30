import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.json([]);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
