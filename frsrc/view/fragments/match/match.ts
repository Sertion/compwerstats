import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Match, MatchType } from '../../../match';
import { OverwatchMap, OverwatchMapController } from '../../../overwatchmap';
import { Character, CharacterController } from '../../../character';
import { Rank, RankController } from '../../../rank';

import './match.scss';

@Component({
    template: require('./match.html')
})
export default class MatchItem extends Vue {
    loading: boolean = true;
    currentMap: OverwatchMap;
    currentRank: Rank;
    usedCharacters: Character[];

    @Prop()
    match: Match;

    @Prop()
    maps: OverwatchMap[];

    @Prop()
    characters: Character[];

    @Prop()
    ranks: Rank[];

    created() {
        const fakeMap = OverwatchMap.create(0, 'REMOVED MAP', './static/img/no-map-image.jpg');
        this.currentMap = this.maps.reduce((prev, curr) => curr.id === this.match.overwatchMapId ? curr : prev, fakeMap);
        this.currentRank = RankController.getByRatingFromRanks(this.ranks, this.match.rating);
        this.usedCharacters = this.characters.filter((char) => this.match.character && this.match.character.includes(char.id));
    }

    data() {
        return {
            mapImageStyle: this.currentMap ? `background-image: url(${ this.currentMap.imagePath })` : ''
        }
    }

    toBackground(...images: string[]) {
        return 'background-image: ' + images
            .map((image) => `url(${ image })`)
            .join(', ');
    }
}