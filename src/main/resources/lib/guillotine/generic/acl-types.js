const graphQlLib = require('/lib/guillotine/graphql');

const principalKeyRegexp = /^(?:role:([^:]+)|(?:(?:user|group):([^:]+):([^:]+)))$/;

function generateTypes(context) {
    context.types.principalKeyType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('PrincipalKey'),
        description: 'Principal key.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return env.source;
                }
            },
            type: {
                type: context.schemaGenerator.createEnumType({
                    name: context.uniqueName('PrincipalType'),
                    description: 'Principal type.',
                    values: {
                        'user': 'user',
                        'group': 'group',
                        'role': 'role'
                    }
                }),
                resolve: function (env) {
                    return env.source.split(':', 2)[0];
                }
            },
            idProvider: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return getIdProviderName(env.source);
                }
            },
            principalId: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return getPrincipalId(env.source);
                }
            }
        }
    });

    context.types.permissionType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('Permission'),
        description: 'Permission.',
        values: {
            'READ': 'READ',
            'CREATE': 'CREATE',
            'MODIFY': 'MODIFY',
            'DELETE': 'DELETE',
            'PUBLISH': 'PUBLISH',
            'READ_PERMISSIONS': 'READ_PERMISSIONS',
            'WRITE_PERMISSIONS': 'WRITE_PERMISSIONS'
        }
    });

    context.types.accessControlEntryType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('AccessControlEntry'),
        description: 'Access control entry.',
        fields: {
            principal: {
                type: context.types.principalKeyType
            },
            allow: {
                type: graphQlLib.list(context.types.permissionType)
            },
            deny: {
                type: graphQlLib.list(context.types.permissionType)
            }
        }
    });

    context.types.permissionsType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Permissions'),
        description: 'Permissions.',
        fields: {
            inheritsPermissions: {
                type: graphQlLib.GraphQLBoolean
            },
            permissions: {
                type: graphQlLib.list(context.types.accessControlEntryType)
            }
        }
    });
};

function getIdProviderName(principalKey) {
    var groups = principalKeyRegexp.exec(principalKey);
    return groups[2] || null;
}

function getPrincipalId(principalKey) {
    var groups = principalKeyRegexp.exec(principalKey);
    return groups[1] || groups[3];
}

exports.generateTypes = generateTypes;
