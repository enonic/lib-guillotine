package com.enonic.lib.guillotine.macro;

import java.util.LinkedHashMap;
import java.util.Map;

import com.google.common.collect.ImmutableMultimap;

class MacroEditorJsonSerializer
{
    private final MacroDecorator macro;

    MacroEditorJsonSerializer( final MacroDecorator macro )
    {
        this.macro = macro;
    }

    Map<String, Object> serialize()
    {
        final Map<String, Object> result = new LinkedHashMap<>();

        result.put( "macroName", macro.getMacro().getName() );
        result.put( "macroRef", macro.getId() );

        final ImmutableMultimap<String, String> params = macro.getMacro().getParameters();

        for ( String key : params.keySet() )
        {
            result.put( key,  macro.getMacro().getParameter( key ));
        }

        result.put( "body", macro.getMacro().getBody() );

        return result;
    }

}
