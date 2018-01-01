import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { Season } from '../../../season';

import './page-main.scss';

import Subpage from '../../fragments/subpage';
import ButtonBase from '../../button/base';
import ListItemSettings from '../../fragments/list-item-settings';

@Component({
    template: require('./page-main.html'),
    name: 'PageCreateSeason',
    components: {
        Subpage,
        ButtonBase,
        ListItemSettings
    }
})
export default class PageCreateSeason extends Vue {
    season: Season = Season.create('');

    async saveSeason(ev) {
        if (/\d+/.test(this.season.name)) {
            await this.$store.dispatch('updateSeasonId', await this.season.save());
            this.$router.push({
                path: '/'
            });
        }
    }
}