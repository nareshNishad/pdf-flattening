# pdf-flattening

`pdf-flattening` is a Node.js library that provides an easy-to-use interface for converting PDF files into images and then recompiling them back into a single PDF document. This process is often referred to as "flattening" and can be particularly useful for simplifying the structure of PDF documents, making them easier to handle in various applications.

## Installation

To install `pdf-flattening`, run the following command in your project directory:

```bash
npm install pdf-flattening
```

Make sure you have GraphicsMagick and Ghostscript installed on your system, as they are required for PDF processing:

GraphicsMagick: http://www.graphicsmagick.org/ </br>
Ghostscript: https://www.ghostscript.com/

## Usage

**Flatten PDF and Return as Buffer**</br>

To flatten a PDF and get the result as a buffer (useful for immediate processing or sending over the web):

```
const fs = require('fs');
const flattener = require('pdf-flattening');

// Read your PDF file into a buffer
const pdfBuffer = fs.readFileSync('path/to/your/document.pdf');

// Flatten the PDF and get the result as a buffer
flattener.flatten(pdfBuffer, { saveToFile: false })
  .then(resultBuffer => {
    // Do something with the resultBuffer, like saving it to a file or sending it in a response
    fs.writeFileSync('path/to/your/flattened.pdf', resultBuffer);
  })
  .catch(err => {
    console.error('An error occurred:', err);
  });

```

**Flatten PDF and Save to File**</br>

To flatten a PDF and save the flattened version directly to a file:

```
const fs = require('fs');
const flattener = require('pdf-flattening');

// Read your PDF file into a buffer
const pdfBuffer = fs.readFileSync('path/to/your/document.pdf');

// Specify the output path and saveToFile option
flattener.flatten(pdfBuffer, { path: 'output/path', saveToFile: true })
  .then(outputPath => {
    console.log(`Flattened PDF saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('An error occurred:', err);
  });

```

**PDF to Image Conversion**</br>

To convert a PDF page to an image using the pdf2img functionality within pdf-flattening:

```

const Pdf2Img = require('pdf-flattening/pdf2img');
const pdf2img = new Pdf2Img();

pdf2img.setOptions({
  type: 'jpg', // or 'png'
  density: 300,
  outputdir: 'path/to/output/images',
  outputname: 'myImage'
});

pdf2img.convert('path/to/your/document.pdf')
  .then(results => {
    console.log('Images:', results);
  })
  .catch(err => {
    console.error('Conversion error:', err);
  });


```

## API Reference

### Pdf2Img

#### `setOptions(options)`

Set conversion options.

`Options`
The flatten method accepts an options object which allows you to customize the behavior of the PDF flattening process. Here are the available options:

- path: Specifies the directory path where temporary files will be stored during processing. Defaults to the current directory.
- type: Determines the image format to use for the intermediate conversion. Can be 'jpg' or 'png'. Default is 'jpg'.
- density: Sets the DPI (dots per inch) for the intermediate images. A higher value results in better quality but larger files. Default is 200.
- saveToFile: A boolean that specifies whether the flattened PDF should be saved to a file or returned as a buffer. If true, the method returns the path to the saved file. If false, it returns a buffer. Default is false.

#### `convert(input)`

Convert a PDF file to images.

- `input`: Path to the PDF file to convert.
- Returns a Promise that resolves with the conversion results or rejects with an error.

### Flattener

#### `flatten(buffer, options)`

Flatten a PDF document.

- `buffer`: A buffer containing the PDF data to flatten.
- `options`: An object containing options such as the path for temporary files, image type, and density.
- Returns a Promise that resolves with a buffer containing the flattened PDF or rejects with an error.

# Contributing

Contributions are welcome! Please submit all pull requests to the repository.

# License

pdf-flattening is MIT licensed.
