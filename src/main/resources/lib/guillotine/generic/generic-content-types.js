const graphQlLib = require('/lib/guillotine/graphql');

function generateTypes(context) {
    context.types.geoPointType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('GeoPoint'),
        description: 'GeoPoint.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source;
                }
            },
            latitude: {
                type: graphQlLib.GraphQLFloat,
                resolve: function (env) {
                    return env.source.split(',', 2)[0];
                }
            },
            longitude: {
                type: graphQlLib.GraphQLFloat,
                resolve: function (env) {
                    return env.source.split(',', 2)[1];
                }
            }
        }
    });

    context.types.mediaFocalPointType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('MediaFocalPoint'),
        description: 'Media focal point.',
        fields: {
            x: {
                type: graphQlLib.GraphQLFloat
            },
            y: {
                type: graphQlLib.GraphQLFloat
            }
        }
    });

    context.types.mediaUploaderType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('MediaUploader'),
        description: 'Media uploader.',
        fields: {
            attachment: {
                type: graphQlLib.GraphQLString
            },
            focalPoint: {
                type: context.types.mediaFocalPointType
            }
        }
    });

    context.types.siteConfiguratorType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('SiteConfigurator'),
        description: 'Site configurator.',
        fields: {
            applicationKey: {
                type: graphQlLib.GraphQLString
            },
            configAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.config;
                }
            }
        }
    });
}

exports.generateTypes = generateTypes;
