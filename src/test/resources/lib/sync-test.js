const testingLib = require('/lib/xp/testing');

exports.sync = function () {
    var container = {};
    var key = "schemaId";
    Java.type('com.enonic.lib.guillotine.Synchronizer').sync(__.toScriptValue(function () {
        var data = container[key];
        if (!data) {
            container[key] = {
                id: key
            }
        }
    }));

    testingLib.assertNotNull(container[key]);
};
