const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "../public/icons/icon.svg");
const sizes = [192, 512];

async function main() {
  for (const size of sizes) {
    await sharp(input)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icons/icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
