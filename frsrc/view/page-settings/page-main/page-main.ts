import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import './page-main.scss';

import Subpage from '../../fragments/subpage';
import ListItemSettings from '../../fragments/list-item-settings';

@Component({
    template: require('./page-main.html'),
    name: 'PageSettings',
    components: {
        Subpage,
        ListItemSettings
    }
})
export default class PageSettings extends Vue {}