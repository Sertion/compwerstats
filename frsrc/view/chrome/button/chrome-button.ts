import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import './chrome-button.scss';

@Component({
    template: require('./chrome-button.html')
})
export default class ButtonChrome extends Vue {
    @Prop()
    title: string;

    @Prop()
    path: string;

    @Prop()
    action: string;

    private getCurrentWindow() {
        const remote = require('electron').remote;
        return remote.getCurrentWindow();
    }

    clickHandler() {
        const func = this[this.action];
        if (typeof func === 'function') {
            func();
        }
    }

    minimize() {
        this.getCurrentWindow().minimize();
    }

    close() {
        this.getCurrentWindow().close();
    }

    maximize() {
        const currentWindow = this.getCurrentWindow();

        if (currentWindow.isMaximized()) {
            currentWindow.unmaximize();
        }
        else {
            currentWindow.maximize();
        }
    }
};