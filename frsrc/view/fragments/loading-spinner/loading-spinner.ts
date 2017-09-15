import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import './loading-spinner.scss';

@Component({
    template: require('./loading-spinner.html')
})
export default class LoadingSpinner extends Vue {};