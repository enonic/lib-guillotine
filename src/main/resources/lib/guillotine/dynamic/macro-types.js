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

function getGenericMacroFields() {
    return {
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
}

function createMacroDataConfigType(context) {
    context.types.macroType = context.schemaGenerator.createInterfaceType({
        name: context.uniqueName('Macro'),
        typeResolver: function (macro) {
            return context.macroTypeMap[macro.macroName] || context.types.untypedMacroType;
        },
        description: 'Macro type.',
        fields: getGenericMacroFields()
    });

    context.types.untypedMacroType = libs.graphQL.createObjectType(context, {
        name: context.uniqueName('UntypedMacro'),
        description: 'Untyped macro.',
        interfaces: [context.types.macroType],
        fields: getGenericMacroFields()
    });

    let macroDescriptors = getMacroDescriptors(context.options.applications);

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
            name: macroDataConfigTypeName,
            description: `Macro descriptor data config for application ['${descriptor.applicationKey}'] and descriptor ['${descriptor.name}']`,
            fields: macroDataConfigFields
        });

        let macroTypeFields = getGenericMacroFields();
        macroTypeFields.config = {
            type: macroDataConfigType,
            resolve: function (env) {
                return env.source.config
            }
        };

        let macroType = libs.graphQL.createObjectType(context, {
            name: macroTypeName,
            description: `${macroTypeName} type.`,
            interfaces: [context.types.macroType],
            fields: macroTypeFields
        });

        context.putMacroType(descriptor.name, macroType);
        context.addDictionaryType(macroType);
    });
}

exports.createMacroDataConfigType = createMacroDataConfigType;
