const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');
const graphQlConnectionLib = require('/lib/graphql-connection');

const graphQlLib = require('/lib/guillotine/graphql');
const contentTypesLib = require('/lib/guillotine/dynamic/content-types');
const securityLib = require('/lib/guillotine/util/security');
const validationLib = require('/lib/guillotine/util/validation');
const wildcardLib = require('/lib/guillotine/util/wildcard');

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

                resolve: (env) => getContent(env, context)
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
                    var parent = getContent(env, context);
                    if (parent) {
                        return contentLib.getChildren({
                            key: parent._id,
                            start: env.args.offset,
                            count: env.args.first,
                            sort: env.args.sort
                        }).hits;
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
                    var parent = getContent(env, context);
                    if (parent) {
                        var start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                        var getChildrenResult = contentLib.getChildren({
                            key: parent._id,
                            start: start,
                            count: env.args.first,
                            sort: env.args.sort
                        });
                        return {
                            total: getChildrenResult.total,
                            start: start,
                            hits: getChildrenResult.hits
                        };
                    } else {
                        var start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
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
                    var content = getContent(env, context);
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
                    contentTypes: graphQlLib.list(graphQlLib.GraphQLString)
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    const query = wildcardLib.replaceSitePath(env.args.query, '/content' + portalLib.getSite()._path)
                    return contentLib.query({
                        query: securityLib.adaptQuery(query, context),
                        start: env.args.offset,
                        count: env.args.first,
                        sort: env.args.sort,
                        contentTypes: env.args.contentTypes
                    }).hits;
                }
            },
            queryConnection: {
                type: context.types.contentConnectionType,
                args: {
                    query: graphQlLib.nonNull(graphQlLib.GraphQLString),
                    after: graphQlLib.GraphQLString,
                    first: graphQlLib.GraphQLInt,
                    sort: graphQlLib.GraphQLString,
                    contentTypes: graphQlLib.list(graphQlLib.GraphQLString)
                },
                resolve: function (env) {
                    validationLib.validateArguments(env.args);
                    var start = env.args.after ? parseInt(graphQlConnectionLib.decodeCursor(env.args.after)) + 1 : 0;
                    var queryResult = contentLib.query({
                        query: securityLib.adaptQuery(env.args.query, context),
                        start: start,
                        count: env.args.first,
                        sort: env.args.sort,
                        contentTypes: env.args.contentTypes
                    });
                    return {
                        total: queryResult.total,
                        start: start,
                        hits: queryResult.hits
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
};

function getContent(env, context) {
    if (env.args.key) {
        const key = wildcardLib.replaceSitePath(env.args.key, portalLib.getSite()._path);
        var content = contentLib.get({
            key: key
        });
        return content && securityLib.filterForbiddenContent(content, context);
    } else {
        return portalLib.getContent();
    }
}

exports.createContentApiType = createContentApiType;
