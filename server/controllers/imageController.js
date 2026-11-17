import sharp from "sharp";
import Image from "../models/Image";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";

const outputPath = path.join(__dirname, "..", "output.png");
async function createOutput(img) {
  return await fsPromises.appendFile(outputPath, img.data);
}

async function extractImage(x, y, width, height) {
  return await sharp(outputPath)
    .extract({
      left: parseInt(x),
      top: parseInt(y),
      height: parseInt(height),
      width: parseInt(width),
    })
    .toBuffer();
}

async function uploadImage(req, res) {
  try {
    const file = req.files;
    const { x, y, width, height, email } = req.body;
    const img = file[0];
    if (!img) {
      return res.status(400).json({ message: "Missing image" });
    }
    await createOutput(img);
    const fileName = `email_${new Date().getTime()}.png`;
    const buffer = await extractImage(x, y, width, height);
    if (!fs.existsSync(path.join(__dirname, "..", "images", "email"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "images", "email"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "images", "email", fileName),
      buffer,
    );
    const result = await Image.create({
      path: fileName,
      uploaded: new Date(),
      profile: false,
    });
    res.status(201).json({ message: "Image uploaded" });
  } catch (err) {
    return res.status(500).json({ message: "Upload failed" });
  }
}

export { uploadImage };
