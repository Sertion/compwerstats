import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import updateUrl from '../../../update-checker';

import { Rank } from '../../../rank';
import { Season, SeasonController } from '../../../season';

import { SeasonMode, ButtonMode } from '../../../interface';

import { mainBasedOnMode } from '../../../router-helper';

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
    mainLink: string = '';
    matchesLink: string = '';
    updateUrl: string = '';
    updateClass: string = 'sidebarLink sidebarLink--update';
    buttonInfo: ButtonMode = {
        label: '',
        shortLabel: '',
        path: ''
    };

    modeWatcher: Function = null;
    seasonWatcher: Function = null;

    rating: number;
    seasonId: number;
    seasonMode: SeasonMode;
    rank: Rank;
    season: Season = null;

    async created() {
        this.fetchUpdateInformation();
        this.buttonInfo = this.quickAddInfo(this.$store.state.seasonMode);
        this.matchesLink = mainBasedOnMode(this.$store.state.seasonMode);
        this.mainLink = this.$store.state.seasonMode === SeasonMode.Matches ? '/competitive' : '/placement';
        this.modeWatcher = this.$store.watch(this.$store.getters.getSeasonMode, (newMode) => {
            this.buttonInfo = this.quickAddInfo(newMode);
            this.matchesLink = mainBasedOnMode(newMode);
            this.mainLink = newMode === SeasonMode.Matches ? '/competitive' : '/placement';
        });

        this.season = await this.getSeason(this.$store.state.seasonId);
        this.seasonWatcher = this.$store.watch(this.$store.getters.getSeasonId, async (newSeasonId) => {
            this.season = await this.getSeason(newSeasonId);
        });
    }

    async fetchUpdateInformation() {
        const updateInterval = 22 * 60 * 60 * 1000;

        this.updateUrl = await updateUrl();
        this.updateClass = this.updateUrl ? 'sidebarLink sidebarLink--updateAvalible sidebarLink--update' : 'sidebarLink  sidebarLink--update';

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

    quickAddInfo(mode): ButtonMode {
        switch (mode) {
            case SeasonMode.Matches:
                return {
                    label: 'Add match',
                    shortLabel: '+ Match',
                    path: this.$router.resolve({
                        name: 'competitive-add'
                    }).location.path
                };
            case SeasonMode.Placements:
                return {
                    label: 'Add placement',
                    shortLabel: '+ PLCMT',
                    path: this.$router.resolve({
                        name: 'placement-add'
                    }).location.path
                };
            case SeasonMode.PlacementsComplete:
                return {
                    label: 'Add starting SR',
                    shortLabel: '+ SR',
                    path: this.$router.resolve({
                        name: 'placement-sr'
                    }).location.path
                };
        }
    }

    getSeason(seasonId) {
        return SeasonController.getSeasonById(seasonId);
    }

    quickAdd() {
        this.$router.push({
            name: this.quickAddInfo(this.$store.state.seasonMode).path,
            params: {
                seasonId: this.$store.state.seasonId.toString()
            }
        });
    }

    setSeason(seasonId) {
        this.$store.dispatch('updateSeasonId', seasonId);
    }

    destroyed() {
        if (typeof this.modeWatcher === 'function') {
            this.modeWatcher();
        }
        if (typeof this.seasonWatcher === 'function') {
            this.seasonWatcher();
        }
    }
}