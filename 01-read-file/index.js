const fs = require('node:fs');
const path = require('node:path'); 

const readStream = fs.createReadStream('01-read-file/text.txt', 'utf8');
const { stdout } = process;

readStream.on('data', (chunk) => {
    stdout.write('New data received:\n');
    stdout.write(chunk);
});

readStream.on('error', (error) => {
    console.error('Error reading file: ', error);
});

readStream.on('end', () => {
    stdout.write('\nEnd of file reached');
});

process.on("exit", (code) => {
    if (code === 0) {
      stdout.write("\nEverything is ok");
    } else {
      stdout.write(`\nSomething went wrong. The program exited with code ${code}`);
    }
});
