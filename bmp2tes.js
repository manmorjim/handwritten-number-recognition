var Jimp = require("jimp");
var fs = require('fs');
var csvStr = require('csv-stringify');

// PARAMS
// result number
var numberResult = null;
var numberIndex = process.argv.indexOf('-n');
if (numberIndex !== -1) {
  numberResult = process.argv[numberIndex + 1];
}

// whole folder
var folderPath = null;
var folderIndex = process.argv.indexOf('--all');
if (folderIndex !== -1) {
  folderPath = process.argv[folderIndex + 1];
}

// input file
var bmpFilePath = process.argv.find(arg => /.+\.bmp$/i.test(arg));

// file dest
var fileDest = null;
var dest = process.argv.indexOf('-d');
if (dest !== -1) {
  fileDest = process.argv[dest + 1];
}
if (fileDest === null) {
  if (folderPath !== null) {
    fileDest = folderPath + '/all.tes';
  }
  else {
    fileDest = bmpFilePath.replace(/\.bmp$/, '.tes');
  }
}

var bmp2CsvData = function (bmpPath, numberResult, callback) {
  let imageAsTxt = "";
  let csvData = Array(64).fill(0);
  Jimp.read(bmpPath, (err, image) => {
    image.grayscale();
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      let red = this.bitmap.data[idx + 0];
      let green = this.bitmap.data[idx + 1];
      let blue = this.bitmap.data[idx + 2];

      let indexBox = Math.floor(x / 4) + 8 * Math.floor(y / 4);

      // rgba values run from 0 - 255
      if (red == 0 && green == 0 && blue == 0) {
        csvData[indexBox] += 1;
        imageAsTxt += "1";
      }
      else {
        imageAsTxt += "0";
      }

      if (x === 31) {
        imageAsTxt += "\n";
      }
    });

    console.log('Imagen procesada:');
    console.log(imageAsTxt);

    let outputCode = Array(10).fill(0);
    outputCode[numberResult] = 1;

    callback(csvData.concat(outputCode));
  });
};

var writeTesFile = function (csvData, fileDest) {
  // write csv
  csvStr(csvData, function (err, output) {
    if (err) {
      return console.log(err);
    }
    fs.writeFile(fileDest, output, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('Fichero', fileDest, 'creado correctamente');
    });
  });
};

var csvData = [];
if (folderPath !== null) {
  bmpFilePaths = fs.readdirSync(folderPath);
  bmpFilePaths = bmpFilePaths.filter(bmpFile => /\.bmp$/i.test(bmpFile));
  bmpFilePaths.forEach((bmpFile, i) => {
    let numberFile = bmpFile.replace(/\.bmp$/i, '');
    bmp2CsvData(folderPath + '/' + bmpFile, numberFile, data => {
      csvData.push(data);
      if (i === (bmpFilePaths.length - 1)) {
        writeTesFile(csvData, fileDest);
      }
    });
  });
}
else if (bmpFilePath === null) {
  bmp2CsvData(bmpFilePath, numberResult, data => {
    csvData.push(data);
    writeTesFile(csvData, fileDest);
  });
}
