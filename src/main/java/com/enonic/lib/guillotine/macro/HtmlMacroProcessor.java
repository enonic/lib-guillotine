package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.macro.MacroService;

public class HtmlMacroProcessor
{
    private final MacroService macroService;

    private final List<String> registeredMacroNames;

    public HtmlMacroProcessor( final MacroService macroService, final List<String> registeredMacroNames )
    {
        this.macroService = macroService;
        this.registeredMacroNames = registeredMacroNames;
    }

    public HtmlAreaProcessedResult process( final String text )
    {
        final List<MacroDecorator> processedMacros = new ArrayList<>();

        final String processedHtml = macroService.evaluateMacros( text, ( macro ) -> {
            if ( !registeredMacroNames.contains( macro.getName() ) )
            {
                return macro.toString();
            }

            final MacroDecorator macroDecorator = MacroDecorator.from( macro );

            processedMacros.add( macroDecorator );

            return new MacroEditorSerializer( macroDecorator ).serialize();
        } );

        return new HtmlAreaProcessedResult( processedHtml, processedMacros.stream().
            map( HtmlMacroResult::new ).collect( Collectors.toList() ) );
    }
}
