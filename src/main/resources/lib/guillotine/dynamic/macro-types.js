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
        let sanitizeMacroName = libs.naming.sanitizeText(descriptor.name);

        let macroTypeName = `Macro_${libs.naming.sanitizeText(descriptor.applicationKey)}_${sanitizeMacroName}`;

        let macroDescriptorTypeName = `${macroTypeName}_Descriptor`;

        let macroTypeDescriptorFields = {
            body: {
                type: libs.graphQL.GraphQLString,
                resolve: function (env) {
                    return env.source.body;
                }
            }
        };

        libs.form.getFormItems(descriptor.form).forEach(function (formItem) {
            macroTypeDescriptorFields[libs.naming.sanitizeText(formItem.name)] = {
                type: libs.form.generateFormItemObjectType(context, macroDescriptorTypeName, formItem),
                args: libs.form.generateFormItemArguments(context, formItem),
                resolve: libs.form.generateFormItemResolveFunction(formItem)
            }
        });

        context.types[macroDescriptorTypeName] = libs.graphQL.createObjectType(context, {
            name: context.uniqueName(macroDescriptorTypeName),
            description: 'Macro Descriptor component config.',
            fields: macroTypeDescriptorFields
        });

        let macroTypeFields = {
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
            },
            config: {
                type: context.types[macroDescriptorTypeName],
                resolve: function (env) {
                    return env.source.config;
                }
            }
        };

        const descriptorConfigType = libs.graphQL.createObjectType(context, {
            name: macroTypeName,
            description: `Macro descriptor config for application ['${descriptor.applicationKey}'] and descriptor ['${descriptor.name}']`,
            fields: macroTypeFields
        });

        // assumption that macro descriptors have the same order if them was given from site configs
        // It means that first macro descriptor which was matched will be used to process it
        if (!macroConfigTypeFields.hasOwnProperty(sanitizeMacroName)) {
            macroConfigTypeFields[sanitizeMacroName] = {
                type: libs.graphQL.list(descriptorConfigType),
                resolve: (env) => env.source[descriptor.name]
            }
        }
    });

    if (Object.keys(macroConfigTypeFields).length > 0) {
        context.types['MacroDataConfigType'] = libs.graphQL.createObjectType(context, {
            name: context.uniqueName('MacroDataConfig'),
            description: 'Macro component config.',
            fields: macroConfigTypeFields
        });
    }
}


exports.createMacroDataConfigType = createMacroDataConfigType;
