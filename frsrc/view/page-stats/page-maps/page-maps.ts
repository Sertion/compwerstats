import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { MatchController } from '../../../match';
import { Character } from '../../../character';

import './page-maps.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import Navigation from '../navigation';

@Component({
    template: require('./page-maps.html'),
    components: {
        Subpage,
        LoadingSpinner,
        Navigation
    }
})
export default class PageMaps extends Vue {
    loading: boolean = true;
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
        const stats = await MatchController.calculateStatistics(this.$store.state.seasonId);
        const processedStats = {
            totalNumberOfMatches: stats.totalNumberOfMatches,
            mapTypes: {},
            mapTypesStats: stats.mapType
        };

        Object.entries(stats.map).forEach((kv: [string, object]) => {
            const [key, wlData] = kv;
            const map = stats.data.maps[key];

            if (!map) return;

            if (typeof processedStats.mapTypes[map.overwatchMapTypeId] === 'undefined') {
                processedStats.mapTypes[map.overwatchMapTypeId] = {};
            }

            processedStats.mapTypes[map.overwatchMapTypeId][map.id] = wlData;
        });

        this.models = stats.data;
        this.stats = processedStats;
        this.loading = false;
    }

    destroyed() {
        if (typeof this.seasonWatcher === 'function') {
            this.seasonWatcher();
        }
    }
}