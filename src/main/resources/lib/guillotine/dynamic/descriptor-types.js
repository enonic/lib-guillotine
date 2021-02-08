const graphQlLib = require('/lib/guillotine/graphql');
const namingLib = require('/lib/guillotine/util/naming');
const formLib = require('/lib/guillotine/dynamic/form');

function createDynamicDataConfigType(context) {
    createDataConfigType(context, 'Page');
    createDataConfigType(context, 'Part');
    createDataConfigType(context, 'Layout');
    createDataConfigType(context, 'Macro');
}

function getDescriptors(componentType, applicationKey) {
    const newBean = __.newBean('com.enonic.lib.guillotine.handler.ComponentDescriptorHandler');
    return __.toNativeObject(newBean.getByApplication(componentType, applicationKey));
}

function createDataConfigType(context, componentType) {
    const isMacro = componentType === 'Macro';

    const componentConfigTypeFields = {};

    //For each application
    context.options.applications.forEach(applicationKey => {
        const descriptors = getDescriptors(componentType, applicationKey);

        //For each descriptor
        const applicationConfigTypeFields = {};
        descriptors.forEach(descriptor => {
            let name = `${componentType}_${namingLib.sanitizeText(applicationKey)}_${namingLib.sanitizeText(descriptor.name)}`;

            const descriptorConfigTypeName = context.uniqueName(name);
            const descriptorConfigTypeFields = {};

            //For each form item
            formLib.getFormItems(descriptor.form).forEach(function (formItem) {
                //Creates a data field corresponding to this form item
                descriptorConfigTypeFields[namingLib.sanitizeText(formItem.name)] = {
                    type: formLib.generateFormItemObjectType(context, descriptorConfigTypeName, formItem),
                    args: formLib.generateFormItemArguments(context, formItem),
                    resolve: formLib.generateFormItemResolveFunction(formItem)
                }
            });

            //If there were form items (A type cannot have 0 fields)
            if (Object.keys(descriptorConfigTypeFields).length > 0) {
                if (isMacro === true) {
                    descriptorConfigTypeFields['macroRef'] = {
                        type: graphQlLib.GraphQLString,
                        resolve: function (env) {
                            return env.source.macroRef;
                        }
                    };
                }

                //Creates the type for this descriptor
                const descriptorConfigType = graphQlLib.createObjectType(context, {
                    name: descriptorConfigTypeName,
                    description: `${componentType} ${isMacro !== true ? 'component ' : ''}application config for application ['${applicationKey}'] and descriptor ['${descriptor.name}']`,
                    fields: descriptorConfigTypeFields
                });
                applicationConfigTypeFields[namingLib.sanitizeText(descriptor.name)] = {
                    type: isMacro === true ? graphQlLib.list(descriptorConfigType) : descriptorConfigType,
                    resolve: (env) => env.source[descriptor.name]
                }
            }
        });

        //If there were descriptors with form items (A type cannot have 0 fields)
        if (Object.keys(applicationConfigTypeFields).length > 0) {
            let name = `${componentType}_${namingLib.sanitizeText(applicationKey)}_${isMacro !== true ? 'Component' : ''}DataApplicationConfig`;

            //Creates the type for these descriptors
            const applicationConfigType = graphQlLib.createObjectType(context, {
                name: context.uniqueName(name),
                description: `${isMacro === true ? 'Macro' : componentType + ' component'} application config for application ['${applicationKey}']`,
                fields: applicationConfigTypeFields
            });
            componentConfigTypeFields[namingLib.sanitizeText(applicationKey)] = {
                type: applicationConfigType,
                resolve: (env) => env.source[isMacro === true ? applicationKey : namingLib.applicationConfigKey(applicationKey)]
            }
        }
    });

    //If there were descriptors with form items (A type cannot have 0 fields)
    if (Object.keys(componentConfigTypeFields).length > 0) {
        let typeName = `${componentType}${isMacro !== true ? 'Component' : ''}DataConfig`;
        //Creates the type for all the descriptors
        context.types[`${typeName}Type`] = graphQlLib.createObjectType(context, {
            name: context.uniqueName(typeName),
            description: `${componentType} component config.`,
            fields: componentConfigTypeFields
        });
    }
}

exports.createDynamicDataConfigType = createDynamicDataConfigType;
