const graphQlLib = require('/lib/guillotine/graphql');
const namingLib = require('/lib/guillotine/util/naming');
const formLib = require('/lib/guillotine/dynamic/form');

const descriptorBean = __.newBean('com.enonic.lib.guillotine.handler.ComponentDescriptorHandler');

function createComponentDataConfigType(schemaGenerator, context) {
    createDataConfigType(schemaGenerator, context, 'Page');
    createDataConfigType(schemaGenerator, context, 'Part');
    createDataConfigType(schemaGenerator, context, 'Layout');
}

function getDescriptors(componentType, applicationKey) {
    return __.toNativeObject(descriptorBean.getComponentDescriptors(componentType, applicationKey));
}

function createDataConfigType(schemaGenerator, context, componentType) {
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
                    type: formLib.generateFormItemObjectType(schemaGenerator, context, descriptorConfigTypeName, formItem),
                    args: formLib.generateFormItemArguments(context, formItem),
                    resolve: formLib.generateFormItemResolveFunction(formItem)
                }
            });

            //If there were form items (A type cannot have 0 fields)
            if (Object.keys(descriptorConfigTypeFields).length > 0) {
                //Creates the type for this descriptor
                const descriptorConfigType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
                    name: descriptorConfigTypeName,
                    description: `${componentType} component application config for application ['${applicationKey}'] and descriptor ['${descriptor.name}']`,
                    fields: descriptorConfigTypeFields
                });
                applicationConfigTypeFields[namingLib.sanitizeText(descriptor.name)] = {
                    type: descriptorConfigType,
                    resolve: (env) => env.source[descriptor.name]
                }
            }
        });

        //If there were descriptors with form items (A type cannot have 0 fields)
        if (Object.keys(applicationConfigTypeFields).length > 0) {
            let name = `${componentType}_${namingLib.sanitizeText(applicationKey)}_ComponentDataApplicationConfig`;

            //Creates the type for these descriptors
            const applicationConfigType = graphQlLib.createOutputObjectType(schemaGenerator, context, {
                name: context.uniqueName(name),
                description: `${componentType} component' application config for application ['${applicationKey}']`,
                fields: applicationConfigTypeFields
            });
            componentConfigTypeFields[namingLib.sanitizeText(applicationKey)] = {
                type: applicationConfigType,
                resolve: (env) => env.source[namingLib.applicationConfigKey(applicationKey)]
            }
        }
    });

    //If there were descriptors with form items (A type cannot have 0 fields)
    if (Object.keys(componentConfigTypeFields).length > 0) {
        let typeName = `${componentType}ComponentDataConfig`;
        //Creates the type for all the descriptors
        context.types[`${typeName}Type`] = graphQlLib.createOutputObjectType(schemaGenerator, context, {
            name: context.uniqueName(typeName),
            description: `${componentType} component config.`,
            fields: componentConfigTypeFields
        });
    }
}

exports.createComponentDataConfigType = createComponentDataConfigType;
