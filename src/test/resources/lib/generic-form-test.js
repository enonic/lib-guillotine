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
};
