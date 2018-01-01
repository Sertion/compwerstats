import { RouteConfig } from 'vue-router';
import PageCreateSeason from './page-main';

export default <RouteConfig[]>[
    {
        path: '/create-season',
        name: 'create-season',
        component: PageCreateSeason
    }
];