import { RouteConfig } from 'vue-router';

import { SeasonMode } from '../../interface';

import PageMatchList from './page-matchlist';
import PageMatchAdd from './page-match-add';
import PagePlacementsSr from './page-placements-sr';

export default <RouteConfig[]>[
    {
        path: '/competitive',
        name: 'competitive',
        component: PageMatchList
    },
    {
        path: '/competitive/add',
        name: 'competitive-add',
        component: PageMatchAdd
    },
    {
        path: '/competitive/:id/edit',
        name: 'competitive-edit',
        component: PageMatchAdd
    },
    {
        path: '/placement',
        name: 'placement',
        component: PageMatchList
    },
    {
        path: '/placement/add',
        name: 'placement-add',
        component: PageMatchAdd
    },
    {
        path: '/placement/:id/edit',
        name: 'placement-edit',
        component: PageMatchAdd
    },
    {
        path: '/placement/placement-sr',
        name: 'placement-sr',
        component: PagePlacementsSr
    }
];