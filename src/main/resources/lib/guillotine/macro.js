/* global __ */

exports.processHtml = function (params) {
    let bean = __.newBean('com.enonic.lib.guillotine.handler.ProcessHtmlHandler');
    return __.toNativeObject(bean.processHtml(__.toScriptValue(params)));
};
