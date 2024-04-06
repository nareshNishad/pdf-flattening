const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises; // Use the promise-based version of fs
const _pdf2img = require("./pdf2img");
const rimraf = require("rimraf");
const pathModule = require("path");

class Flattener {
  async flatten(buffer, options = {}) {
    const basePath = options.path || __dirname;
    const timestamp =
      Date.now() +
      Math.random().toString(36).substring(2, 6) +
      Math.random().toString(36).substring(2, 6);
    const path = pathModule.join(basePath, timestamp);

    await fs.mkdir(path, { recursive: true });
    await fs.mkdir(pathModule.join(path, "docs"), { recursive: true });

    const pdf2img = new _pdf2img();

    pdf2img.setOptions({
      type: options.type || "png",
      density: options.density || 200,
      outputdir: pathModule.join(path, "split"),
      outputname: "split",
      page: null,
    });

    await fs.writeFile(
      pathModule.join(path, "docs", "originalFile.pdf"),
      buffer
    );

    try {
      await pdf2img.convert(pathModule.join(path, "docs", "originalFile.pdf"));
      const splitFiles = await fs.readdir(pathModule.join(path, "split"));
      const sortedSplitFiles = splitFiles
        .map((file) => pathModule.join(path, "split", file))
        .sort(async (a, b) => {
          const statA = await fs.stat(a);
          const statB = await fs.stat(b);
          return statA.mtime.getTime() - statB.mtime.getTime();
        });

      const resultPath = pathModule.join(path, "docs", "combined.pdf");
      const pdfBytes = await imagesToPdf(
        sortedSplitFiles,
        path,
        resultPath,
        options.saveToFile
      );

      // Depending on user's preference, return buffer or path
      if (options.saveToFile) {
        return resultPath; // Return the path where the file is saved
      } else {
        return pdfBytes; // Return the buffer directly
      }
    } catch (err) {
      console.error("Error: ", err);
      throw err;
    } finally {
      // Cleanup, if not saving to file
      if (!options.saveToFile) {
        rimraf.sync(path);
      }
    }
  }
}

async function imagesToPdf(paths, directoryPath, resultPath, saveToFile) {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error("Must have at least one path in array");
  }

  const pdfDoc = await PDFDocument.create();
  for (const path of paths) {
    const imageBytes = await fs.readFile(path);
    let image;
    if (path.endsWith(".png")) {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      throw new Error("Unsupported image format");
    }

    const { width, height } = image;
    pdfDoc
      .addPage([width, height])
      .drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  if (saveToFile) {
    await fs.writeFile(resultPath, pdfBytes);
  }

  // Return PDF bytes directly unless saving to file
  return pdfBytes;
}

module.exports = new Flattener();
