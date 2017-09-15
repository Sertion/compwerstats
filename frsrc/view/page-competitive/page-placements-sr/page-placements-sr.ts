import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { Season, SeasonController } from '../../../season';

import './page-placements-sr.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import SeasonSelect from '../../fragments/season-select';
import ButtonBase from '../../button/base';

@Component({
    template: require('./page-placements-sr.html'),
    components: {
        Subpage,
        LoadingSpinner,
        SeasonSelect,
        ButtonBase
    }
})
export default class PagePlacementsSr extends Vue {
    loading: boolean = true;
    season: Season;
    seasonId: number;

    created() {
        this.fetchMatches();
    }

    async fetchMatches() {
        this.loading = true;

        this.seasonId = parseInt(this.$route.params.seasonId, 10);
        this.season = await SeasonController.getSeasonById(this.seasonId);

        this.loading = false;
    }

    @Watch('$route')
    watchRoute(to, from) {
        this.fetchMatches();
    }

    async save() {
        if (this.season.placementRating) {
            await this.season.save();
            this.$router.replace({
                name: 'competitive',
                params: {
                    seasonId: this.seasonId.toString()
                }
            });
        }
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