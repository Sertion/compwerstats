import Vue from 'vue';
import {
    Component,
    Prop } from 'vue-property-decorator';

import './button-front.scss';

import { SeasonController } from '../../../season';

@Component({
    template: require('./button-front.html')
})
export default class ButtonFront extends Vue {
    @Prop()
    type: string;

    @Prop()
    link: string;

    @Prop()
    label: string;

    @Prop()
    description: string;

    @Prop()
    seasonId: string;

    data() {
        return {
            classNames: this.generateClasses()
        }
    }

    clickHandler() {;
        this.$router.push({
            name: this.link || this.type,
            params: {
                seasonId: this.seasonId
            }
        })
    }

    private generateClasses(): string {
        let classes = ['buttonFront', `buttonFront--${this.type}`];

        return classes.join(' ');
    }
}