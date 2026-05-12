import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputDir = path.join(__dirname, "public", "images");
const targets = [
  { input: "coming-soon.jpg", output: "coming-soon.webp", width: 1920 },
  { input: "hero.jpg", output: "hero.webp", width: 1920 },
  { input: "about.jpg", output: "about.webp", width: 1600 },
  { input: "cellar-club.jpg", output: "cellar-club.webp", width: 1600 },
  { input: "hero2.jpg", output: "hero2.webp", width: 1920 },
  { input: "hero3.jpg", output: "hero3.webp", width: 1920 },
  { input: "hero4.jpg", output: "hero4.webp", width: 1920 },
];

async function convert() {
  for (const target of targets) {
    const inputPath = path.join(inputDir, target.input);
    const outputPath = path.join(inputDir, target.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${target.input} — file not found`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize({ width: target.width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outputPath);

      const inputSize = (fs.statSync(inputPath).size / 1024).toFixed(0);
      const outputSize = (fs.statSync(outputPath).size / 1024).toFixed(0);

      console.log(
        `${target.input} → ${target.output} | ${inputSize}KB → ${outputSize}KB`
      );
    } catch (err) {
      console.error(`Failed on ${target.input}:`, err.message);
    }
  }
}

convert();
