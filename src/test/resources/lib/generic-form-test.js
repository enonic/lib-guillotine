const formLib = require('/lib/guillotine/dynamic/form');
const testingLib = require('/lib/xp/testing');

exports.testGenerateFormItemObjectType = function () {
    let objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        inputType: 'AttachmentUploader',
        formItemType: 'Input',
        occurrences: {
            maximum: 1
        }
    });
    testingLib.assertEquals('Attachment', objectType.name);

    objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        formItemType: "Input",
        name: "dateTimeField",
        label: "DateTime Field",
        maximize: true,
        inputType: "DateTime",
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {
            timezone: [
                {
                    value: "true"
                }
            ]
        }
    });
    testingLib.assertEquals('DateTime', objectType.name);

    objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        formItemType: "Input",
        name: "dateTimeField",
        label: "DateTime Field",
        maximize: true,
        inputType: "DateTime",
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('LocalDateTime', objectType.name);

    objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        formItemType: "Input",
        name: "timeField",
        label: "Time Field",
        maximize: true,
        inputType: "Time",
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('LocalTime', objectType.name);

    objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        formItemType: "Input",
        name: "dateField",
        label: "Date Field",
        maximize: true,
        inputType: "Date",
        occurrences: {
            maximum: 1,
            minimum: 0
        },
        config: {}
    });
    testingLib.assertEquals('Date', objectType.name);
};
