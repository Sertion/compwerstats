import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { HeadSelectItem, SeasonMode, MatchType } from '../../../interface';

import { Match, MatchController } from '../../../match';
import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { Character, CharacterController } from '../../../character';
import { Rank, RankController } from '../../../rank';

import './page-matchlist.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import MatchItem from '../../fragments/match';
import FormHeadSelect from '../../fragments/head-select';

@Component({
    template: require('./page-matchlist.html'),
    components: {
        Subpage,
        LoadingSpinner,
        MatchItem,
        FormHeadSelect
    }
})
export default class PageMatchList extends Vue {
    seasonWatcher: Function;

    loading: boolean = true;
    matches: Match[] = [];
    order: string = 'time-reverse';
    sortOrders: HeadSelectItem[] = [{
        value: 'time-reverse',
        label: 'Newest first'
    }, {
        value: 'time',
        label: 'Oldest first'
    }, {
        value: 'rating',
        label: 'Rating'
    }];

    created() {
        this.fetchMatches();

        this.seasonWatcher = this.$store.watch(this.$store.getters.getSeasonId, () => {
            this.fetchMatches()
        });
    }

    async fetchMatches() {
        this.loading = true;
        var matchType = this.$store.state.seasonMode === SeasonMode.Matches ? MatchType.Match : MatchType.Placement;

        if (this.$store.state.seasonId) {
            this.matches = this.sort(await MatchController.getBySeason(this.$store.state.seasonId, matchType));
        }

        this.loading = false;
    }

    @Watch('order')
    onOrderChange (to, from) {
        this.sort(this.matches);
    }

    sort(me) {
        return me.sort((a, b) => {
            if (this.order === 'time-reverse') {
                return b.time - a.time;
            }
            else if (this.order === 'time') {
                return a.time - b.time;
            }
            else {
                return b.rating - a.rating;
            }
        });
    }

    destroyed() {
        if (typeof this.seasonWatcher === 'function') {
            this.seasonWatcher();
        }
    }
}