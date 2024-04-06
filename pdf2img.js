const fs = require("fs").promises;
const gm = require("gm").subClass({ imageMagick: true });
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

class Pdf2Img {
  constructor() {
    this.options = {
      type: "jpg",
      density: 600,
      outputdir: "",
      outputname: "",
      page: null,
    };
  }

  setOptions(opts) {
    Object.assign(this.options, opts);
  }

  getOptions() {
    return this.options;
  }

  async convert(input) {
    if (path.extname(input) !== ".pdf") {
      throw new Error("Unsupported file type.");
    }

    try {
      await fs.access(input);
    } catch (error) {
      throw new Error("Input file not found.");
    }

    const output = path.basename(input, ".pdf");
    const outputDir = this.options.outputdir || `${output}/`;

    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Handle error if any, maybe log it but not necessary to stop the process
    }

    this.options.outputname = this.options.outputname || output;

    const pages = await this.getPageCount(input);
    const conversionPromises = pages.map((page) =>
      this.convertPage(input, page, outputDir)
    );

    return Promise.all(conversionPromises);
  }

  async getPageCount(input) {
    const cmd = `gm identify -format "%p " "${input}"`;
    const { stdout: pageCountString } = await exec(cmd);
    const pages = pageCountString.match(/[0-9]+/g).map(Number);

    if (!pages.length) {
      throw new Error("Could not determine page count.");
    }

    if (this.options.page !== null) {
      if (this.options.page > 0 && this.options.page <= pages.length) {
        return [this.options.page];
      } else {
        throw new Error("Invalid page number.");
      }
    }

    return pages;
  }

  async convertPage(input, page, outputDir) {
    const outputFile = path.join(
      outputDir,
      `${this.options.outputname}_${page}.${this.options.type}`
    );
    const pageSpecificInput = `${input}[${page - 1}]`;

    return new Promise((resolve, reject) => {
      gm(pageSpecificInput)
        .density(this.options.density, this.options.density)
        .quality(100)
        .write(outputFile, async (err) => {
          if (err) {
            return reject(new Error("Failed to write output file."));
          }

          try {
            const stats = await fs.stat(outputFile);
            if (stats.size === 0) {
              return reject(new Error("Zero sized output image detected."));
            }

            resolve({
              page,
              name: path.basename(outputFile),
              size: stats.size / 1000.0,
              path: outputFile,
            });
          } catch (error) {
            reject(new Error("Error accessing output file."));
          }
        });
    });
  }
}

module.exports = Pdf2Img;
