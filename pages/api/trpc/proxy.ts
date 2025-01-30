import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing or invalid URL" });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);

    // Make the request look like a real browser request
    const response = await axios.get(decodedUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://www.nvidia.com/",
        "Origin": "https://www.nvidia.com/",
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Proxy error:", error.response?.status, error.response?.data);
    return res.status(error.response?.status || 500).json({ error: "Failed to fetch API" });
  }
}
