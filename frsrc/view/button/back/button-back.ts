import Vue from 'vue';
import { Location } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import './button-back.scss';

@Component({
    template: require('./button-back.html')
})
export default class ButtonBack extends Vue {
    @Prop()
    to: Location;
}