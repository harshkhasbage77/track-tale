import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get("video");

    if (!videoFile || typeof videoFile === "string") {
      return NextResponse.json({ error: "No video file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const inputPath = path.join(process.cwd(), "uploads", `video_${Date.now()}.mp4`);
    const outputPath = path.join(process.cwd(), "uploads", `audio_${Date.now()}.mp3`);

    fs.writeFileSync(inputPath, buffer);

    // Extract audio using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec("libmp3lame")
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    fs.unlinkSync(inputPath); // Clean up video file

    return NextResponse.json({ audioPath: `/uploads/${path.basename(outputPath)}` });
  } catch (error) {
    console.error("Error extracting audio:", error);
    return NextResponse.json({ error: "Failed to extract audio" }, { status: 500 });
  }
}
