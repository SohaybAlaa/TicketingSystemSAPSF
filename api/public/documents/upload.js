import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import crypto from "crypto";

export default async (req, res) => {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "uploads", "documents"); //adjust path ADMINSAPSF/uploads/documents

    if (!existsSync(uploadDir)) {
      // create uploads/documents folder if it doesn't exist ( also for uploads folder)
      await mkdir(uploadDir, { recursive: true });
    }

    const { filename, content } = req.body;

    // Validation
    if (!filename || !content) {
      return res.status(400).json({ error: "Missing filename or content" });
    }

    // Security check
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Check if file already exists
    const filePath = path.join(uploadDir, filename);
    if (existsSync(filePath)) {
      return res.status(409).json({
        error: `A file named "${filename}" already exists. Please rename your file or delete the existing one first.`,
      });
    }

    // Write file
    const buffer = Buffer.from(content, "base64"); //Buffer.from("SGVsbG8=", "base64") becomes bytes for Hello
    await writeFile(filePath, buffer); // excpects bytes - writeFile(path, data)

    // Prepare response
    const ext = path.extname(filename).replace(".", "").toLowerCase();
    const document = {
      id: crypto.randomUUID(),
      name: filename,
      filename: filename,
      size: `${(buffer.length / 1024).toFixed(0)} KB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      type: ext,
    };

    console.log("Upload successful:", filename);
    res.status(200).json({ success: true, documents: [document] });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ error: "Failed to upload file", details: error.message });
  }
};
