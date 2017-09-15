import { RouteConfig } from 'vue-router';
import PageFront from './page-main';

export default <RouteConfig[]>[
    {
        path: '/',
        name: 'front',
        component: PageFront
    }
];