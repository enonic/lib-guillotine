package com.enonic.lib.guillotine.mock;

import java.util.function.Function;

import com.enonic.xp.macro.Macro;
import com.enonic.xp.macro.MacroService;

public class MockMacroServiceImpl
    implements MacroService
{
    @Override
    public Macro parse( final String text )
    {
        return null;
    }

    @Override
    public String evaluateMacros( final String text, final Function<Macro, String> macroProcessor )
    {
        macroProcessor.apply( Macro.create().
            name( "mymacro" ).
            body( "" ).
            param( "field_name_1", "Value 11" ).
            param( "field_name_1", "Value 12" ).
            build() );

        return "<editor-macro data-macro-name=\"mymacro\" data-macro-ref=\"02fbe5c1-f133-4cc0-9604-71387dd514e4\"></editor-macro>";
    }

    @Override
    public String postProcessInstructionSerialize( final Macro macro )
    {
        return null;
    }
}
