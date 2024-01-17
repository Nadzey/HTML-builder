const fs = require('node:fs');
const path = require('node:path');
const { stdout } = process;

const stylesPath = path.join(__dirname, 'styles');
const bundlePath = path.join(__dirname, 'project-dist', 'bundle.css');
let cssFilesContent = [];

fs.readdir(stylesPath, { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    let cssFiles = files.filter(file => file.isFile() && path.extname(file.name) === '.css');

    if (cssFiles.length === 0) {
        stdout.write('No CSS files found.');
        return;
    }

    cssFiles.forEach((file, index) => {
        const fullFilePath = path.join(stylesPath, file.name);

        fs.readFile(fullFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            cssFilesContent.push(data);

            // Запись в bundle.css после обработки всех CSS-файлов
            if (cssFilesContent.length === cssFiles.length) {
                fs.writeFile(bundlePath, cssFilesContent.join('\n'), (err) => {
                    if (err) {
                        console.error('Error writing to bundle.css:', err);
                    } else {
                        stdout.write('bundle.css was created successfully.');
                    }
                });
            }
        });
    });
});

