var graphQlLib = require('../graphql');

exports.generateTypes = function (context) {

    context.types.componentType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Component'),
        description: 'Component.',
        fields: {
            path: {
                type: graphQlLib.GraphQLString
            },
            type: {
                type: graphQlLib.GraphQLString
            },
            descriptor: {
                type: graphQlLib.GraphQLString
            },
            text: {
                type: graphQlLib.GraphQLString
            },
            fragment: {
                type: graphQlLib.GraphQLString
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            },
            regions: {
                type: graphQlLib.list(graphQlLib.reference('Region')),
                resolve: function (env) {
                    return env.source.regions && Object.keys(env.source.regions).map(function (key) {
                        return env.source.regions[key];
                    });
                }
            }
        }
    });

    context.types.pageRegionType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Region'),
        description: 'Page region.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            components: {
                type: graphQlLib.list(context.types.componentType)
            }
        }
    });

    context.types.pageType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Page'),
        description: 'Page.',
        fields: {
            template: {
                type: graphQlLib.GraphQLString
            },
            descriptor: {
                type: graphQlLib.GraphQLString
            },
            config: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.config);
                }
            },
            regions: {
                type: graphQlLib.list(context.types.pageRegionType),
                resolve: function (env) {
                    return env.source.regions && Object.keys(env.source.regions).map(function (key) {
                        return env.source.regions[key];
                    });
                }
            },
            fragment: {
                type: context.types.componentType
            }
        }
    });

};