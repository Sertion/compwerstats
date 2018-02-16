import PageStats from './page-main';
import PageHeroes from './page-heroes';
import PageMaps from './page-maps';

export default [
    {
        path: '/stats',
        name: 'stats',
        component: PageStats
    },
    {
        path: '/stats/heroes',
        name: 'stats-heroes',
        component: PageHeroes
    },
    {
        path: '/stats/maps',
        name: 'stats-maps',
        component: PageMaps
    }
];