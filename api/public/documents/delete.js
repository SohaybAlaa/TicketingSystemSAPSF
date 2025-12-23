import { unlink } from "fs/promises"; // to delete files
import path from "path"; // safely builds paths for Windows/Linux
import { existsSync } from "fs"; // checks if a folder exists

export default async (req, res) => {
  if (req.method !== "DELETE") {
    // Allow only DELETE requests
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename } = req.query; // Get filename from query parameters

    if (!filename) {
      // Validate filename
      return res.status(400).json({ error: "Filename is required" });
    }

    // Security check - prevent directory traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(process.cwd(), "uploads", "documents", filename); // Full path to the file to delete : ADMINSAPSF/uploads/documents/filename.txt

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" }); // Check if file exists
    }

    await unlink(filePath); // Delete the file
    console.log("Delete successful:", filename);

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};
