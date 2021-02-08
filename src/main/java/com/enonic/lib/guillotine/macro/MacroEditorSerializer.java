package com.enonic.lib.guillotine.macro;

public class MacroEditorSerializer
{
    private static final String START_TAG = "<editor-macro ";

    private static final String EDITOR_MACRO_END_TAG = "</editor-macro>";

    private final MacroDecorator macro;

    public MacroEditorSerializer( final MacroDecorator macro )
    {
        this.macro = macro;
    }

    public String serialize()
    {
        return START_TAG + makeNameAttribute() + " " + makeRefAttribute() + ">" + makeBody() + EDITOR_MACRO_END_TAG;
    }

    private String makeNameAttribute()
    {
        return "data-macro-name=\"" + macro.getMacro().getName() + "\"";
    }

    private String makeRefAttribute()
    {
        return "data-macro-ref=\"" + macro.getId() + "\"";
    }

    private String makeBody()
    {
        return macro.getMacro().getBody() != null ? macro.getMacro().getBody() : "";
    }
}
