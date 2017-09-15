import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { Match, MatchController, MatchType } from '../../../match';
import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { Character, CharacterController } from '../../../character';
import { Rank, RankController } from '../../../rank';

import './page-placements.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import SeasonSelect from '../../fragments/season-select';
import MatchItem from '../../fragments/match';

@Component({
    template: require('./page-placements.html'),
    components: {
        Subpage,
        LoadingSpinner,
        MatchItem,
        SeasonSelect
    }
})
export default class PagePlacements extends Vue {
    loading: boolean = true;
    matches: Match[] = [];
    maps: OverwatchMap[] = [];
    characters: Character[] = [];
    ranks: Rank[] = [];
    seasonId: number;

    created() {
        this.fetchMatches();
    }

    async fetchMatches() {
        this.loading = true;

        this.seasonId = parseInt(this.$route.params.seasonId, 10);
        this.matches = await MatchController.getBySeason(this.seasonId, MatchType.Placement);
        this.maps = await OverwatchMapController.getAll();
        this.characters = await CharacterController.getAll();
        this.ranks = await RankController.getAll();

        this.loading = false;
    }

    @Watch('$route')
    watchRoute(to, from) {
        this.fetchMatches();
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