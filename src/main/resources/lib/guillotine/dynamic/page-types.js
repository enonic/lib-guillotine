const graphQlLib = require('/lib/guillotine/graphql');

const namingLib = require('/lib/guillotine/util/naming');
const formLib = require('/lib/guillotine/dynamic/form');


function createPageComponentDataConfigType(context) {
    createComponentDataConfigType(context, 'Page');
    createComponentDataConfigType(context, 'Part');
    createComponentDataConfigType(context, 'Layout');
}


function getDescriptors(componentType, applicationKey) {
    const bean = __.newBean('com.enonic.lib.guillotine.' + componentType + 'DescriptorServiceBean');
    return __.toNativeObject(bean.getByApplication(applicationKey));
}

function createComponentDataConfigType(context, componentType) {
    const componentConfigTypeFields = {};


    //For each application
    context.options.applications.forEach(applicationKey => {

        //Get descriptors
        const descriptors = getDescriptors(componentType, applicationKey);


        //For each descriptor
        const applicationConfigTypeFields = {};
        descriptors.forEach(descriptor => {

            const descriptorConfigTypeName = context.uniqueName(componentType + 'ComponentDataDescriptorConfig')
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

                //Creates the type for this descriptor
                const descriptorConfigType = graphQlLib.createObjectType(context, {
                    name: descriptorConfigTypeName,
                    description: componentType + ' component application config for application [' + applicationKey + '] and descriptor [' +
                                 descriptor.name + ']',
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

            //Creates the type for these descriptors
            const applicationConfigType = graphQlLib.createObjectType(context, {
                name: context.uniqueName(componentType + 'ComponentDataApplicationConfig'),
                description: componentType + ' component application config for application [' + applicationKey + ']',
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

        //Creates the type for all the descriptors
        context.types[componentType + 'ComponentDataConfigType'] = graphQlLib.createObjectType(context, {
            name: context.uniqueName(componentType + 'ComponentDataConfig'),
            description: componentType + ' component config.',
            fields: componentConfigTypeFields
        });
    }
}

exports.createPageComponentDataConfigType = createPageComponentDataConfigType;