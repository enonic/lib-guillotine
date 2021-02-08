package com.enonic.lib.guillotine.macro;

import java.util.Map;

public class HtmlMacroResult
{
    private final Map<String, Object> processedAsJson;

    public HtmlMacroResult( final MacroDecorator macro )
    {
        this.processedAsJson = new MacroEditorJsonSerializer( macro ).serialize();
    }

    public Map<String, Object> getProcessedAsJson()
    {
        return processedAsJson;
    }
}
