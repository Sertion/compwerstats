import * as semver from 'semver';

const packageInfo = require('../package.json');
const checkUrl = 'https://api.github.com/repos/sertion/compwerstats/releases/latest';
const buildPrefix = 'compwerstats-win32-x64';

export default async function getUpdateUrl(): Promise<string> {
    try {
        const response = await fetch(checkUrl);
        const json = await response.json();
        const latestExternalVersion = semver.clean(json.tag_name);
        const internalVersion = semver.clean(packageInfo.version);
        const isLocalLatest = semver.eq(latestExternalVersion, internalVersion);

        if (!isLocalLatest && json.assets.length) {
            for (let i = 0; i < json.assets.length; i++) {
                if (json.assets[i].name.indexOf(buildPrefix) === 0) {
                    return json.assets[0].browser_download_url;
                }
            }
        }
    } catch (e) {
        console.error(e);
    }

    return '';
}
