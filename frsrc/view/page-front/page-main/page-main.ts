import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { SeasonController } from '../../../season';
import { MatchController, MatchType } from '../../../match';

import './page-main.scss';

import ButtonFront from '../button-front';

@Component({
    template: require('./page-main.html'),
    components: {
        ButtonFront
    }
})
export default class PageFront extends Vue {
    loaded: boolean = false;
    competitiveLink: string = 'competitive';
    seasonId: string = '';

    async created() {
        const currentSeason = await SeasonController.getCurrent();
        const currentSeasonPlacementsLeft = await MatchController.hasPlacementsLeft(currentSeason.id);

        this.loaded = true;

        this.seasonId = currentSeason.id.toString();

        if (currentSeasonPlacementsLeft) {
            this.competitiveLink = 'placement';
        }
        else if (!currentSeason.placementRating) {
            this.competitiveLink = 'placement-sr';
        }
        else {
            this.competitiveLink = 'competitive';
        }
    }
}