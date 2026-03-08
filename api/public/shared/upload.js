import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import crypto from "crypto";
import { saveTicketAttachmentDB } from '../../_utils/db.js';

export default async (req, res) => {
  if (req.method !== "POST") { // Allow Only POST Method
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // filename: original name of the file (e.g. "invoice.pdf")
    // content:    base64-encoded file data
    // uploadType: "ticket" | "document"
    // ticketId:   required when uploadType === "ticket"
    const { filename, content, uploadType, ticketId } = req.body;

    // Validation
    if (!filename || !content || !uploadType) {
      return res.status(400).json({
        error: "Missing required fields: filename, content, or uploadType",
      });
    }

    // ticketId is required when uploading attachments to a specific ticket
    if (uploadType === "ticket" && !ticketId) {
      return res.status(400).json({
        error: "ticketId is required for ticket uploads",
      });
    }

    // Prevent path traversal attacks (e.g. "../../etc/passwd")
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Resolve upload directory 
    // Ticket attachments are scoped to their ticket ID; documents go to a shared folder
    let uploadDir;
    if (uploadType === "ticket") {
      uploadDir = path.join(
        process.cwd(),
        "uploads",
        "tickets",
        ticketId.toString()
      );
    } else if (uploadType === "document") {
      uploadDir = path.join(process.cwd(), "uploads", "documents");
    } else {
      return res.status(400).json({ error: "Invalid uploadType" });
    }

    // Ensure the target directory exists before writing
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Reject duplicate filenames to avoid silent overwrites
    const filePath = path.join(uploadDir, filename);
    if (existsSync(filePath)) {
      return res.status(409).json({
        error: `A file named "${filename}" already exists. Please rename your file or delete the existing one first.`,
      });
    }

    // Write file 

    // Content arrives as a base64-encoded string; decode it before writing to disk
    const buffer = Buffer.from(content, "base64");
    await writeFile(filePath, buffer);

    // Build response payload

    const ext = path.extname(filename).replace(".", "").toLowerCase();
    const fileData = {
      id: crypto.randomUUID(),
      name: filename,
      filename: filename,
      size: buffer.length, // Raw bytes
      sizeFormatted: `${(buffer.length / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString(),
      type: ext,
      uploadType: uploadType,
      // Only include ticketId in the response when it's relevant
      ...(uploadType === "ticket" && { ticketId: ticketId }),
    };

    // Persist attachment metadata to DB (ticket uploads only) 

    // The file is already saved at this point; a DB failure is logged but won't
    // roll back the upload or return an error to the client.
    if (uploadType === "ticket") {
      try {
        await saveTicketAttachmentDB(
          ticketId,
          {
            original_filename: filename,
            stored_filename: filename,
            file_size_bytes: buffer.length,
            file_type: ext,
            file_path: `/uploads/tickets/${ticketId}/${filename}`,
          },
          {
            uploaded_by_type: req.body.uploadedByType || 'hr_staff',
            uploaded_by_name: req.body.uploadedByName || 'HR Admin',
            uploaded_by_id: req.body.uploadedById || null,
          }
        );
      } catch (dbError) {
        console.error('[API] DB insert failed for attachment (file saved):', dbError.message);
      }
    }

    console.log(`Upload successful (${uploadType}):`, filename);
    res.status(200).json({ success: true, file: fileData });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to upload file",
      details: error.message,
    });
  }
}