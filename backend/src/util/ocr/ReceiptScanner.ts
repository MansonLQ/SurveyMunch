import Tesseract from "tesseract.js";
import sharp from "sharp";
// import fs from "fs";
// import path from "path";
// import os from "os";

async function scanReceipt(imagePath: string) {
  // const tempDir = path.join(os.tmpdir(), "receipt");
  // if (!fs.existsSync(tempDir)) {
  //   fs.mkdirSync(tempDir);
  // }

  //const processedImagePath = path.join(tempDir, "processed_receipt.jpg");
  const processedImagePath = "./test/processed_receipt.jpg";

  await sharp(imagePath).grayscale().threshold(150).toFile(processedImagePath);
  const {
    data: { text },
  } = await Tesseract.recognize(processedImagePath, "eng");

  const pattern = /(\d+([~-]\d+)+)/;

  const match = text.match(pattern);
  console.log(text);
  if (match) {
    const surveyCode = match[0];
    console.log(surveyCode);
    const numericSurveyCode = surveyCode.replace(/\D/g, "");

    //fs.unlinkSync(processedImagePath);

    return numericSurveyCode;
  } else {
    //fs.unlinkSync(processedImagePath);

    throw new Error("Unable to parse receipt");
  }
}

export default scanReceipt;
