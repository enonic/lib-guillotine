package com.enonic.lib.guillotine.macro;

import java.util.Map;

public class HtmlAreaProcessedResult
{
    private final String processedHtml;

    private final Map<String, HtmlMacroResult> macrosAsMap;

    public HtmlAreaProcessedResult( final String processedHtml, final Map<String, HtmlMacroResult> macroMap )
    {
        this.processedHtml = processedHtml;
        this.macrosAsMap = macroMap;
    }

    public String getProcessedHtml()
    {
        return processedHtml;
    }

    public Map<String, HtmlMacroResult> getMacrosAsMap()
    {
        return macrosAsMap;
    }

    public static HtmlAreaProcessedResult empty()
    {
        return new HtmlAreaProcessedResult( "", null );
    }
}
