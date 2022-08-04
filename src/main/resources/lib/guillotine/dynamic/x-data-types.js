/** global __ */

const libs = {
    graphQL: require('/lib/guillotine/graphql'),
    naming: require('/lib/guillotine/util/naming'),
    form: require('/lib/guillotine/dynamic/form')
};

function createXDataConfigType(context) {
    const xDataBean = __.newBean('com.enonic.lib.guillotine.handler.XDataHandler');
    const xDataDescriptors = __.toNativeObject(xDataBean.getXDataByApplicationKeys(context.options.applications));

    const xDataTypeFields = {};

    Object.keys(xDataDescriptors).forEach(applicationKey => {
        const xDataApplicationTypeFields = {};

        xDataDescriptors[applicationKey].forEach(descriptor => {
            const sanitizeDescriptorName = libs.naming.sanitizeText(descriptor.name);

            const xDataTypeName = `XData_${libs.naming.sanitizeText(descriptor.applicationKey)}_${sanitizeDescriptorName}`;

            const xDataConfigTypeName = `${xDataTypeName}_DataConfig`;

            const xDataConfigFields = {};

            libs.form.getFormItems(descriptor.form).forEach(function (formItem) {
                xDataConfigFields[libs.naming.sanitizeText(formItem.name)] = {
                    type: libs.form.generateFormItemObjectType(context, xDataConfigTypeName, formItem),
                    args: libs.form.generateFormItemArguments(context, formItem),
                    resolve: libs.form.generateFormItemResolveFunction(formItem),
                }
            });

            if (Object.keys(xDataConfigFields).length > 0) {
                const xDataConfigType = libs.graphQL.createObjectType(context, {
                    name: xDataConfigTypeName,
                    description: `Extra data config for application ['${descriptor.applicationKey}'] and descriptor ['${descriptor.name}']`,
                    fields: xDataConfigFields
                });

                xDataApplicationTypeFields[sanitizeDescriptorName] = {
                    type: xDataConfigType,
                    resolve: function (env) {
                        return env.source[descriptor.name];
                    }
                }
            }
        });

        if (Object.keys(xDataApplicationTypeFields).length > 0) {
            let name = `XData_${libs.naming.sanitizeText(applicationKey)}_ApplicationConfig`;

            const applicationConfigType = libs.graphQL.createObjectType(context, {
                name: context.uniqueName(name),
                description: `XDataApplicationConfig for application ['${applicationKey}']`,
                fields: xDataApplicationTypeFields
            });
            xDataTypeFields[libs.naming.sanitizeText(applicationKey)] = {
                type: applicationConfigType,
                resolve: (env) => env.source[libs.naming.applicationConfigKey(applicationKey)]
            }
        }
    });

    context.types.extraDataType = libs.graphQL.createObjectType(context, {
        name: context.uniqueName('ExtraData'),
        description: `Extra data.`,
        fields: xDataTypeFields
    });
}

exports.createXDataConfigType = createXDataConfigType;
