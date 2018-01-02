import Vue from 'vue';
import { Component, Watch, Prop } from 'vue-property-decorator';

import { CharacterController, Character } from '../../../character';
import { CharacterTypeController, CharacterType } from '../../../charactertype';
import { CommentSuggestionController, CommentSuggestion } from '../../../commentsuggestion';
import { MatchController, Match } from '../../../match';
import { OverwatchMapController, OverwatchMap } from '../../../overwatchmap';
import { OverwatchMapTypeController, OverwatchMapType } from '../../../overwatchmaptype';
import { RankController, Rank } from '../../../rank';
import { SeasonController, Season } from '../../../season';

import './page-edit.scss';

import { component } from 'vue-form-generator';
import LoadingSpinner from '../../fragments/loading-spinner';
import Subpage from '../../fragments/subpage';

@Component({
    template: require('./page-edit.html'),
    name: 'PageSettingsEdit',
    components: {
        LoadingSpinner,
        Subpage,
        "vue-form-generator": component
    }
})
export default class PageSettingsEdit extends Vue {
    backProperties: object;

    type: string;

    id: string;

    schema: Object = {};

    model: Match | Character | CharacterType | CommentSuggestion | OverwatchMap | OverwatchMapType | Rank | Season;

    loading: boolean = true;

    data() {
        return {
            'backProperties': {
                type: this.$route.params.type
            },
            'modelName': function() {
                return this.model && this.model.getName();
            }
        }
    }

    created() {
        this.type = this.$route.params.type;
        this.id = this.$route.params.id;
        this.fetchData();
    }

    @Watch('$route')
    on$RouteChange (to, from) {
        this.type = to.params.type;
        this.id = to.params.id;
        this.fetchData();
    }

    async remove(model) {
        // TODO: Replace with a cooler confirm for cooler people
        const yes = confirm('Permanently remove this item?\nThings can and probably will break if you remove things that are used in other places.');

        if (yes) {
            model.delete();
            if (this.type === 'season') {
                const currentActiveSeason = await SeasonController.getCurrent();
                if (currentActiveSeason) {
                    this.$store.dispatch('updateSeasonId', currentActiveSeason.id);
                }
            }
            this.backToList();
        }
    }

    backToList() {
        this.$router.push({
            name: 'settings-list',
            params: {
                type: this.type
            }
        });
    }

    async fetchData() {
        this.model = await this.fetchModel();
        this.schema = await this.fetchSchema();
        this.loading = false;
    }

    async fetchSchema() {
        const currentConstructor = this.getController();
        return currentConstructor.getFormSchema(this.id === 'create', async (createdId) => {
            if (this.type === 'season') {
                const currentActiveSeason = await SeasonController.getCurrent();
                if (currentActiveSeason) {
                    this.$store.dispatch('updateSeasonId', currentActiveSeason.id);
                }
            }
            this.backToList();
        });
    }

    async fetchModel(): Promise<Match | Character | CharacterType | CommentSuggestion | OverwatchMap | OverwatchMapType | Rank | Season> {
        const create = this.id === 'create';
        const type = this.type + (create ? '-create' : '' );

        switch (type) {
            case 'match':
                const match = await Match.load(parseInt(this.id, 10));;
                match.splitTime();
                return match;
            case 'match-create':
                return new Match();
            case 'character':
                return Character.load(parseInt(this.id, 10));
            case 'character-create':
                return new Character();
            case 'charactertype':
                return CharacterType.load(parseInt(this.id, 10));
            case 'charactertype-create':
                return new CharacterType();
            case 'commentsuggestion':
                return CommentSuggestion.load(parseInt(this.id, 10));
            case 'commentsuggestion-create':
                return new CommentSuggestion();
            case 'map':
                return OverwatchMap.load(parseInt(this.id, 10));
            case 'map-create':
                return new OverwatchMap();
            case 'maptype':
                return OverwatchMapType.load(parseInt(this.id, 10));
            case 'maptype-create':
                return new OverwatchMapType();
            case 'rank':
                return Rank.load(parseInt(this.id, 10));
            case 'rank-create':
                return new Rank();
            case 'season':
                return Season.load(parseInt(this.id, 10));
            case 'season-create':
                return new Season();
        }
    }

    getController() {
        switch (this.type) {
            case 'match':
                return MatchController;
            case 'character':
                return CharacterController;
            case 'charactertype':
                return CharacterTypeController;
            case 'commentsuggestion':
                return CommentSuggestionController;
            case 'map':
                return OverwatchMapController;
            case 'maptype':
                return OverwatchMapTypeController;
            case 'rank':
                return RankController;
            case 'season':
                return SeasonController;
        }

    }
}