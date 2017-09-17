import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import updateUrl from '../../../update-checker';

import { CompwerstatsDatabase } from '../../../database';
import { SeasonController } from '../../../season';
import { MatchController } from '../../../match';
import { Rank, RankController } from '../../../rank';

import './chrome.scss';

import ButtonBase from '../../button/base';
import ButtonChrome from '../button';

@Component({
    template: require('./chrome.html'),
    components: {
        ButtonChrome,
        ButtonBase
    }
})
export default class Chrome extends Vue {
    loaded: boolean = false;
    seasonId: string;
    quickAddLabel: string = '';
    quickAddPath: string = '';
    currentRank: Rank = null;
    currentRating: number = -1;
    updateUrl: string = '';
    updateClass: string = 'updateButton';

    created() {
        this.prepareDataBasedProperties();
        this.fetchUpdateInformation();
        this.setupListeners();
    }

    async prepareDataBasedProperties(): Promise<string> {
        const currentSeason = await SeasonController.getCurrent();
        const currentSeasonPlacementsLeft = await MatchController.hasPlacementsLeft(currentSeason.id);
        this.currentRating = await MatchController.latestSeasonMatchRating(currentSeason.id);
        this.currentRank = await RankController.getByRating(this.currentRating);

        this.loaded = true;
        this.seasonId = currentSeason.id.toString();

        if (currentSeason.placementRating) {
            this.quickAddLabel = 'Add match';
            this.quickAddPath = 'competitive-add';
        }
        else if (currentSeasonPlacementsLeft) {
            this.quickAddLabel = 'Add placement';
            this.quickAddPath = 'placement-add';
        }
        else {
            this.quickAddLabel = 'Add starting SR';
            this.quickAddPath = 'placement-sr';
        }

        return this.quickAddPath;
    }

    setupListeners() {
        const _this = this;
        const db = CompwerstatsDatabase.getInstance();
        const callback = function() {
            this.onsuccess = () => {
                /**
                 * This sexy setTimeout is to allow for the running
                 * transacrion to finnish before reading from the
                 * database. When time can be found we should solve
                 * this in a better way.
                 * 
                 * When it is solved, please remove this comment.
                 */
                setTimeout(() => {
                    _this.prepareDataBasedProperties()
                }, 0);
            };
        };

        db.match.hook('creating', callback);
        db.season.hook('creating', callback);
        db.season.hook('updating', callback);
    }

    async fetchUpdateInformation() {
        const updateInterval = 4 * 60 * 60 * 1000;

        this.updateUrl = await updateUrl();
        this.updateClass = this.updateUrl ? 'updateButton updateButton--avalible' : 'updateButton';

        setTimeout(() => {
            this.fetchUpdateInformation();
        }, updateInterval);
    }

    openUpdate() {
        const { shell } = require('electron');
        if (this.updateUrl) {
            shell.openExternal(this.updateUrl);
        }
    }

    quickAdd() {
        this.$router.push({
            name: this.quickAddPath,
            params: {
                seasonId: this.seasonId
            }
        });
    }
}