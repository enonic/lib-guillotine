package com.enonic.lib.guillotine.macro;

import java.util.LinkedHashMap;
import java.util.Map;

import com.google.common.collect.ImmutableMultimap;

public class MacroEditorJsonSerializer
{
    private final MacroDecorator macro;

    public MacroEditorJsonSerializer( final MacroDecorator macro )
    {
        this.macro = macro;
    }

    public Map<String, Object> serialize()
    {
        final Map<String, Object> result = new LinkedHashMap<>();

        result.put( "_name", macro.getMacro().getName() );
        result.put( "_ref", macro.getId() );

        final ImmutableMultimap<String, String> params = macro.getMacro().getParameters();

        for ( String key : params.keySet() )
        {
            for ( String value : params.get( key ) )
            {
                result.put( key, escapeSpecialChars( value ) );
            }
        }

        result.put( "body", macro.getMacro().getBody() );

        return result;
    }

    private String escapeSpecialChars( final String value )
    {
        return value.replaceAll( "\"", "\\\\\"" ).replaceAll( "--", "\\\\-\\\\-" );
    }

}
