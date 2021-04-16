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

    let macroDataConfigFields = {
        macroRef: {
            type: libs.graphQL.GraphQLString,
            resolve: function (env) {
                return env.source.macroRef;
            }
        },
        macroName: {
            type: libs.graphQL.GraphQLString,
            resolve: function (env) {
                return env.source.macroName;
            }
        }
    };

    macroDescriptors.forEach(descriptor => {
        let sanitizeDescriptorName = libs.naming.sanitizeText(descriptor.name);

        let macroTypeName = `Macro_${libs.naming.sanitizeText(descriptor.applicationKey)}_${sanitizeDescriptorName}`;

        let typeFields = {
            body: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.body;
                }
            }
        };

        libs.form.getFormItems(descriptor.form).forEach(function (formItem) {
            typeFields[libs.naming.sanitizeText(formItem.name)] = {
                type: libs.form.generateFormItemObjectType(context, macroTypeName, formItem),
                args: libs.form.generateFormItemArguments(context, formItem),
                resolve: libs.form.generateFormItemResolveFunction(formItem)
            }
        });

        context.types.macroType = libs.graphQL.createObjectType(context, {
            name: macroTypeName,
            description: `Macro descriptor config for application ['${descriptor.applicationKey}'] and descriptor ['${descriptor.name}']`,
            fields: typeFields
        });

        macroDataConfigFields[sanitizeDescriptorName] = {
            type: context.types.macroType
        }
    });

    context.types.macroDataConfigType = libs.graphQL.createObjectType(context, {
        name: 'MacroDataConfig',
        description: 'Macro data config type',
        fields: macroDataConfigFields
    });
}


exports.createMacroDataConfigType = createMacroDataConfigType;
