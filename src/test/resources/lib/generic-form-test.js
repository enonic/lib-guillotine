const formLib = require('/lib/guillotine/dynamic/form');
const testingLib = require('/lib/xp/testing');
const graphqlLib = require('/lib/guillotine/graphql');

const schemaGenerator = graphqlLib.newSchemaGenerator();

exports.testGenerateFormItemObjectType = function () {
    let objectType = formLib.generateFormItemObjectType({schemaGenerator}, 'namePrefix', {
        inputType: 'AttachmentUploader',
        formItemType: 'Input',
        occurrences: {
            maximum: 1
        }
    });
    testingLib.assertEquals('Attachment', objectType.getName());

    objectType = formLib.generateFormItemObjectType({schemaGenerator}, 'namePrefix', {
        formItemType: 'Input',
        name: 'dateTimeField',
        label: 'DateTime Field',
        maximize: true,
        inputType: 'DateTime',
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {
            timezone: [
                {
                    value: 'true'
                }
            ]
        }
    });
    testingLib.assertEquals('DateTime', objectType.getName());

    objectType = formLib.generateFormItemObjectType({schemaGenerator}, 'namePrefix', {
        formItemType: 'Input',
        name: 'dateTimeField',
        label: 'DateTime Field',
        maximize: true,
        inputType: 'DateTime',
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('LocalDateTime', objectType.getName());

    objectType = formLib.generateFormItemObjectType({schemaGenerator}, 'namePrefix', {
        formItemType: 'Input',
        name: 'timeField',
        label: 'Time Field',
        maximize: true,
        inputType: 'Time',
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('LocalTime', objectType.getName());

    objectType = formLib.generateFormItemObjectType({schemaGenerator}, 'namePrefix', {
        formItemType: 'Input',
        name: 'dateField',
        label: 'Date Field',
        maximize: true,
        inputType: 'Date',
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('Date', objectType.getName());


    objectType = formLib.generateFormItemObjectType({
        uniqueName: v => v,
        schemaGenerator
    }, 'namePrefix', {
        formItemType: 'ItemSet',
        name: 'testItemSet',
        label: 'ItemSet Field',
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        items: [
            {
                formItemType: 'Input',
                name: 'timeField',
                label: 'Time Field',
                maximize: true,
                inputType: 'Time',
                occurrences: {
                    maximum: 1,
                    minimum: 0
                },
                config: {},
            },
        ]
    });
    testingLib.assertEquals('namePrefix_TestItemSet', objectType.getName());

    objectType = formLib.generateFormItemObjectType({
        uniqueName: v => v,
        schemaGenerator
    }, 'namePrefix', {
        formItemType: 'OptionSet',
        name: 'testOptionSet',
        label: 'OptionSet Field',
        occurrences: {
            maximum: 1,
            minimum: 1,
        },
        selection: {
            maximum: 1,
        },
        options: [
            {
                name: 'text',
                label: 'Text',
                items: [
                    {
                        name: 'description',
                        label: 'Description',
                        inputType: 'HtmlArea',
                        occurrences: {
                            maximum: 1,
                            minimum: 0
                        },
                        config: {},
                    }
                ],
            },
        ],
    });
    testingLib.assertEquals('namePrefix_TestOptionSet', objectType.getName());
};
