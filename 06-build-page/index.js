const fs = require('node:fs').promises;
const path = require('node:path');
const { watch } = require('node:fs');
const { stdout } = process;

const distPath = path.join(__dirname, 'project-dist');
const stylesPath = path.join(__dirname, 'styles');
const assetsPath = path.join(__dirname, 'assets');
const componentsPath = path.join(__dirname, 'components');
const templatePath = path.join(__dirname, 'template.html');
const distHtmlPath = path.join(__dirname, 'project-dist', 'index.html');
const distCssPath = path.join(distPath, 'style.css');
const distAssetsPath = path.join(distPath, 'assets');

async function createDirectoryIfNeeded(directoryPath) {
  try {
    await fs.access(directoryPath);
  } catch (err) {
    await fs.mkdir(directoryPath, { recursive: true });
    stdout.write(`Directory created: ${directoryPath}\n`);
  }
}

async function copyDir(src, dest) {
  try {
    await createDirectoryIfNeeded(dest);
    const elements = await fs.readdir(src, { withFileTypes: true });

    for (const element of elements) {
      const srcPath = path.join(src, element.name);
      const destPath = path.join(dest, element.name);

      if (element.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        stdout.write('Files copied: ' + destPath + '\n')
      }
    }
  } catch (err) {
    console.error('Error during directory copy:', err);
    throw err;
  }
}

async function mergeCssFiles() {
  try {
    const files = await fs.readdir(stylesPath);
    const cssFiles = files.filter((file) => path.extname(file) === '.css');
    let cssContent = '';

    for (const file of cssFiles) {
      const content = await fs.readFile(path.join(stylesPath, file), 'utf8');
      cssContent += content + '\n';
    }

    await fs.writeFile(distCssPath, cssContent);
    stdout.write('CSS files merged into style.css\n');
  } catch (err) {
    console.error('Error processing CSS files:', err);
  }
}

async function buildHtmlFromTemplate() {
  try {
    let template = await fs.readFile(templatePath, 'utf8');
    const componentFiles = await fs.readdir(componentsPath, {
      withFileTypes: true,
    });

    for (const file of componentFiles) {
      if (file.isFile() && path.extname(file.name) === '.html') {
        const componentName = path.basename(file.name, '.html');
        const componentContent = await fs.readFile(
          path.join(componentsPath, file.name),
          'utf8',
        );
        template = template.replace(
          new RegExp(`{{${componentName}}}`, 'g'),
          componentContent,
        );
      }
    }

    await fs.writeFile(distHtmlPath, template);
    stdout.write('index.html created from template.html with the replacement of template tags from the components\n');
  } catch (err) {
    console.error('Error creating HTML from template:', err);
  }
}

async function watchForChanges() {
  watch(stylesPath, async (eventType, filename) => {
    if (path.extname(filename) === '.css') {
      stdout.write(`Detected change in CSS file: ${filename}\n`);
      await mergeCssFiles();
    }
  });

  watch(componentsPath, async (eventType, filename) => {
    if (path.extname(filename) === '.html') {
      stdout.write(`Detected change in component: ${filename}\n`);
      await buildHtmlFromTemplate();
    }
  });

  watch(componentsPath, async (eventType, filename) => {
    if (path.extname(filename) === '.css') {
      stdout.write(`Detected change in styles: ${filename}\n`);
      await buildHtmlFromTemplate();
    }
  });

  watch(templatePath, async (eventType, filename) => {
    stdout.write(`Detected change in template: ${filename}\n`);
    await buildHtmlFromTemplate();
  });

  watch(assetsPath, { recursive: true }, async (eventType, filename) => {
    stdout.write(`Detected change in assets: ${filename}\n`);
    await copyDir(assetsPath, distAssetsPath);
  });
}

async function main() {
  try {
    await createDirectoryIfNeeded(distPath);
    await mergeCssFiles();
    await copyDir(assetsPath, distAssetsPath);
    await buildHtmlFromTemplate();
    await watchForChanges();
    stdout.write('For exit from watching mode press Ctrl+C\n');
    stdout.write(
      'Build process completed and watching for changes......\n',
    );
  } catch (err) {
    console.error('Error in main function:', err);
  }
}

main();
