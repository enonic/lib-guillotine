const authLib = require('/lib/xp/auth');
const portalLib = require('/lib/xp/portal');

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
    if (!content) {
        return null;
    }
    if (context.isGlobalMode()) {
        return content;
    }
    for (let allowedContentPath of getAllowedContentPaths(context)) {
        if (content._path === allowedContentPath || content._path.indexOf(allowedContentPath + '/') === 0) {
            return content;
        }
    }
    return null;
}

function adaptQuery(query, context) {
    if (context.isGlobalMode()) {
        return query;
    }
    const allowedNodePaths = getAllowedNodePaths(context);
    const queryPrefix = allowedNodePaths.map(nodePath => '_path = "' + nodePath + '" OR _path LIKE "' + nodePath + '/*"').join(" OR ");

    return '(' + queryPrefix + ')' + (query ? ' AND (' + query + ')' : '');
}

function adaptDslQuery(dslQuery, context) {
    if (context.isGlobalMode()) {
        return dslQuery;
    }
    const allowedNodePaths = getAllowedNodePaths(context);
    const dslExpressions = [];
    allowedNodePaths.forEach(nodePath => {
        dslExpressions.push({
            term: {
                field: '_path',
                value: nodePath,
            }
        });
        dslExpressions.push({
            like: {
                field: '_path',
                value: `${nodePath}/*`,
            }
        });
    });
    return dslQuery != null
           ?
        {
            boolean: {
                must: [
                    dslQuery,
                    {
                        boolean: {
                            should: dslExpressions,
                        }
                    }
                ]
            }
        }
           :
        {
            boolean: {
                should: dslExpressions,
            }
        };
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
exports.adaptDslQuery = adaptDslQuery;
