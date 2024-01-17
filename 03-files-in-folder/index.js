const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'secret-folder');
const { stdout } = process;

fs.readdir(filePath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error with reading directory:', err);
    return;
  }

  files.forEach((file) => {
    if (file.isFile()) {
      const fullFilePath = path.join(filePath, file.name);
      const fileExt = path.extname(file.name).slice(1);
      const fileName = path.basename(file.name, `.${fileExt}`);

      fs.stat(fullFilePath, (err, stats) => {
        if (err) {
          console.error('Error with reading directory:', err);
          return;
        }
        stdout.write('\nSecret-folder file:\n');
        const fileSizeKb = (stats.size / 1024).toFixed(3);
        stdout.write(`${fileName} - ${fileExt} - ${fileSizeKb}kb`);
      });
    } else {
        console.error(`Error detected: ${file.name}, information should only be displayed for files located in 03-files-in-folder/secret-folder.`);
      }
  });
});
