import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { MatchController } from '../../../match';
import { Character } from '../../../character';

import './page-main.scss';

import Subpage from '../../fragments/subpage';
import SeasonSelect from '../../fragments/season-select';
import LoadingSpinner from '../../fragments/loading-spinner';

@Component({
    template: require('./page-main.html'),
    components: {
        Subpage,
        SeasonSelect,
        LoadingSpinner
    }
})
export default class PageStats extends Vue {
    loading: boolean = true;
    stats: object;
    seasonId: number;
    models: object;

    created() {
        this.fetchStats();
    }
    
    async fetchStats() {
        this.seasonId = parseInt(this.$route.params.seasonId, 10);
        this.loading = true;
        const stats = await MatchController.calculateStatistics(this.seasonId);
        const processedStats = {
            totalNumberOfMatches: stats.totalNumberOfMatches,
            characterTypes: {},
            characterTypesStats: stats.characterType,
            mapTypes: {},
            mapTypesStats: stats.mapType
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

    @Watch('$route')
    watchRoute(to, from) {
        this.fetchStats();
    }

    updateSeasonId(seasonId) {
        this.$router.replace({
            name: this.$router.currentRoute.name,
            params: {
                seasonId: seasonId
            }
        });
    }
}