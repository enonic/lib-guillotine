const testingLib = require('/lib/xp/testing');
const macroLib = require('/lib/guillotine/macro');

exports.testProcessHtml = function () {
    let result = macroLib.processHtml({
        value: "[mymacro field_name_1=\"Value 11\" field_name_1=\"Value 12\"/]",
        type: "server"
    });

    testingLib.assertNotNull(result.markup);
    testingLib.assertTrue(result.markup.startsWith("<editor-macro data-macro-name=\"mymacro\" data-macro-ref="));
    testingLib.assertNotNull(result.macrosAsJson);
    testingLib.assertEquals("mymacro", result.macrosAsJson[0].macroName);
    testingLib.assertNotNull(result.macrosAsJson[0].macroRef);
    testingLib.assertNotNull(result.macrosAsJson[0]['field_name_1']);
    testingLib.assertEquals('Value 11', result.macrosAsJson[0]['field_name_1'][0]);
    testingLib.assertEquals('Value 12', result.macrosAsJson[0]['field_name_1'][1]);
    testingLib.assertEquals('', result.macrosAsJson[0].body);
    testingLib.assertNotNull(result.macros);
    testingLib.assertNotNull(result.macros['myapp']);
    testingLib.assertTrue(result.macros['myapp']['mymacro'].length === 1);
    testingLib.assertNotNull(result.macros['myapp']['mymacro'][0]);

    testingLib.assertEquals("mymacro", result.macros['myapp']['mymacro'][0].macroName);
    testingLib.assertNotNull(result.macros['myapp']['mymacro'][0].macroRef);
    testingLib.assertNotNull(result.macros['myapp']['mymacro'][0]['field_name_1']);
    testingLib.assertEquals('Value 11', result.macros['myapp']['mymacro'][0]['field_name_1'][0]);
    testingLib.assertEquals('Value 12', result.macros['myapp']['mymacro'][0]['field_name_1'][1]);
    testingLib.assertEquals('', result.macros['myapp']['mymacro'][0].body);
};
