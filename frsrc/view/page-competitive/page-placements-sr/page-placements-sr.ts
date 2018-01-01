import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { Season, SeasonController } from '../../../season';

import './page-placements-sr.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import ButtonBase from '../../button/base';

@Component({
    template: require('./page-placements-sr.html'),
    components: {
        Subpage,
        LoadingSpinner,
        ButtonBase
    }
})
export default class PagePlacementsSr extends Vue {
    loading: boolean = true;
    season: Season;

    created() {
        this.fetchMatches();
    }

    async fetchMatches() {
        this.loading = true;

        this.season = await SeasonController.getSeasonById(this.$store.state.seasonId);

        this.loading = false;
    }

    async save() {
        if (this.season.placementRating) {
            await this.$store.dispatch('updateSeasonId', await this.season.save());
            this.$router.replace({
                path: '/'
            });
        }
    }
}