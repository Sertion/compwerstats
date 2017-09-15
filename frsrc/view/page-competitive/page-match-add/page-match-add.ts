import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Match, MatchController, MatchType } from '../../../match';
import { Character, CharacterController } from '../../../character';
import { CharacterType, CharacterTypeController } from '../../../charactertype';
import { CommentSuggestion, CommentSuggestionController } from '../../../commentsuggestion';

import './page-match-add.scss';

import Subpage from '../../fragments/subpage';
import LoadingSpinner from '../../fragments/loading-spinner';
import SeasonSelect from '../../fragments/season-select';
import MatchResultSelector from '../../fragments/match-result';
import MapList from '../../fragments/map-list';
import CharacterList from '../../fragments/character-list';
import GroupSize from '../../fragments/group-size';
import ButtonBase from '../../button/base';

@Component({
    template: require('./page-match-add.html'),
    components: {
        Subpage,
        LoadingSpinner,
        SeasonSelect,
        MapList,
        GroupSize,
        MatchResultSelector,
        CharacterList,
        ButtonBase
    }
})
export default class PageMatchAdd extends Vue {
    loading: boolean = true;
    match: Match;
    comments: CommentSuggestion[]
    seasonId: number;
    comment: string = '';

    @Prop()
    type: string;

    created() {
        this.fetchData();
    }

    async fetchData() {
        const type = this.type === 'competitive' ? MatchType.Match : MatchType.Placement;

        this.loading = true;

        this.seasonId = parseInt(this.$route.params.seasonId, 10);

        this.comments = await CommentSuggestionController.getAll();

        this.match = new Match();
        this.match.seasonId = this.seasonId;
        this.match.type = type;

        this.loading = false;
    }

    @Watch('$route')
    watchRoute(to, from) {
        this.fetchData();
    }

    updateSeasonId(seasonId) {
        this.$router.replace({
            name: this.$router.currentRoute.name,
            params: {
                seasonId: seasonId
            }
        });
    }

    save(ev: Event) {
        ev.preventDefault();
        const saveButtonWithFocus = document.querySelector('.button--save:focus');
        if (saveButtonWithFocus) {
            if (this.type === 'placement') {
                this.savePlacement();
            }
            else {
                this.saveMatch();
            }
        }
    }

    savePlacement() {
        if (this.validatePlacement()) {
            this.match.time = +(new Date());
            this.match.save();
            this.$router.push({
                name: 'placement',
                params: {
                    seasonId: this.seasonId.toString()
                }
            });
        }
    }

    validatePlacement() {
        const m = this.match;
        return !!(m.result);
    }

    async saveMatch() {
        if (this.validateMatch()) {
            const lastMatch = await MatchController.latestSeasonMatchRating(this.seasonId);
            this.match.time = +(new Date());
            this.match.comment = this.comment;
            if (this.match.rating <= 500) {
                this.match.result = this.match.result || MatchController.ratingToResult(this.match.rating, lastMatch);
            }
            else {
                this.match.result = MatchController.ratingToResult(this.match.rating, lastMatch);
            }
            this.match.save();
            this.$router.push({
                name: 'competitive',
                params: {
                    seasonId: this.seasonId.toString()
                }
            });
        }
    }

    validateMatch() {
        const m = this.match;
        return !!(m.rating);
    }

    skipPlacements() {
        this.$router.push({
            name: 'placement-sr',
            params: {
                seasonId: this.seasonId.toString()
            }
        });
    }

    addToComment(append: string) {
        if (this.comment) {
            this.comment = `${ this.comment } ${ append }`;
        }
        else {
            this.comment = append;
        }
    }
}