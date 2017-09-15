import { RouteConfig } from 'vue-router';
import PageCompetitive from './page-competitive';
import PagePlacements from './page-placements';
import PageMatchAdd from './page-match-add';
import PagePlacementsSr from './page-placements-sr';

export default <RouteConfig[]>[
    {
        path: '/competitive/:seasonId',
        name: 'competitive',
        component: PageCompetitive
    },
    {
        path: '/competitive/:seasonId/add',
        name: 'competitive-add',
        component: PageMatchAdd,
        props: {
            type: 'competitive'
        }
    },
    {
        path: '/competitive/:seasonId/:id/edit',
        name: 'competitive-edit',
        component: PageCompetitive
    },
    {
        path: '/placement/:seasonId',
        name: 'placement',
        component: PagePlacements
    },
    {
        path: '/placement/:seasonId/add',
        name: 'placement-add',
        component: PageMatchAdd,
        props: {
            type: 'placement'
        }
    },
    {
        path: '/placement/:seasonId/:id/edit',
        name: 'placement-edit',
        component: PagePlacements
    },
    {
        path: '/placement/:seasonId/placement-sr',
        name: 'placement-sr',
        component: PagePlacementsSr
    }
];