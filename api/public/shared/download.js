import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, downloadType, ticketId } = req.query;

    // Validation
    if (!filename || !downloadType) {
      return res.status(400).json({
        error: "Missing required parameters: filename or downloadType",
      });
    }

    if (downloadType === "ticket" && !ticketId) {
      return res.status(400).json({
        error: "ticketId is required for ticket downloads",
      });
    }

    // Security check - prevent path traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Determine file path based on type
    let filePath;
    if (downloadType === "ticket") {
      filePath = path.join(
        process.cwd(),
        "uploads",
        "tickets",
        ticketId.toString(),
        filename
      );
    } else if (downloadType === "document") {
      filePath = path.join(process.cwd(), "uploads", "documents", filename);
    } else {
      return res.status(400).json({ error: "Invalid downloadType" });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Encode filename for proper Unicode/Arabic character support
    const encodedFilename = encodeURIComponent(filename);

    // Set headers for download with Unicode support
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Send file
    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      error: "Failed to download file",
      details: error.message,
    });
  }
};
