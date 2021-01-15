const namingLib = require('/lib/guillotine/util/naming');
const testingLib = require('/lib/xp/testing');

exports.testNaming = function () {
    testingLib.assertEquals('field_name', namingLib.sanitizeText('field+name'));
    testingLib.assertEquals('field_name', namingLib.sanitizeText('field+name'));
    testingLib.assertEquals('field_name', namingLib.sanitizeText("field name"));
    testingLib.assertEquals('field_name', namingLib.sanitizeText("field_name"));
    testingLib.assertEquals('field_name', namingLib.sanitizeText("field-name"));
    testingLib.assertEquals('field_Name', namingLib.sanitizeText("field_Name"));
    testingLib.assertEquals('field_Name', namingLib.sanitizeText("field-Name"));
    testingLib.assertEquals('fieldName', namingLib.sanitizeText("fieldName"));
    testingLib.assertEquals('fieldname', namingLib.sanitizeText("fieldname"));
    testingLib.assertEquals('_123fieldName', namingLib.sanitizeText("123fieldName"));
    testingLib.assertEquals('fieldName123', namingLib.sanitizeText("fieldName123"));
    testingLib.assertEquals('fieldName_123', namingLib.sanitizeText("fieldName-123"));
    testingLib.assertEquals('fieldName_123', namingLib.sanitizeText("fieldName_123"));
    testingLib.assertEquals('fieldName_123', namingLib.sanitizeText("fieldName 123"));
    testingLib.assertEquals('nazvaniePolJA', namingLib.sanitizeText("названиеПолЯ"));
    testingLib.assertEquals('_12nazvaniePolja', namingLib.sanitizeText("#12названиеПоля?&*^%"));
    testingLib.assertEquals('com_enonic_app', namingLib.sanitizeText('com.enonic.app'));
};
