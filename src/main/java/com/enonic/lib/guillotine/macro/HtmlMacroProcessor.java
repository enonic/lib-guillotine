package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.enonic.xp.macro.MacroService;

public class HtmlMacroProcessor
{
    private final MacroService macroService;

    public HtmlMacroProcessor( final MacroService macroService )
    {
        this.macroService = macroService;
    }

    public HtmlAreaProcessedResult process( final String text )
    {
        final List<MacroDecorator> processedMacros = new ArrayList<>();

        final String processedHtml = macroService.evaluateMacros( text, ( macro ) -> {
            final MacroDecorator macroDecorator = MacroDecorator.from( macro );

            processedMacros.add( macroDecorator );

            return new MacroEditorSerializer( macroDecorator ).serialize();
        } );

        return new HtmlAreaProcessedResult( processedHtml, processedMacros.stream().
            collect( Collectors.toMap( MacroDecorator::getId, HtmlMacroResult::new ) ) );
    }
}
