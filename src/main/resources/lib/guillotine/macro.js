/* global __ */

exports.processHtml = function (params) {
    let bean = __.newBean('com.enonic.lib.guillotine.ProcessHtmlHandler');
    return bean.processHtml(__.toScriptValue(params));
};
