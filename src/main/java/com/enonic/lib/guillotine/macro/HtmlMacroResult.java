package com.enonic.lib.guillotine.macro;

import java.util.Map;

public class HtmlMacroResult
{
    private final String processedAsHtml;

    private final Map<String, Object> processedAsJson;

    HtmlMacroResult( final MacroDecorator macro )
    {
        this.processedAsHtml = new MacroEditorSerializer( macro ).serialize();
        this.processedAsJson = new MacroEditorJsonSerializer( macro ).serialize();
    }

    public String getProcessedAsHtml()
    {
        return processedAsHtml;
    }

    public Map<String, Object> getProcessedAsJson()
    {
        return processedAsJson;
    }
}
