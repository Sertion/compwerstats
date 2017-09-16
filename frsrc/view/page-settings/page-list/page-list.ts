import Vue from 'vue';
import {
    Component,
    Watch } from 'vue-property-decorator';

import { HeadSelectItem } from '../../../interface';

import { MatchController } from '../../../match';
import { CharacterController } from '../../../character';
import { CharacterTypeController } from '../../../charactertype';
import { CommentSuggestionController } from '../../../commentsuggestion';
import { OverwatchMapController } from '../../../overwatchmap';
import { OverwatchMapTypeController } from '../../../overwatchmaptype';
import { RankController } from '../../../rank';
import { SeasonController } from '../../../season';

import LoadingSpinner from '../../fragments/loading-spinner';
import Subpage from '../../fragments/subpage';
import FormHeadSelect from '../../fragments/head-select';
import ButtonBase from '../../button/base';
import ListItemSettings from '../list-item-settings';


@Component({
    template: require('./page-list.html'),
    name: 'PageSettingsList',
    components: {
        LoadingSpinner,
        FormHeadSelect,
        ButtonBase,
        Subpage,
        ListItemSettings
    },
    data: {
        type: ''
    }
})
export default class PageSettingsList extends Vue {
    type: string;
    loading: boolean = true;
    items: any[];
    order: string = 'id';
    createLabel: string;

    data() {
        return {
            loading: false,
            items: null,
            sortOrders: <HeadSelectItem[]>[{
                value: 'id',
                label: 'Id'
            }, {
                value: 'name',
                label: 'Name'
            }]
        }
    }

    created() {
        this.type = this.$route.params.type;
        this.createLabel = this.generateCreateLabel();
        this.fetchData();
    }

    @Watch('order')
    onOrderChange (to, from) {
        this.sort(this.items);
    }

    @Watch('$route')
    on$RouteChange (to, from) {
        this.type = to.params.type;
        this.createLabel = this.generateCreateLabel();
        this.fetchData();
    }

    goToCreate(ev) {
        this.$router.push({
            name: 'settings-edit',
            params: {
                type: this.type,
                id: 'create'
            }
        });
    }

    routeLinkParams(item) {
        return {
            type: this.type,
            id: item.id
        };
    }

    async fetchData() {
        this.items = null;
        this.loading = true;

        const fetchedItems = await this.fetchType();

        this.sort(fetchedItems);

        this.items = fetchedItems;
        this.loading = false;
    }

    async fetchType() {
        const typeToConstructor = {
            match: MatchController,
            character: CharacterController,
            charactertype: CharacterTypeController,
            commentsuggestion: CommentSuggestionController,
            map: OverwatchMapController,
            maptype: OverwatchMapTypeController,
            rank: RankController,
            season: SeasonController
        }

        return typeToConstructor[this.type].getAll();
    }

    sort(me) {
        me.sort((a, b) => {
            if (this.order === 'id') {
                return a.id - b.id;
            }
            else {
                let nameA = a.getName();
                let nameB = b.getName();

                if (nameA === nameB) {
                    return 0;
                }
                return nameA > nameB ? 1 : -1;
            }
        });
    }

    generateCreateLabel(): string {
        const typeToCreateLabel = {
            match: 'Add match',
            character: 'Add Character',
            charactertype: 'Add Character Type',
            commentsuggestion: 'Add Comment Suggestion',
            map: 'Add Map',
            maptype: 'Add Map Type',
            rank: 'Add Rank',
            season: 'Add Season'
        }

        return typeToCreateLabel[this.type];
    }
}