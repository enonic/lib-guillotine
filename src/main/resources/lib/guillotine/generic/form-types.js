const graphQlLib = require('/lib/guillotine/graphql');

function generateTypes(context) {
    context.types.formItemTypeType = context.schemaGenerator.createEnumType({
        name: context.uniqueName('FormItemType'),
        description: 'Form item type',
        values: {
            'ItemSet': 'ItemSet',
            'Layout': 'Layout',
            'Input': 'Input',
            'OptionSet': 'OptionSet'
        }
    });

    context.types.formItemType = graphQlLib.createInterfaceType(context, {
        name: context.uniqueName('FormItem'),
        typeResolver: function (contentType) {
            switch (contentType.formItemType) {
            case 'ItemSet':
                return context.types.formItemSetType;
            case 'Layout':
                return context.types.formLayoutType;
            case 'Input':
                return context.types.formInputType;
            case 'OptionSet':
                return context.types.formOptionSetType;
            }
        },
        description: 'Form item.',
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.occurrencesType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('Occurrences'),
        description: 'Occurrences.',
        fields: {
            maximum: {
                type: graphQlLib.GraphQLInt
            },
            minimum: {
                type: graphQlLib.GraphQLInt
            }
        }
    });

    context.types.defaultValueType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('DefaultValue'),
        description: 'Default value.',
        fields: {
            value: {
                type: graphQlLib.GraphQLString,
                resolve: function (env) {
                    return JSON.stringify(env.source.value);
                }
            },
            type: {
                type: graphQlLib.GraphQLString
            }
        }
    });

    context.types.formItemSetType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FormItemSet'),
        description: 'Form item set.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            customText: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });
    context.addDictionaryType(context.types.formItemSetType);

    context.types.formLayoutType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FormLayout'),
        description: 'Form layout.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });
    context.addDictionaryType(context.types.formLayoutType);

    context.types.formOptionSetOptionType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FormOptionSetOption'),
        description: 'Form option set option.',
        fields: {
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            default: {
                type: graphQlLib.GraphQLBoolean
            },
            items: {
                type: graphQlLib.list(context.types.formItemType)
            }
        }
    });

    context.types.formOptionSetType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FormOptionSet'),
        description: 'Form option set.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            expanded: {
                type: graphQlLib.GraphQLBoolean
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            selection: {
                type: context.types.occurrencesType
            },
            options: {
                type: graphQlLib.list(context.types.formOptionSetOptionType)
            }
        }
    });
    context.addDictionaryType(context.types.formOptionSetType);

    context.types.formInputType = graphQlLib.createObjectType(context, {
        name: context.uniqueName('FormInput'),
        description: 'Form input.',
        interfaces: [context.types.formItemType],
        fields: {
            formItemType: {
                type: context.types.formItemTypeType
            },
            name: {
                type: graphQlLib.GraphQLString
            },
            label: {
                type: graphQlLib.GraphQLString
            },
            customText: {
                type: graphQlLib.GraphQLString
            },
            helpText: {
                type: graphQlLib.GraphQLString
            },
            validationRegexp: {
                type: graphQlLib.GraphQLString
            },
            maximize: {
                type: graphQlLib.GraphQLBoolean
            },
            inputType: {
                type: graphQlLib.GraphQLString
            },
            occurrences: {
                type: context.types.occurrencesType
            },
            defaultValue: {
                type: context.types.defaultValueType
            },
            configAsJson: {
                type: graphQlLib.Json,
                resolve: function (env) {
                    return env.source.config;
                }
            }
        }
    });
    context.addDictionaryType(context.types.formInputType);
};

exports.generateTypes = generateTypes;
