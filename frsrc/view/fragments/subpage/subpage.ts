import Vue from 'vue';
import { Location } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import './subpage.scss';

import ButtonBack from '../../button/back';

@Component({
    template: require('./subpage.html'),
    components: {
        ButtonBack
    },
    computed: {
        noHead() {
            return !this.$slots.head;
        }
    }
})
export default class Subpage extends Vue {
    @Prop()
    back: string;

    @Prop()
    backProps: Object;

    @Prop()
    body: Vue;

    data() {
        return {
            to: <Location> {
                name: this.back,
                params: this.backProps
            }
        }
    }
};