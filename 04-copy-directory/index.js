const fs = require('fs').promises;
const path = require('path');
const { stdout } = process;
const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

async function copyDir(src, dest) {
  try {
    await fs.access(dest);
    return false; // Directory already exists
  } catch (error) {
    // Directory does not exist, continue copying
  }

  try {
    await fs.mkdir(dest, { recursive: true });
    const elements = await fs.readdir(src, { withFileTypes: true });

    for (let elem of elements) {
      const srcPath = path.join(src, elem.name);
      const destPath = path.join(dest, elem.name);

      if (elem.isFile()) {
        await fs.copyFile(srcPath, destPath);
      } else if (elem.isDirectory()) {
        await copyDir(srcPath, destPath);
      }
    }
    return true;
  } catch (err) {
    console.error('Error during directory copy:', err);
    throw err;
  }
}

async function watchDirectory() {
  try {
    const sourceFiles = await fs.readdir(sourceDir);
    const targetFiles = await fs.readdir(targetDir);

    // Checking and copying modified files
    for (const file of sourceFiles) {
      const sourceFilePath = path.join(sourceDir, file);
      const targetFilePath = path.join(targetDir, file);
      const sourceStats = await fs.stat(sourceFilePath);
      let targetStats;

      try {
        targetStats = await fs.stat(targetFilePath);
      } catch {
        // File not found in the target directory, should be copied
        targetStats = null;
      }

      if (!targetStats || sourceStats.mtimeMs > targetStats.mtimeMs) {
        await fs.copyFile(sourceFilePath, targetFilePath);
        stdout.write(`Detected change in file: ${file}\n`);
      }
    }

    // Check and delete files not present in the source directory
    for (const file of targetFiles) {
      if (!sourceFiles.includes(file)) {
        const targetFilePath = path.join(targetDir, file);
        await fs.unlink(targetFilePath);
        stdout.write(`Detected deletion of file: ${file}\n`);
      }
    }
  } catch (err) {
    console.error('Error while watching directory:', err);
  }
}

async function main() {
  try {
    const copied = await copyDir(sourceDir, targetDir);
    if (copied) {
      stdout.write('Directory copied successfully\n');
    } else {
      stdout.write('Directory already exists, no need to copy\n');
    }
    stdout.write('If you want cansel watching press Ctrl+C\n');
    stdout.write('Watching for changes...\n');

    await watchDirectory();
    setInterval(async () => {
      await watchDirectory();
    }, 1000);
  } catch (err) {
    console.error('Error during operations:', err);
  }
}

main();
