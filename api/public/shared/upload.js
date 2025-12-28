import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import crypto from "crypto";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, content, uploadType, ticketId } = req.body;

    // Validation
    if (!filename || !content || !uploadType) {
      return res.status(400).json({
        error: "Missing required fields: filename, content, or uploadType",
      });
    }

    if (uploadType === "ticket" && !ticketId) {
      return res.status(400).json({
        error: "ticketId is required for ticket uploads",
      });
    }

    // Security check
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Determine upload directory based on type
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

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Check if file already exists
    const filePath = path.join(uploadDir, filename);
    if (existsSync(filePath)) {
      return res.status(409).json({
        error: `A file named "${filename}" already exists. Please rename your file or delete the existing one first.`,
      });
    }

    // Write file
    const buffer = Buffer.from(content, "base64");
    await writeFile(filePath, buffer);

    // Prepare response
    const ext = path.extname(filename).replace(".", "").toLowerCase();
    const fileData = {
      id: crypto.randomUUID(),
      name: filename,
      filename: filename,
      size: buffer.length, // Return bytes
      sizeFormatted: `${(buffer.length / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString(),
      type: ext,
      uploadType: uploadType,
      ...(uploadType === "ticket" && { ticketId: ticketId }),
    };

    console.log(`Upload successful (${uploadType}):`, filename);
    res.status(200).json({ success: true, file: fileData });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to upload file",
      details: error.message,
    });
  }
};
