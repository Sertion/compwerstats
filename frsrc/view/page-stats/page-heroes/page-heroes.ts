import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { MatchController } from '../../../match';
import { Character } from '../../../character';

import './page-heroes.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import Navigation from '../navigation';

@Component({
    template: require('./page-heroes.html'),
    components: {
        Subpage,
        LoadingSpinner,
        Navigation
    }
})
export default class PageStats extends Vue {
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
            characterTypes: {},
            characterTypesStats: stats.characterType,
        };

        Object.entries(stats.character).forEach((kv: [string, object]) => {
            const [key, wlData] = kv;
            const character = stats.data.characters[key];

            if (!character) return;

            if (typeof processedStats.characterTypes[character.typeId] === 'undefined') {
                processedStats.characterTypes[character.typeId] = {};
            }

            processedStats.characterTypes[character.typeId][character.id] = wlData;
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