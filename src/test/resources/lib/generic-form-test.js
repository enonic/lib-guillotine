const formLib = require('/lib/guillotine/dynamic/form');
const testingLib = require('/lib/xp/testing');

exports.testGenerateFormItemObjectType = function () {
    var objectType = formLib.generateFormItemObjectType({}, 'namePrefix', {
        inputType: 'AttachmentUploader',
        formItemType: 'Input',
        occurrences: {
            maximum: 1
        }
    });

    testingLib.assertEquals('String', objectType.name);
};
