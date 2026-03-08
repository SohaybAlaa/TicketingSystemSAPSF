import { readdir, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { getTicketAttachmentsDB } from '../../_utils/db.js';

export default async (req, res) => {
  if (req.method !== "GET") { //accept only GET requests 
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { listType, ticketId } = req.query; // get listType and ticketId from the query parameters

    // Validation
    if (!listType) { //check if listType is provided
      return res.status(400).json({
        error: "Missing required parameter: listType",
      });
    }

    if (listType === "ticket" && !ticketId) { //check if ticketId is provided
      return res.status(400).json({
        error: "ticketId is required for ticket listings",
      });
    }

    if (listType === "ticket") { //check if listType is ticket
      // Try DB first for ticket attachments (includes uploader info)
      try {
        const rows = await getTicketAttachmentsDB(ticketId); //get ticket attachments from the database

        if (rows.length > 0) {
          const fileList = rows.map(row => ({
            id: row.id,
            filename: row.stored_filename,
            originalFilename: row.original_filename,
            type: row.file_type,
            size: row.file_size_bytes,
            sizeFormatted: formatFileSize(row.file_size_bytes),
            uploadedAt: row.uploaded_at,
            uploadedBy: row.uploaded_by_name,
            uploadedByType: row.uploaded_by_type,
          }));

          return res.json({ files: fileList });
        }
      } catch (dbError) { //catch any errors from the database
        console.error('[LIST] DB fallback to filesystem:', dbError.message);
      }

      // Fallback to filesystem if DB is empty or fails
      const uploadDir = path.join(process.cwd(), "uploads", "tickets", ticketId.toString()); //get the upload directory

      if (!existsSync(uploadDir)) { //check if the upload directory exists
        return res.json({ files: [] });
      }

      const files = await readdir(uploadDir); //read the upload directory
      const fileList = [];

      for (const file of files) { //loop through the files
        if (file.startsWith(".")) continue;
        const filePath = path.join(uploadDir, file);
        const stats = await stat(filePath);
        if (stats.isFile()) {
          const ext = path.extname(file).slice(1).toLowerCase(); //get the file extension
          fileList.push({
            id: `${ticketId}-${file}-${stats.mtimeMs}`,
            filename: file,
            type: ext,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            uploadedAt: stats.mtime.toISOString(),
            uploadedBy: null,
            uploadedByType: null,
          });
        }
      }

      fileList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); //sort the files by uploadedAt
      return res.json({ files: fileList });
    }

    if (listType === "document") { //if listType is document
      const uploadDir = path.join(process.cwd(), "uploads", "documents"); //get the upload directory

      if (!existsSync(uploadDir)) { //check if the upload directory exists
        return res.json({ files: [] });
      }

      const files = await readdir(uploadDir); //read the upload directory
      const fileList = [];

      for (const file of files) { //loop through the files
        if (file.startsWith(".")) continue;
        const filePath = path.join(uploadDir, file);
        const stats = await stat(filePath);
        if (stats.isFile()) {
          const ext = path.extname(file).slice(1).toLowerCase();
          fileList.push({
            id: `doc-${file}-${stats.mtimeMs}`,
            filename: file,
            type: ext,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            uploadedAt: stats.mtime.toISOString(),
          });
        }
      }

      fileList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); //sort the files by uploadedAt
      return res.json({ files: fileList });
    }

    return res.status(400).json({ error: "Invalid listType" }); //return error if listType is invalid
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
