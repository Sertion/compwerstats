import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { MatchController } from '../../../match';
import { Character } from '../../../character';

import './page-main.scss';

import Subpage from '../../fragments/subpage';
import SeasonSelect from '../../fragments/season-select';
import LoadingSpinner from '../../fragments/loading-spinner';
import Navigation from '../navigation';

@Component({
    template: require('./page-main.html'),
    components: {
        Subpage,
        SeasonSelect,
        LoadingSpinner,
        Navigation
    }
})
export default class PageStats extends Vue {
    loading: boolean = true;
    characters: object[];
    maps: object[];
    stats: object;
    models: object;

    seasonWatcher: Function;

    created() {
        this.fetchStats();

        this.seasonWatcher = this.$store.watch(this.$store.getters.getSeasonId, () => {
            this.fetchStats()
        });
    }
    
    async fetchStats() {
        this.loading = true;
        const stats = await MatchController.calculateStatisticsOverview(this.$store.state.seasonId);
        const characters = await MatchController.calculateCharactersWinPercentage(this.$store.state.seasonId);
        const maps = await MatchController.calculateMapsWinPercentage(this.$store.state.seasonId);

        this.characters = characters.sort((a, b) => b.winPercentage - a.winPercentage).slice(0, 4);
        this.maps = maps.sort((a, b) => b.winPercentage - a.winPercentage).slice(0, 4);
        this.stats = stats;
        this.loading = false;
    }

    destroyed() {
        if (typeof this.seasonWatcher === 'function') {
            this.seasonWatcher();
        }
    }
}