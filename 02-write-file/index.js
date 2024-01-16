const fs = require('node:fs');
const path = require('node:path'); 

const filePath = path.join(__dirname, '02-write-file.txt');
const { stdout, stdin } = process;

const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

stdout.write('Hey there! Enter text (to finish type "exit" or use CTRL+C):\n');

stdin.on('data', (data) => {
    const text = data.toString();

    if (text.trim() === 'exit') {
        process.exit();
    } else {
        writeStream.write(text);
        stdout.write('Text has been added to the file. Continue entering or enter "exit" to finish:\n')
    }
});

process.on('SIGINT', () => {
    stdout.write('\nGood bye!\n');
    process.exit();
});

process.on('exit', () => {
    writeStream.close();
    stdout.write('\nExit the program\n')
})
