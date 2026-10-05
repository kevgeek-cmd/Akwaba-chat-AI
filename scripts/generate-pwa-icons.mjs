import sharp from "sharp";
import path from "path";
import fs from "fs";

const sourcePath = "/Users/macbook/.gemini/antigravity-ide/brain/451b7d81-5de1-4b79-9d99-e05d9ce4da5c/.user_uploaded/media_1791170001000.png";
const publicIconsDir = path.resolve(process.cwd(), "public/icons");
const publicDir = path.resolve(process.cwd(), "public");

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

async function generate() {
  console.log("Generating PWA icons from uploaded elephant mascot...");

  // 1. Standard transparent square icons (512x512 and 192x192)
  // The source image is 439x512. We fit it inside a square with transparent padding.
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    const resizedElephant = await sharp(sourcePath)
      .resize({
        width: Math.round(size * 0.9),
        height: Math.round(size * 0.9),
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resizedElephant, gravity: "center" }])
      .png()
      .toFile(path.join(publicIconsDir, `icon-${size}x${size}.png`));

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // 2. Maskable icons for Android (W3C spec: content must be within central 80% safe zone, solid background)
  for (const size of [192, 512]) {
    // 72% content size guarantees it's well inside the 80% safe circle/squircle
    const safeContentSize = Math.round(size * 0.72);
    const safeElephant = await sharp(sourcePath)
      .resize({
        width: safeContentSize,
        height: safeContentSize,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    // Solid white background with subtle brand styling
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: safeElephant, gravity: "center" }])
      .png()
      .toFile(path.join(publicIconsDir, `icon-maskable-${size}x${size}.png`));

    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }

  // 3. Apple Touch Icon (180x180, solid background required by iOS Safari)
  const appleContentSize = Math.round(180 * 0.85);
  const appleElephant = await sharp(sourcePath)
    .resize({
      width: appleContentSize,
      height: appleContentSize,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: appleElephant, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  console.log("✓ Generated apple-touch-icon.png (180x180)");

  // 4. Favicon 32x32 and 16x16
  await sharp(sourcePath)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon-32x32.png"));

  await sharp(sourcePath)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, "favicon-16x16.png"));

  console.log("✓ Generated favicon-32x32.png and favicon-16x16.png");
  console.log("All PWA icons generated successfully!");
}

generate().catch(console.error);
