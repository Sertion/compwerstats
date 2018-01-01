import Vue from 'vue';
import Vuex from 'vuex'
import VueRouter from 'vue-router';
import * as VueMoment from 'vue-moment';
import Chrome from './view/chrome/chrome';
import RouterStats from './view/page-stats/router';
import RouterSettings from './view/page-settings/router';
import RouterCompetitive from './view/page-competitive/router';
import RouterCreateSeason from './view/page-create-season/router';

import { SeasonMode } from './interface'

import { mainBasedOnMode } from './router-helper';
import PercentFilter from './view/filters/percent';

import { SeasonController } from './season';
import { MatchController } from './match';
import { Rank, RankController } from './rank';

async function init() {
    // Initing initial data
    const {season, seasonMode, rating, rank} = await getInitialState();

    // Initing Vue stuff
    Vue.use(Vuex);
    Vue.use(VueRouter);
    Vue.use(VueMoment);

    Vue.filter(PercentFilter.name, PercentFilter);

    const store = new Vuex.Store({
        strict: true,
        state: {
            seasonId: <number> (season ? season.id : null),
            seasonMode: <SeasonMode> seasonMode,
            rating: <number> rating,
            rank: <Rank> rank
        },
        getters: {
            getSeasonId: (state) => () => state.seasonId,
            getSeasonMode: (state) => () => state.seasonMode,
            getRating: (state) => () => state.rating,
            getRank: (state) => () => state.rank
        },
        mutations: {
            seasonId: (store, seasonId: number) => {
                store.seasonId = seasonId;
            },
            seasonMode: (store, mode: SeasonMode) => {
                store.seasonMode = mode;
            },
            rating: (store, rating: number) => {
                store.rating = rating;
            },
            rank: (store, rank: Rank) => {
                store.rank = rank;
            }
        },
        actions: {
            updateSeasonId: async (context, seasonId: number): Promise<void> => {
                const season = await SeasonController.getSeasonById(seasonId);
                const seasonMode = await SeasonController.getMode(seasonId);
                var rating = await MatchController.latestSeasonMatchRating(seasonId);

                if (!rating && season.placementRating) {
                    rating = season.placementRating;
                }
                else if (!rating) {
                    rating = -1;
                }

                context.commit('seasonId', seasonId);
                context.commit('seasonMode', seasonMode);
                context.dispatch('updateRating', rating);
            },
            updateRating: async (context, rating): Promise<void> => {
                const rank = await RankController.getByRating(rating);

                context.commit('rating', rating);
                context.commit('rank', rank);
            }
        }
    });

    const router = new VueRouter({
        routes: [
            {
                path: '/',
                redirect: (to) => {
                    return mainBasedOnMode(store.state.seasonMode);
                }
            },
            ...RouterStats,
            ...RouterSettings,
            ...RouterCompetitive,
            ...RouterCreateSeason
        ]
    });

    const vue = new Vue({
        el: '.app',
        store,
        components: {
            Chrome
        },
        router: router
    });

    return vue;
}

async function getInitialState() {
    let seasonMode = null;
    let rating = null;
    let rank = null;
    const season = await SeasonController.getCurrent();
    if (season) {
        seasonMode = await SeasonController.getMode(season.id);
        rating = await MatchController.latestSeasonMatchRating(season.id);
        rank = await RankController.getByRating(rating);
    }

    return {
        season,
        seasonMode,
        rating,
        rank
    };
}

init();
