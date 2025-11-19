import express from "express";
import cors from "cors";
import ytdlp from "yt-dlp-exec";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Home ----------
app.get("/", (req, res) => {
  res.json({
    status: "YT-DLP API Docker ✅",
    endpoints: {
      info: "/info?url=",
      mp3: "/mp3?url=",
      video: "/video?url=&format="
    }
  });
});

// ---------- Video Info ----------
app.get("/info", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const info = await ytdlp(url, { dumpSingleJson: true });
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(info, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Download MP3 ----------
app.get("/mp3", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "url required" });

  const filename = `temp_${uuid()}.mp3`;
  try {
    await ytdlp(url, { extractAudio: true, audioFormat: "mp3", output: filename });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");

    const stream = fs.createReadStream(filename);
    stream.pipe(res);
    stream.on("close", () => fs.unlinkSync(filename));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Download Video ----------
app.get("/video", async (req, res) => {
  const url = req.query.url;
  const format = req.query.format || "best";
  if (!url) return res.status(400).json({ error: "url required" });

  try {
    const proc = ytdlp(url, { f: format, output: "-" });
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
    proc.stdout.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Start Server ----------
app.listen(3000, () => console.log("YT-DLP API running on port 3000"));
