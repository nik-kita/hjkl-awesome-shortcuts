const fs = require('fs');
const path = require('path');
const parser = require('jsonc-parser');

fs.readdir(__dirname, { withFileTypes: 'jsonc' }, (error, files) => {
  const dataPromise = files.map(({ name }) => {
    return new Promise(
      (resolve) => fs.readFile(
        path.join(__dirname, name),
        { encoding: 'utf-8' },
        (errOnFileRead, data) => resolve(parser.parse(data)))
    );
  });

  (async () => {
    const data = await Promise.all(dataPromise);

    const allKeybindings = data.reduce((acc, arr) => {
      return Array.isArray(arr) ? [...acc, ...arr] : acc;
    }, [])

    console.log(allKeybindings);

    fs.writeFile(
      path.join(__dirname, 'ALL_KEYBINDIGS.json'),
      JSON.stringify(allKeybindings),
      (err, data) => {
        console.log('ALL_KEYBINDINGS.json is generated');
      },
    );
  })();
});
