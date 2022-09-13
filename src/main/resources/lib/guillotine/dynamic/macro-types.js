/** global __ */

const libs = {
    graphQL: require('/lib/guillotine/graphql'),
    naming: require('/lib/guillotine/util/naming'),
    form: require('/lib/guillotine/dynamic/form')
};

function getMacroDescriptors(applicationsKeys) {
    const descriptorBean = __.newBean('com.enonic.lib.guillotine.handler.ComponentDescriptorHandler');
    return __.toNativeObject(descriptorBean.getMacroDescriptors(applicationsKeys));
}

function createMacroDataConfigType(context) {
    let macroDescriptors = getMacroDescriptors(context.options.applications);

    let macroConfigTypeFields = {};

    macroDescriptors.forEach(descriptor => {
        let sanitizeDescriptorName = libs.naming.sanitizeText(descriptor.name);

        let macroTypeName = `Macro_${libs.naming.sanitizeText(descriptor.applicationKey)}_${sanitizeDescriptorName}`;

        let macroDataConfigTypeName = `${macroTypeName}_DataConfig`;

        let macroDataConfigFields = {
            body: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.body;
                }
            }
        };

        libs.form.getFormItems(descriptor.form).forEach(function (formItem) {
            macroDataConfigFields[libs.naming.sanitizeText(formItem.name)] = {
                type: libs.form.generateFormItemObjectType(context, macroDataConfigTypeName, formItem),
                args: libs.form.generateFormItemArguments(context, formItem),
                resolve: libs.form.generateFormItemResolveFunction(formItem)
            }
        });

        let macroDataConfigType = libs.graphQL.createObjectType(context, {
            name: context.uniqueName(macroDataConfigTypeName),
            description: `Macro descriptor data config for application ['${descriptor.applicationKey}'] and descriptor ['${descriptor.name}']`,
            fields: macroDataConfigFields
        });

        macroConfigTypeFields[sanitizeDescriptorName] = {
            type: macroDataConfigType,
            resolve: function (env) {
                return env.source[descriptor.name];
            }
        }
    });

    context.types.macroConfigType = libs.graphQL.createObjectType(context, {
        name: context.uniqueName('MacroConfig'),
        description: `Macro config type.`,
        interfaces: [context.types.macroType],
        fields: macroConfigTypeFields
    });

    context.types.macroType = libs.graphQL.createObjectType(context, {
        name: context.uniqueName('Macro'),
        description: `Macro type.`,
        interfaces: [context.types.macroType],
        fields: {
            ref: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.ref;
                }
            },
            name: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.name;
                }
            },
            descriptor: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.descriptor;
                }
            },
            config: {
                type: context.types.macroConfigType,
                resolve: function (env) {
                    return env.source.config
                }
            }
        }
    });
}

exports.createMacroDataConfigType = createMacroDataConfigType;
