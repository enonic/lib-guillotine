const contentLib = require('/lib/xp/content');
const contextLib = require('/lib/xp/context');
const portalLib = require('/lib/xp/portal');
const graphQlConnectionLib = require('/lib/graphql-connection');

const graphQlLib = require('/lib/guillotine/graphql');
const contentTypesLib = require('/lib/guillotine/dynamic/content-types');
const securityLib = require('/lib/guillotine/util/security');
const validationLib = require('/lib/guillotine/util/validation');
const wildcardLib = require('/lib/guillotine/util/wildcard');
const factoryUtil = require('/lib/guillotine/util/factory');
const getSiteLib = require('/lib/guillotine/util/site-helper');
const nodeTransformer = require('/lib/guillotine/util/node-transformer');

function createContentApiType(context) {
    return graphQlLib.createObjectType(context, {
        name: context.uniqueName('HeadlessCms'),
        description: 'Headless CMS',
        fields: {
            get: {
                type: context.types.contentType,
                args: {
                    key: graphQlLib.GraphQLID
                },
                resolve: (env) => {
                    const node = getContent(env, context, false);
                    transformNodeIfExistsAttachments(node);
                    return node;
                }
            },
            getChildren: {
                type: graphQlLib.list(context.types.contentType),
                args: {
                    key: graphQlLib.GraphQLID,
                    offset: graphQlLib.GraphQLInt,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.GraphQLString
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    const parent = getContent(env, context, true);
                    if (parent) {
                        let hits = contentLib.getChildren({
                            key: parent._id,
                            start: env.args.offset,
                            count: env.args.first,
                            sort: env.args.sort
                        }).hits;

                        hits.forEach(node => transformNodeIfExistsAttachments(node));

                        return hits;
                    } else {
                        return [];
                    }
                }
            },
            getChildrenConnection: {
                type: context.types.contentConnectionType,
                args: {
                    key: graphQlLib.GraphQLID,
                    after: graphQlLib.GraphQLString,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.GraphQLString
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    const parent = getContent(env, context, true);
                    if (parent) {
                        let start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                        let getChildrenResult = contentLib.getChildren({
                            key: parent._id,
                            start: start,
                            count: env.args.first,
                            sort: env.args.sort
                        });

                        let hits = getChildrenResult.hits;
                        hits.forEach(node => transformNodeIfExistsAttachments(node));

                        return {
                            total: getChildrenResult.total,
                            start: start,
                            hits: hits
                        };
                    } else {
                        let start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                        return {
                            total: 0,
                            start: start,
                            hits: 0
                        };
                    }

                }
            },
            getPermissions: {
                type: context.types.permissionsType,
                args: {
                    key: graphQlLib.GraphQLID
                },
                resolve: function (env) {
                    const content = getContent(env, context, false);
                    if (content) {
                        return contentLib.getPermissions({
                            key: content._id
                        });
                    } else {
                        return null;
                    }
                }
            },
            getSite: {
                type: graphQlLib.reference('portal_Site'),
                resolve: function (env) {
                    if (context.isGlobalMode()) {
                        if (env.context && env.context['__siteKey']) {
                            return contentLib.getSite({
                                key: env.context['__siteKey']
                            });
                        }
                        return null;
                    }
                    return portalLib.getSite();
                }
            },
            query: {
                type: graphQlLib.list(context.types.contentType),
                args: {
                    query: graphQlLib.GraphQLString,
                    offset: graphQlLib.GraphQLInt,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.GraphQLString,
                    contentTypes: graphQlLib.list(graphQlLib.GraphQLString),
                    filters: graphQlLib.list(context.types.filterInputType)
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    let queryParams = {
                        query: securityLib.adaptQuery(env.args.query, context),
                        start: env.args.offset,
                        count: env.args.first,
                        sort: env.args.sort,
                        contentTypes: env.args.contentTypes
                    };

                    if (env.args.filters) {
                        queryParams.filters = factoryUtil.createFilters(env.args.filters);
                    }

                    let result = contentLib.query(queryParams);

                    let hits = result.hits;
                    hits.forEach(node => transformNodeIfExistsAttachments(node));

                    return hits;
                }
            },
            queryConnection: {
                type: context.types.queryContentConnectionType,
                args: {
                    query: graphQlLib.nonNull(graphQlLib.GraphQLString),
                    after: graphQlLib.GraphQLString,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.GraphQLString,
                    contentTypes: graphQlLib.list(graphQlLib.GraphQLString),
                    aggregations: graphQlLib.list(context.types.aggregationInputType),
                    filters: graphQlLib.list(context.types.filterInputType)
                },
                resolve: function (env) {
                    validationLib.validateArgumentsForQueryField(env);

                    let start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;

                    let queryParams = {
                        query: securityLib.adaptQuery(env.args.query, context),
                        start: start,
                        count: env.args.first,
                        sort: env.args.sort,
                        contentTypes: env.args.contentTypes
                    };

                    if (env.args.aggregations) {
                        let aggregations = {};
                        env.args.aggregations.forEach(aggregation => {
                            factoryUtil.createAggregation(aggregations, aggregation);
                        });
                        queryParams.aggregations = aggregations;
                    }
                    if (env.args.filters) {
                        queryParams.filters = factoryUtil.createFilters(env.args.filters);
                    }

                    let queryResult = contentLib.query(queryParams);

                    let hits = queryResult.hits;
                    hits.forEach(node => transformNodeIfExistsAttachments(node));

                    return {
                        total: queryResult.total,
                        start: start,
                        hits: hits,
                        aggregationsAsJson: queryResult.aggregations
                    };
                }
            },
            queryDsl: {
                type: graphQlLib.list(context.types.contentType),
                args: {
                    query: context.types.queryDslInputType,
                    offset: graphQlLib.GraphQLInt,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.list(context.types.sortDslInputType),
                },
                resolve: function (env) {
                    validationLib.validateDslQuery(env);
                    const result = contentLib.query(createQueryDslParams(env, env.args.offset, context));
                    const hits = result.hits;
                    hits.forEach(node => transformNodeIfExistsAttachments(node));
                    return hits;
                }
            },
            queryDslConnection: {
                type: context.types.queryDslContentConnectionType,
                args: {
                    query: graphQlLib.nonNull(context.types.queryDslInputType),
                    after: graphQlLib.GraphQLString,
                    first: graphQlLib.GraphQLInt,
                    aggregations: graphQlLib.list(context.types.aggregationInputType),
                    highlight: context.types.highlightInputType,
                    sort: graphQlLib.list(context.types.sortDslInputType),
                },
                resolve: function (env) {
                    validationLib.validateDslQuery(env);

                    const start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;

                    const queryResult = contentLib.query(createQueryDslParams(env, start, context));

                    const hits = queryResult.hits;
                    hits.forEach(node => transformNodeIfExistsAttachments(node));
                    return {
                        total: queryResult.total,
                        start: start,
                        hits: hits,
                        aggregationsAsJson: queryResult.aggregations,
                        highlightAsJson: queryResult.highlight,
                    };
                }
            },
            getType: {
                type: context.types.contentTypeType,
                args: {
                    name: graphQlLib.nonNull(graphQlLib.GraphQLString)
                },
                resolve: function (env) {
                    return contentTypesLib.getAllowedContentType(context, env.args.name);
                }
            },
            getTypes: {
                type: graphQlLib.list(context.types.contentTypeType),
                resolve: function () {
                    return contentTypesLib.getAllowedContentTypes(context);
                }
            }
        }
    });
}

function getContentByKey(key, context, returnRootContent) {
    const content = contentLib.get({
        key: key
    });
    if (content && content._path === '/' && returnRootContent === false) {
        return null;
    }
    return securityLib.filterForbiddenContent(content, context);
}

function getContent(env, context, returnRootContent) {
    if (env.args.key) {
        const site = context.isGlobalMode() && env.context && env.context['__siteKey']
                     ? getSiteLib.getSiteFromQueryContext(env.context)
                     : portalLib.getSite();

        const key = site ? wildcardLib.replaceSitePath(env.args.key, site._path) : env.args.key;

        return getContentByKey(key, context, returnRootContent);
    } else {
        if (context.isGlobalMode()) {
            if (env.context && env.context['__siteKey']) {
                return getContentByKey(env.context['__siteKey'], context, returnRootContent);
            } else if (returnRootContent === true) {
                return contextLib.run({}, () => contentLib.get({key: '/'}));
            }
        }
        return portalLib.getContent();
    }
}

function transformNodeIfExistsAttachments(node) {
    if (node && node.hasOwnProperty('attachments') && Object.keys(node.attachments).length > 0) {
        if (node.data) {
            node.data['__nodeId'] = node._id;
            nodeTransformer.addRecursiveNodeId(node.data, node._id);
        }
    }
}

function createQueryDslParams(env, start, context) {
    const queryParams = {
        start: start,
        count: env.args.first,
    };
    if (env.args.query) {
        queryParams.query = securityLib.adaptDslQuery(factoryUtil.createDslQuery(env.args.query), context);
    }
    if (env.args.sort) {
        queryParams.sort = factoryUtil.createDslSort(env.args.sort);
    }
    if (env.args.aggregations) {
        const aggregations = {};
        env.args.aggregations.forEach(aggregation => {
            factoryUtil.createAggregation(aggregations, aggregation);
        });
        queryParams.aggregations = aggregations;
    }
    if (env.args.highlight) {
        queryParams.highlight = factoryUtil.createHighlight(env.args.highlight);
    }
    return queryParams;
}

exports.createContentApiType = createContentApiType;
