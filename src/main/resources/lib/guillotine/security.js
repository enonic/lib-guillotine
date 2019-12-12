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

function filterForbiddenContent(content) {
    var sitePath = portalLib.getSite()._path;
    return content._path === sitePath || content._path.indexOf(sitePath + '/') === 0 ? content : null;
}

function adaptQuery(query) {
    var sitePath = portalLib.getSite()._path;
    return '(_path = "/content' + sitePath + '" OR _path LIKE "/content' + sitePath + '/*")' + (query ? ' AND (' + query + ')' : '');
}


exports.isSiteContext = isSiteContext;
exports.isAllowedSiteContext = isAllowedSiteContext;
exports.isAdmin = isAdmin;
exports.isCmsAdmin = isCmsAdmin;
exports.canAccessCmsData = canAccessCmsData;
exports.filterForbiddenContent = filterForbiddenContent;
exports.adaptQuery = adaptQuery;