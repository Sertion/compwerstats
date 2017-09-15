import Vue from 'vue';
import { Location } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import './list-item-settings.scss';

@Component({
    template: require('./list-item-settings.html'),
    name: 'ListItemSettings'
})
export default class ListItemSettings extends Vue {
    @Prop()
    pageName: string;

    @Prop()
    type: string;

    @Prop()
    id: number;

    @Prop()
    label: string;

    @Prop()
    description: string;

    @Prop()
    icon: string;

    data() {
        const id = typeof this.id === 'number' ? this.id.toString(10) : '';

        return {
            moveHere: <Location> {
                name: this.pageName,
                params: {
                    'type': this.type,
                    'id': id
                }
            },
            className: this.generateClass()
        }
    }

    private generateClass() {
        let className = ['listItemSettings', `listItemSettings--${this.type}`];

        return className.join(' ');
    }
}