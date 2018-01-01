import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { SeasonMode, MatchType } from '../../../interface';

import { Match, MatchController } from '../../../match';
import { Character, CharacterController } from '../../../character';
import { CharacterType, CharacterTypeController } from '../../../charactertype';
import { CommentSuggestion, CommentSuggestionController } from '../../../commentsuggestion';
import { SeasonController } from '../../../season';

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
    type: MatchType;

    created() {
        this.fetchData();
    }

    async fetchData() {
        this.type = <MatchType>(this.$store.state.seasonMode === SeasonMode.Placements ? MatchType.Placement : MatchType.Match);

        this.loading = true;

        this.seasonId = this.$store.state.seasonId;

        this.comments = await CommentSuggestionController.getAll();

        this.match = new Match();
        this.match.seasonId = this.seasonId;
        this.match.type = this.type === MatchType.Placement ? MatchType.Placement : MatchType.Match;

        this.loading = false;
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

    async savePlacement() {
        if (this.validatePlacement()) {
            if (!this.match.time) {
                this.match.time = Date.now();
            }
            await this.match.save();
            const seasonMode = await SeasonController.getMode(this.match.seasonId);
            this.$store.commit('seasonMode', seasonMode);
            this.$router.push('/');
        }
        else {
            const label = <HTMLElement>this.$el.querySelector('.resultsLabel');
            if (label) {
                label.focus();
            }
        }
    }

    validatePlacement() {
        const m = this.match;
        return !!(m.result);
    }

    async saveMatch() {
        if (this.validateMatch()) {
            const lastMatchRating = await MatchController.latestSeasonMatchRating(this.seasonId);
            const lastMatch = await MatchController.latestSeasonMatch(this.seasonId, this.match.type);
            if (!this.match.time) {
                this.match.time = Date.now();
            }
            this.match.comment = this.comment;
            if (this.match.rating <= 500 && !this.match.result) {
                this.match.result = this.match.result || MatchController.ratingToResult(this.match.rating, lastMatchRating);
            }
            else if (!this.match.result) {
                this.match.result = MatchController.ratingToResult(this.match.rating, lastMatchRating);
            }
            if (lastMatch && this.match.result === lastMatch.result) {
                this.match.streak = lastMatch.streak + 1;
            }
            else {
                this.match.streak = 1;
            }
            await this.match.save();
            this.$store.dispatch('updateRating', this.match.rating);
            this.$router.push('/');
        }
        else {
            const rating = <HTMLElement>this.$el.querySelector('.addMatchRating');
            if (rating) {
                rating.focus();
            }
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