import { app } from 'electron';
import { MainWindow } from './main-window';

app.on('ready', () => {
    MainWindow.getInstance().start();
});
