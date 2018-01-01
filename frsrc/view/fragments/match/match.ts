import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Match } from '../../../match';
import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { Character, CharacterController } from '../../../character';
import { Rank, RankController } from '../../../rank';

import { MatchType } from '../../../interface';

import './match.scss';

import LoadingSpinner from '../../fragments/loading-spinner';

@Component({
    template: require('./match.html'),
    components: {
        LoadingSpinner
    }
})
export default class MatchItem extends Vue {
    loading: boolean = true;
    showingDetails: boolean = false;
    map: OverwatchMap;
    rank: Rank;
    characters: Character[];

    @Prop()
    match: Match;

    async created() {
        this.map = await OverwatchMap.load(this.match.overwatchMapId);
        this.rank = await RankController.getByRating(this.match.rating);
        this.characters = await Promise.all(this.match.character.map(Character.load));

        if (typeof this.map === 'undefined') {
            // If we don't know what map it is, we create a temporary fake map
            this.map = OverwatchMap.create(0, 'UNKNOWN MAP', './static/img/no-map-image.jpg');
        }

        this.loading = false;
    }

    data() {
        return {
            mapImageStyle: this.map ? `background-image: url(${ this.map.imagePath })` : ''
        }
    }

    toBackground(...images: string[]) {
        return 'background-image: ' + images
            .map((image) => `url(${ image })`)
            .join(', ');
    }
}