package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.site.SiteConfig;
import com.enonic.xp.style.StyleDescriptorService;

public class ProcessHtmlServiceImpl
    implements ProcessHtmlService
{
    private final ContentService contentService;

    private final StyleDescriptorService styleDescriptorService;

    private final PortalUrlService portalUrlService;

    private final MacroService macroService;

    private final MacroDescriptorService macroDescriptorService;

    public ProcessHtmlServiceImpl( final ContentService contentService, final StyleDescriptorService styleDescriptorService,
                                   final PortalUrlService portalUrlService, final MacroService macroService,
                                   final MacroDescriptorService macroDescriptorService )
    {
        this.contentService = contentService;
        this.styleDescriptorService = styleDescriptorService;
        this.portalUrlService = portalUrlService;
        this.macroService = macroService;
        this.macroDescriptorService = macroDescriptorService;
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

        final List<String> registeredMacroNames = getRegisteredMacrosInSystemForSite( params.getPortalRequest().getSite() );

        final HtmlAreaProcessedResult result = new HtmlMacroProcessor( macroService, registeredMacroNames ).process( processedHtml );

        buildMacros( result );

        return result;
    }

    private void buildMacros( final HtmlAreaProcessedResult result )
    {
        if ( result.getMacrosAsJson() == null || result.getMacrosAsJson().isEmpty() )
        {
            return;
        }

        final List<Map<String, Object>> macros = new ArrayList<>();

        result.getMacrosAsJson().forEach( macro -> {
            final Object macroName = macro.getProcessedAsJson().get( "macroName" );

            macros.add( Collections.singletonMap( macroName.toString(), macro.getProcessedAsJson() ) );
        } );

        result.setMacros( macros );
    }

    private List<String> getRegisteredMacrosInSystemForSite( final Site site )
    {
        final List<ApplicationKey> applicationKeys = site.getSiteConfigs().stream().
            map( SiteConfig::getApplicationKey ).collect( Collectors.toList() );

        applicationKeys.add( ApplicationKey.SYSTEM );

        return macroDescriptorService.getByApplications( ApplicationKeys.from( applicationKeys ) ).
            stream().
            map( MacroDescriptor::getName ).collect( Collectors.toList() );
    }


    private String unescapeValue( String value )
    {
        return value.replace( "\\", "" );
    }
}
