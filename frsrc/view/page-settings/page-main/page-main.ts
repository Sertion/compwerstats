import Vue from 'vue';
import {
    Component,
    Watch } from 'vue-property-decorator';

import './page-main.scss';

import ListItemSettings from '../list-item-settings';
import Subpage from '../../fragments/subpage';

@Component({
    template: require('./page-main.html'),
    name: 'PageSettings',
    components: {
        Subpage,
        ListItemSettings
    }
})
export default class PageSettings extends Vue {}