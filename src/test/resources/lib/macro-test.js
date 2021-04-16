const testingLib = require('/lib/xp/testing');
const macroLib = require('/lib/guillotine/macro');

exports.testProcessHtml = function () {
    let result = macroLib.processHtml({
        value: "[mymacro field_name_1=\"Value 11\" field_name_1=\"Value 12\"/]",
        type: "server"
    });

    testingLib.assertNotNull(result.processedHtml);
    testingLib.assertTrue(result.processedHtml.startsWith("<editor-macro data-macro-name=\"mymacro\" data-macro-ref="));
    testingLib.assertNotNull(result.macrosAsJson);
    testingLib.assertEquals("mymacro", result.macrosAsJson[0].name);
    testingLib.assertNotNull(result.macrosAsJson[0].ref);

    let macroConfig = result.macrosAsJson[0].config;

    let macro = macroConfig.mymacro;
    testingLib.assertNotNull(macro);
    testingLib.assertNotNull(macro['field_name_1']);
    testingLib.assertEquals('Value 11', macro['field_name_1'][0]);
    testingLib.assertEquals('Value 12', macro['field_name_1'][1]);
    testingLib.assertEquals('', macro.body);
};
