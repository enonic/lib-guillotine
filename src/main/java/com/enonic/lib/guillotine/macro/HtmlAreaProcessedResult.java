package com.enonic.lib.guillotine.macro;

import java.util.List;
import java.util.Map;

public class HtmlAreaProcessedResult
{
    private final String markup;

    private final List<HtmlMacroResult> macrosAsJson;

    private Map<String, Map<String, List<Map<String, Object>>>> macros;

    public HtmlAreaProcessedResult( final String processedHtml, final List<HtmlMacroResult> macroMap )
    {
        this.markup = processedHtml;
        this.macrosAsJson = macroMap;
    }

    public void setMacros( final Map<String, Map<String, List<Map<String, Object>>>> macros )
    {
        this.macros = macros;
    }

    public String getMarkup()
    {
        return markup;
    }

    public List<HtmlMacroResult> getMacrosAsJson()
    {
        return macrosAsJson;
    }

    public Map<String, Map<String, List<Map<String, Object>>>> getMacros()
    {
        return macros;
    }

    public static HtmlAreaProcessedResult empty()
    {
        return new HtmlAreaProcessedResult( "", null );
    }
}
