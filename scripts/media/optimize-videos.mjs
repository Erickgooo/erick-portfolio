// Recompresses the site's videos: H.264 MP4 (+faststart) replacing the original
// in place, a VP9 WebM next to it, and a WebP poster when none exists.
// Audio is removed ONLY for videos the UI plays muted without controls AND that
// carry no audible content (mean_volume <= -45 dB or no audio stream).
//
// Fix round 1 (2026-09-26): a recompressed MP4 or WebM must never be shipped if
// it isn't actually smaller than the alternative it's replacing/accompanying:
//  - MP4: if the CRF-32-floor encode is not strictly smaller than the original
//    file, the original bytes are kept as-is ("KEPT ORIGINAL").
//  - WebM: only kept as a sibling if it ends up at least 10% smaller than the
//    final MP4. One retry at a higher CRF (+14 instead of +8) is allowed; if
//    that still isn't >=10% smaller, the WebM is deleted and not referenced.
import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync } from "node:fs";
import sharp from "sharp";

const VIDEOS = [
  { file: "public/videohome.mp4", mutedNoControls: true, targetMB: 1.2, poster: false },
  {
    file: "public/images/projects/project-01/leadbot.mp4",
    mutedNoControls: true,
    targetMB: 1.2,
    poster: true,
  },
  {
    file: "public/images/projects/project-01/chatbot-artesa.mp4",
    mutedNoControls: true,
    targetMB: 1.2,
    poster: true,
  },
  {
    file: "public/images/projects/cuatrimotos-project/chatbot-video.mp4",
    mutedNoControls: true,
    targetMB: 1.0,
    poster: true,
  },
  {
    file: "public/images/projects/project-01/video-01.mp4",
    mutedNoControls: false,
    targetMB: 4,
    poster: true,
  },
];

const WEBM_MIN_SAVINGS = 0.1; // WebM must be at least 10% smaller than the final MP4.

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r;
}

function probe(file) {
  const r = run("ffprobe", ["-v", "error", "-show_streams", "-of", "json", file]);
  const streams = JSON.parse(r.stdout).streams;
  const v = streams.find((s) => s.codec_type === "video");
  return {
    width: v.width,
    height: v.height,
    hasAudio: streams.some((s) => s.codec_type === "audio"),
  };
}

function meanVolume(file) {
  const r = spawnSync("ffmpeg", ["-i", file, "-af", "volumedetect", "-vn", "-f", "null", "-"], {
    encoding: "utf8",
  });
  const m = r.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/);
  return m ? Number(m[1]) : Number.NEGATIVE_INFINITY;
}

function encodeWebm(src, crf, keepAudio, out) {
  run("ffmpeg", [
    "-y",
    "-i",
    src,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    String(crf),
    "-b:v",
    "0",
    "-row-mt",
    "1",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    ...(keepAudio ? ["-c:a", "libopus", "-b:a", "64k"] : ["-an"]),
    out,
  ]);
  return mb(out);
}

const scale = "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'";
const mb = (f) => statSync(f).size / 1048576;

for (const v of VIDEOS) {
  if (!existsSync(v.file)) {
    console.log(`skip (missing) ${v.file}`);
    continue;
  }
  const info = probe(v.file);
  const vol = info.hasAudio ? meanVolume(v.file) : Number.NEGATIVE_INFINITY;
  const keepAudio = info.hasAudio && (!v.mutedNoControls || vol > -45);
  const before = mb(v.file);

  let crf = 26;
  const tmp = v.file.replace(/\.mp4$/, ".tmp.mp4");
  for (;;) {
    run("ffmpeg", [
      "-y",
      "-i",
      v.file,
      "-vf",
      scale,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      String(crf),
      "-profile:v",
      "high",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      ...(keepAudio ? ["-c:a", "aac", "-b:a", "96k"] : ["-an"]),
      tmp,
    ]);
    if (mb(tmp) <= v.targetMB || crf >= 32) break;
    crf += 2;
  }

  let keptOriginal = false;
  if (mb(tmp) >= before) {
    // The re-encode didn't actually shrink the file: keep the original bytes.
    rmSync(tmp);
    keptOriginal = true;
  } else {
    rmSync(v.file);
    renameSync(tmp, v.file);
  }
  const finalMp4MB = mb(v.file);

  // WebM sibling: only worth shipping if it's meaningfully smaller than the
  // final MP4. Try the normal offset first, then one retry at a higher CRF.
  const webm = v.file.replace(/\.mp4$/, ".webm");
  const threshold = finalMp4MB * (1 - WEBM_MIN_SAVINGS);
  let webmMB = encodeWebm(v.file, crf + 8, keepAudio, webm);
  let webmCrf = crf + 8;
  if (webmMB > threshold) {
    webmCrf = crf + 14;
    webmMB = encodeWebm(v.file, webmCrf, keepAudio, webm);
  }
  const webmKept = webmMB <= threshold;
  if (!webmKept) {
    rmSync(webm);
  }

  const posterWebp = v.file.replace(/\.mp4$/, "-poster.webp");
  if (v.poster && !existsSync(posterWebp)) {
    const png = v.file.replace(/\.mp4$/, ".poster.png");
    run("ffmpeg", ["-y", "-ss", "0.5", "-i", v.file, "-frames:v", "1", png]);
    await sharp(png).webp({ quality: 85 }).toFile(posterWebp);
    rmSync(png);
  }

  const out = probe(v.file);
  const audioNote = info.hasAudio ? `${vol} dB` : "none";
  const overTargetNote = finalMp4MB > v.targetMB ? "  !! OVER TARGET" : "";
  const webmNote = webmKept
    ? `webm ${webmMB.toFixed(2)}MB (crf ${webmCrf}, kept: >=10% smaller than mp4)`
    : `webm DELETED (best attempt ${webmMB.toFixed(2)}MB at crf ${webmCrf} was not >=10% smaller than mp4 ${finalMp4MB.toFixed(2)}MB)`;
  console.log(
    `${v.file}: ${before.toFixed(2)}MB -> mp4 ${finalMp4MB.toFixed(2)}MB${keptOriginal ? " (KEPT ORIGINAL)" : ""} | crf ${crf} | ${out.width}x${out.height} | audio: ${audioNote} -> ${keepAudio ? "KEPT" : "REMOVED"}${overTargetNote} | ${webmNote}`,
  );
}
