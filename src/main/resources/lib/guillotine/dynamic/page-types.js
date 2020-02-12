const graphQlLib = require('/lib/guillotine/graphql');

const namingLib = require('/lib/guillotine/util/naming');
const formLib = require('/lib/guillotine/dynamic/form');

function createPageComponentDataConfigType(context) {
    const pageConfigFields = {};


    //For each application
    context.options.applications.forEach(applicationKey => {

        //Get descriptors
        const bean = __.newBean('com.enonic.lib.guillotine.PageDescriptorServiceBean');
        const pageDescriptors = __.toNativeObject(bean.getByApplication(applicationKey));


        //For each descriptor
        const pageApplicationConfigFields = {};
        pageDescriptors.forEach(pageDescriptor => {


            const pageDescriptorConfigName = context.uniqueName('PageComponentDataDescriptorConfig')
            const pageDescriptorConfigFields = {};

            //For each form item
            formLib.getFormItems(pageDescriptor.form).forEach(function (formItem) {

                //Creates a data field corresponding to this form item
                pageDescriptorConfigFields[namingLib.sanitizeText(formItem.name)] = {
                    type: formLib.generateFormItemObjectType(context, pageDescriptorConfigName, formItem),
                    args: formLib.generateFormItemArguments(context, formItem),
                    resolve: formLib.generateFormItemResolveFunction(formItem)
                }
            });

            //If there were form items (A type cannot have 0 fields)
            if (Object.keys(pageDescriptorConfigFields).length > 0) {

                //Creates the type for this descriptor
                const pageDescriptorConfigType = graphQlLib.createObjectType(context, {
                    name: pageDescriptorConfigName,
                    description: 'Page component application config for application [' + applicationKey + '] and descriptor [' +
                                 pageDescriptor.name + ']',
                    fields: pageDescriptorConfigFields
                });
                pageApplicationConfigFields[namingLib.sanitizeText(pageDescriptor.name)] = {
                    type: pageDescriptorConfigType
                }
            }
        });

        //If there were descriptors with form items (A type cannot have 0 fields)
        if (Object.keys(pageApplicationConfigFields).length > 0) {

            //Creates the type for these descriptors
            const applicationConfigType = graphQlLib.createObjectType(context, {
                name: context.uniqueName('PageComponentDataApplicationConfig'),
                description: 'Page component application config for application [' + applicationKey + ']',
                fields: pageApplicationConfigFields
            });
            pageConfigFields[namingLib.sanitizeText(applicationKey)] = {
                type: applicationConfigType,
                resolve: (env) => env.source[namingLib.applicationConfigKey(applicationKey)]
            }

        }
    });


    //If there were descriptors with form items (A type cannot have 0 fields)
    if (Object.keys(pageConfigFields).length > 0) {

        //Creates the type for all the descriptors
        context.types.pageComponentDataConfigType = graphQlLib.createObjectType(context, {
            name: context.uniqueName('PageComponentDataConfig'),
            description: 'Page component config.',
            fields: pageConfigFields
        });
    }
}

exports.createPageComponentDataConfigType = createPageComponentDataConfigType;