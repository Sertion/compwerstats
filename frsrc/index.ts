import Vue from 'vue';
import VueRouter from 'vue-router';
import Chrome from './view/chrome/chrome';
import RouterFront from './view/page-front/router';
import RouterStats from './view/page-stats/router';
import RouterSettings from './view/page-settings/router';
import RouterCompetitive from './view/page-competitive/router';

import PercentFilter from './view/filters/percent';

const VueMoment = require('vue-moment');

Vue.use(VueRouter);
Vue.use(VueMoment);

Vue.filter(PercentFilter.name, PercentFilter);

const router = new VueRouter({
    routes: [
        ...RouterFront,
        ...RouterStats,
        ...RouterSettings,
        ...RouterCompetitive
    ]
});

const vue = new Vue({
    el: '.app',
    components: {
        Chrome
    },
    router: router
});
