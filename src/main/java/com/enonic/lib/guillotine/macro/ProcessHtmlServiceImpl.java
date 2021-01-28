package com.enonic.lib.guillotine.macro;

import com.enonic.xp.content.ContentService;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.style.StyleDescriptorService;

public class ProcessHtmlServiceImpl
    implements ProcessHtmlService
{
    private final ContentService contentService;

    private final StyleDescriptorService styleDescriptorService;

    private final PortalUrlService portalUrlService;

    private final MacroService macroService;

    public ProcessHtmlServiceImpl( final ContentService contentService, final StyleDescriptorService styleDescriptorService,
                                   final PortalUrlService portalUrlService, final MacroService macroService )
    {
        this.contentService = contentService;
        this.styleDescriptorService = styleDescriptorService;
        this.portalUrlService = portalUrlService;
        this.macroService = macroService;
    }

    @Override
    public HtmlAreaProcessedResult processHtml( final ProcessHtmlParams params )
    {
        if ( params.getValue() == null || params.getValue().isEmpty() )
        {
            return HtmlAreaProcessedResult.empty();
        }

        String processedHtml = new HtmlLinkProcessor( contentService, styleDescriptorService, portalUrlService ).
            process( unescapeValue( params.getValue() ), params.getType(), params.getPortalRequest() );

        return new HtmlMacroProcessor( macroService ).process( processedHtml );
    }

    private String unescapeValue( String value )
    {
        return value.replace( "\\", "" );
    }
}
