const contentLib = require('/lib/xp/content');

exports.getSiteFromQueryContext = function (queryContext) {
    if (queryContext && queryContext['__siteKey']) {
        const site = contentLib.getSite({
            key: queryContext['__siteKey']
        });
        if (!site) {
            throw new Error('Site not found.');
        }
        return site;
    }
};
