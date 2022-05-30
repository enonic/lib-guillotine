const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');
const graphQlConnectionLib = require('/lib/graphql-connection');

const graphQlLib = require('/lib/guillotine/graphql');
const contentTypesLib = require('/lib/guillotine/dynamic/content-types');
const securityLib = require('/lib/guillotine/util/security');
const validationLib = require('/lib/guillotine/util/validation');
const wildcardLib = require('/lib/guillotine/util/wildcard');
const factoryUtil = require('/lib/guillotine/util/factory');

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
                    let node = getContent(env, context);
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
                    let parent = getContent(env, context);
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
                    let parent = getContent(env, context);
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
                    let content = getContent(env, context);
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

function getContent(env, context) {
    if (env.args.key) {
        const key = context.isGlobalMode() ? env.args.key : wildcardLib.replaceSitePath(env.args.key, portalLib.getSite()._path);
        const content = contentLib.get({
            key: key
        });
        return content && securityLib.filterForbiddenContent(content, context);
    } else {
        return portalLib.getContent();
    }
}

function transformNodeIfExistsAttachments(node) {
    if (node && node.hasOwnProperty('attachments') && Object.keys(node.attachments).length > 0) {
        if (node.data) {
            node.data['__nodeId'] = node._id;
            addRecursiveNodeId(node.data, node._id);
        }
    }
}

function addRecursiveNodeId(holder, nodeId) {
    Object.keys(holder).forEach(prop => {
        let holderElement = holder[prop];

        if (typeof holderElement === 'object' && !Array.isArray(holderElement)) {
            holderElement['__nodeId'] = nodeId;
            addRecursiveNodeId(holderElement, nodeId);
        }
    });
}

exports.createContentApiType = createContentApiType;
