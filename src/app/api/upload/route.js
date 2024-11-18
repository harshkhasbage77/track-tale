import path from "path";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.replaceAll(" ", "_");

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      filePath: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
