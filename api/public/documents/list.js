import { readdir, stat } from "fs/promises"; // to read directory and gets info about a file (size, modified date, is it a file or folder)
import path from "path"; // safely builds paths for Windows/Linux
import { existsSync } from "fs"; // checks if a folder exists
import crypto from "crypto"; // Added for stable, unique IDs documents

export default async (req, res) => {
  if (req.method !== "GET") {
    // Allow only GET requests
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "uploads", "documents"); //adjust path ADMINSAPSF/uploads/documents

    if (!existsSync(uploadDir)) {
      return res.json({ documents: [] }); // if uploads/documents doesn't exist, return empty list (There are no documents to list (because the folder isn’t there yet)
    }

    const files = await readdir(uploadDir); // read files in folder uploads/documents
    const documents = [];

    for (const file of files) {
      if (file.startsWith(".")) continue; // Skip hidden files and .gitkeep

      const filePath = path.join(uploadDir, file); //full path to file : ADMINSAPSF/uploads/documents/filename.txt
      const stats = await stat(filePath); // get info about the file

      if (stats.isFile()) {
        // make sure it's a file (not a folder)
        const ext = path.extname(file).replace(".", "").toLowerCase();

        documents.push({
          // push to documents array an object with file details
          id: crypto // unique IDs
            .createHash("md5")
            .update(file)
            .digest("hex")
            .substring(0, 8),
          filename: file,
          size: `${(stats.size / 1024).toFixed(0)} KB`,
          uploadedAt: stats.mtime.toISOString().split("T")[0],
          type: ext,
        });
      }
    }
    // Sort by upload date (newest first)
    documents.sort((a, b) => b.id - a.id);
    res.json({ documents });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ error: "Failed to list documents" });
  }
};
