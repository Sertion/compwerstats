const Path = require('path');
const Url = require('url');

import { app, BrowserWindow } from 'electron';

export class MainWindow {
    public static instance: MainWindow;
    public window: Electron.BrowserWindow;

    private constructor() {
        this.setupListeners();
    }

    static getInstance(): MainWindow {
        if (!MainWindow.instance) {
            MainWindow.instance = new MainWindow();
        }

        return MainWindow.instance;
    }

    private setupListeners() {
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
        
        app.on('activate', () => {
            if (this.window === null) {
                this.create();
            }
        });
    }

    create() {
        this.window = new BrowserWindow({
            height: 350,
            width: 550,
            minHeight: 350,
            minWidth: 550,
            frame: false,
            title: "Compwerstats",
            icon: Path.join(__dirname, '..', 'static', 'img', 'compwerstats-logo.ico')
        });

        this.devTools();
    }

    start(): Promise<Electron.WebContents> {
        return new Promise((resolve, reject) => {
            if (!this.window) {
                this.create();
            }

            const mainPath = Path.join(__dirname, '..', 'index.html');
            const mainUrl = Url.format({
                pathname: mainPath,
                protocol: 'file:',
                slashes: true
            });

            this.window.loadURL(mainPath);

            resolve(this.window.webContents);
        });
    }

    devTools() {
        this.window.webContents.openDevTools({
            mode: 'detach'
        });
    }
}
