const fs = require('node:fs/promises');
const path = require('node:path');

const filePath = path.join(__dirname, '02-write-file.txt');
const { stdout, stdin } = process;

fs.writeFile(filePath, '')
    .then(() => {
        stdout.write('File created. Enter text (to finish type "exit" or use CTRL+C):\n');
    })
    .catch(err => {
        console.error('Error creating file:', err);
    });

const readline = require('node:readline').createInterface({
    input: stdin,
    output: stdout
});

readline.on('line', async (line) => {
    if (line.trim() === 'exit') {
        readline.close();
    } else {
        try {
            await fs.appendFile(filePath, line + '\n');
            stdout.write('Text has been added to the file. Continue entering or enter "exit" to finish:\n');
        } catch (err) {
            console.error('Error writing to file:', err);
        }
    }
}).on('close', () => {
    stdout.write('Goodbye!');
    process.exit();
});
