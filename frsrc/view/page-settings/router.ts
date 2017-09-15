import { RouteConfig } from 'vue-router';
import PageSettings from './page-main';
import PageSettingsList from './page-list';
import PageSettingsEdit from './page-edit';

export default <RouteConfig[]>[
    {
        path: '/settings',
        name: 'settings',
        component: PageSettings
    },
    {
        path: '/settings/:type/list',
        name: 'settings-list',
        component: PageSettingsList
    },
    {
        path: '/settings/:type/edit/:id',
        name: 'settings-edit',
        component: PageSettingsEdit
    }
];