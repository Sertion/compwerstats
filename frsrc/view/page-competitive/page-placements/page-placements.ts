import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { HeadSelectItem } from '../../../interface';

import { Match, MatchController, MatchType } from '../../../match';
import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { Character, CharacterController } from '../../../character';
import { Rank, RankController } from '../../../rank';

import './page-placements.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import SeasonSelect from '../../fragments/season-select';
import MatchItem from '../../fragments/match';
import FormHeadSelect from '../../fragments/head-select';

@Component({
    template: require('./page-placements.html'),
    components: {
        Subpage,
        LoadingSpinner,
        MatchItem,
        SeasonSelect,
        FormHeadSelect
    }
})
export default class PagePlacements extends Vue {
    loading: boolean = true;
    matches: Match[] = [];
    maps: OverwatchMap[] = [];
    characters: Character[] = [];
    ranks: Rank[] = [];
    seasonId: number;
    order: string = 'time';
    sortOrders: HeadSelectItem[] = [{
        value: 'time',
        label: 'Newest first'
    }, {
        value: 'time-reverse',
        label: 'Oldest first'
    }];

    created() {
        this.fetchMatches();
    }

    async fetchMatches() {
        this.loading = true;

        this.seasonId = parseInt(this.$route.params.seasonId, 10);
        const matches = await MatchController.getBySeason(this.seasonId, MatchType.Placement);
        this.matches = this.sort(matches);
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

    @Watch('order')
    onOrderChange (to, from) {
        this.sort(this.matches);
    }

    sort(me) {
        return me.sort((a, b) => {
            if (this.order === 'time') {
                return a.time - b.time;
            }
            else if (this.order === 'time-reverse') {
                return b.time - b.time;
            }
            else {
                return a.rating - b.rating;
            }
        });
    }
}