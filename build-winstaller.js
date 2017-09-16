const path = require('path');

const electronPackager = require('electron-packager');
const packagerOptions = {
    dir: path.join(__dirname),
    out: path.join(__dirname, 'dist'),
    arch: 'x64',
    platform: 'win32',
    overwrite: true,
    ignore: ['frsrc', 'basrc', 'cert', '.vscode'],
    icon: path.join(__dirname, 'static', 'img', 'compwerstats-logo.ico')
};
electronPackager(packagerOptions).then(
    () => console.log(`The installer has been created.`),
    
    (err) => console.error('[pack]', err)
)

