package com.enonic.lib.guillotine.macro;

import com.google.common.collect.ImmutableMultimap;

class MacroEditorSerializer
{
    private static final String START_TAG = "<editor-macro ";

    private static final String EDITOR_MACRO_END_TAG = "</editor-macro>";

    private final MacroDecorator macro;

    MacroEditorSerializer( final MacroDecorator macro )
    {
        this.macro = macro;
    }


    String serialize()
    {
        return START_TAG + makeNameAttribute() + " " + makeRefAttribute() + makeParamsAttributes() + ">" + makeBody() +
            EDITOR_MACRO_END_TAG;
    }

    private String makeNameAttribute()
    {
        return "_name=\"" + macro.getMacro().getName() + "\"";
    }

    private String makeRefAttribute()
    {
        return "_ref=\"" + macro.getId() + "\"";
    }

    private String makeParamsAttributes()
    {
        final StringBuilder result = new StringBuilder();
        final ImmutableMultimap<String, String> params = macro.getMacro().getParameters();
        for ( String key : params.keySet() )
        {
            for ( String value : params.get( key ) )
            {
                String escapedVal = escapeSpecialChars( value );
                result.append( " " ).append( key ).append( "=\"" ).append( escapedVal ).append( "\"" );
            }
        }
        return result.toString();
    }

    private String makeBody()
    {
        return macro.getMacro().getBody() != null ? escapeSpecialChars( macro.getMacro().getBody() ) : "";
    }

    private String escapeSpecialChars( final String value )
    {
        return value.replaceAll( "\"", "\\\\\"" ).replaceAll( "--", "\\\\-\\\\-" );
    }
}
