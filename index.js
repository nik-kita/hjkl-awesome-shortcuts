const fs = require('fs');
const path = require('path');
const parser = require('jsonc-parser');

const filesInFolder = (folder = 'vs-code') => new Promise((resolve, reject) => {
  console.log(folder);
  fs.readdir(
    path.join(__dirname, folder),
    { withFileTypes: 'jsonc' },
    (error, files) => {
      if (error) reject(error);

      resolve(files.map((file) => ({ ...file, name: folder + '/' + file.name })));
    }
  )
});

const generateSingleArray = async (files, only = []) => {
  const filePromises = files
    .filter(({ name }) => only.length === 0
      || only.includes(name.slice(name.indexOf('/') + 1, name.indexOf('.jsonc'))))
    .map(({ name }) => new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, name),
        { encoding: 'utf8' },
        (error, arrStr) => error ? reject(error) : resolve(parser.parse(arrStr)),
      );
    }));
  const arrays = await Promise.all(filePromises);

  return arrays.reduce((acc, arr) => Array.isArray(acc) ? [...acc, ...arr] : acc, []);
};

const writeAllKeibindigsJson = (array, name = 'all') => new Promise((resolve, reject) => fs.writeFile(
  path.join(__dirname, `${name.toUpperCase()}-KEYBINDINGS.jsonc`),
  JSON.stringify(array),
  (error, result) => error ? reject(error) : resolve(result),
));

(async () => {
  const dir = process.argv[2];
  const only = process.argv.slice(3);

  console.log(process.argv[2], only);

  const files = await filesInFolder(dir);
  const array = await generateSingleArray(files, only);
  await writeAllKeibindigsJson(array, dir);
})();
