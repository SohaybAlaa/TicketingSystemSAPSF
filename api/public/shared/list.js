import { readdir, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export default async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { listType, ticketId } = req.query;

    // Validation
    if (!listType) {
      return res.status(400).json({
        error: "Missing required parameter: listType",
      });
    }

    if (listType === "ticket" && !ticketId) {
      return res.status(400).json({
        error: "ticketId is required for ticket listings",
      });
    }

    // Determine directory based on type
    let uploadDir;
    if (listType === "ticket") {
      uploadDir = path.join(
        process.cwd(),
        "uploads",
        "tickets",
        ticketId.toString()
      );
    } else if (listType === "document") {
      uploadDir = path.join(process.cwd(), "uploads", "documents");
    } else {
      return res.status(400).json({ error: "Invalid listType" });
    }

    // If directory doesn't exist, return empty list
    if (!existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    // Read files in directory
    const files = await readdir(uploadDir);
    const fileList = [];

    for (const file of files) {
      if (file.startsWith(".")) continue; // Skip hidden files and .gitkeep

      const filePath = path.join(uploadDir, file);
      const stats = await stat(filePath);

      if (stats.isFile()) {
        const ext = path.extname(file).slice(1).toLowerCase(); // Remove the dot

        fileList.push({
          id: `${ticketId || "doc"}-${file}-${stats.mtimeMs}`,
          filename: file,
          type: ext,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          uploadedAt: stats.mtime.toISOString(),
        });
      }
    }

    // Sort by upload date (newest first)
    fileList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ files: fileList });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({
      error: "Failed to list files",
      details: error.message,
    });
  }
};

// Helper function for better file size formatting
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
