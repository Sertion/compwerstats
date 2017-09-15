import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import './button-base.scss';

@Component({
    template: require('./button-base.html')
})
export default class ButtonBase extends Vue {
    @Prop()
    type: string;

    @Prop()
    label: string;

    data() {
        return {
            classNames: this.generateClasses()
        }
    }

    clickHandler(ev) {
        this.$emit('clicked', ev);
    }

    private generateClasses(): string {
        let classes = ['button', `button--${this.type}`];

        return classes.join(' ');
    }
}