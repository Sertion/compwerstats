import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import './navigation.scss';

@Component({
    template: require('./navigation.html')
})
export default class Navigation extends Vue {
}