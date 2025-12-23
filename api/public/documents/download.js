import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" }); // Allow only GET requests
  }

  try {
    const { filename } = req.query; // Get filename from query parameters

    if (!filename) {
      // Validate filename
      return res.status(400).json({ error: "Filename is required" });
    }

    // Security check prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", "documents", filename); // Full path to the file to download : ADMINSAPSF/uploads/documents/filename.txt

    if (!existsSync(filePath)) {
      // Check if file exists
      return res.status(404).json({ error: "File not found" });
    }

    const fileBuffer = await readFile(filePath); // Read the file content

    res.send(fileBuffer); // Send the file content as response
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download document" });
  }
};
