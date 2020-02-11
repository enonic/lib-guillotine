var authLib = require('/lib/xp/auth');
var portalLib = require('/lib/xp/portal');

function isSiteContext() {
    return !!portalLib.getSite();
}

function isAllowedSiteContext() {
    return !!portalLib.getSiteConfig();
}

function isAdmin() {
    return authLib.hasRole('system.admin');
}

function isCmsAdmin() {
    return authLib.hasRole('cms.admin');
}

function isCmsUser() {
    return authLib.hasRole('cms.cm.app');
}

function canAccessCmsData() {
    return isAdmin() || isCmsAdmin() || isCmsUser();
}

function filterForbiddenContent(content, context) {
    for (let allowedContentPath of getAllowedContentPaths(context)) {
        if (content._path === allowedContentPath || content._path.indexOf(allowedContentPath + '/') === 0) {
            return content;
        }
    }
    return null;
}

function adaptQuery(query, context) {
    const allowedNodePaths = getAllowedNodePaths(context);
    const queryPrefix = allowedNodePaths.map(nodePath => '_path = "' + nodePath + '" OR _path LIKE "' + nodePath + '/*"').join(" OR ");
    const adaptedQuery = '(' + queryPrefix + ')' + (query ? ' AND (' + query + ')' : '');
    return adaptedQuery;
}

function getAllowedNodePaths(context) {
    return getAllowedContentPaths(context).map(contentPath => '/content' + contentPath);
}

function getAllowedContentPaths(context) {
    return context.options.allowPaths.concat(portalLib.getSite()._path);
}


exports.isSiteContext = isSiteContext;
exports.isAllowedSiteContext = isAllowedSiteContext;
exports.isAdmin = isAdmin;
exports.isCmsAdmin = isCmsAdmin;
exports.canAccessCmsData = canAccessCmsData;
exports.filterForbiddenContent = filterForbiddenContent;
exports.adaptQuery = adaptQuery;