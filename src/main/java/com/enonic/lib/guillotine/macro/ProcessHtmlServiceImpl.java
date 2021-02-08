package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.macro.MacroKey;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.site.SiteConfig;
import com.enonic.xp.site.SiteConfigs;
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

        final HtmlAreaProcessedResult result = new HtmlMacroProcessor( macroService ).process( processedHtml );

        buildMacros( result, params.getPortalRequest().getSite() );

        return result;
    }

    private void buildMacros( final HtmlAreaProcessedResult result, final Site site )
    {
        if ( result.getMacrosAsJson() == null || result.getMacrosAsJson().isEmpty() )
        {
            return;
        }

        final Map<String, List<Map<String, Object>>> macrosGroupedByName = new HashMap<>();

        result.getMacrosAsJson().forEach( macro -> {
            final Object macroName = macro.getProcessedAsJson().get( "macroName" );

            if ( !macrosGroupedByName.containsKey( macroName.toString() ) )
            {
                macrosGroupedByName.put( macroName.toString(), new ArrayList<>() );
            }

            macrosGroupedByName.get( macroName.toString() ).add( macro.getProcessedAsJson() );
        } );

        final Map<String, Map<String, List<Map<String, Object>>>> macros = new LinkedHashMap<>();

        macrosGroupedByName.keySet().forEach( macroName -> {
            MacroDescriptor macroDescriptor = resolveMacroDescriptor( site, macroName );

            if ( macroDescriptor != null )
            {
                final String applicationKey = macroDescriptor.getKey().getApplicationKey().toString();
                if ( !macros.containsKey( applicationKey ) )
                {
                    macros.put( applicationKey, new LinkedHashMap<>() );
                }
                if ( !macros.get( applicationKey ).containsKey( macroName ) )
                {
                    macros.get( applicationKey ).put( macroName, new ArrayList<>() );
                }
                macros.get( applicationKey ).get( macroName ).addAll( macrosGroupedByName.get( macroName ) );
            }
        } );

        result.setMacros( macros );
    }

    private MacroDescriptor resolveMacroDescriptor( final Site site, final String macroName )
    {
        //Searches for the macro in the applications associated to the site
        final SiteConfigs siteConfigs = site.getSiteConfigs();
        MacroDescriptor macroDescriptor = siteConfigs.
            stream().
            map( siteConfig -> MacroKey.from( siteConfig.getApplicationKey(), macroName ) ).
            map( macroDescriptorService::getByKey ).
            filter( Objects::nonNull ).findFirst().
            orElse( null );

        if ( macroDescriptor == null )
        {
            macroDescriptor = resolveMacroDescriptorCaseInsensitive( siteConfigs, macroName );
        }

        //If there is no corresponding macro
        if ( macroDescriptor == null )
        {
            //Searches in the builtin macros
            final MacroKey macroKey = MacroKey.from( ApplicationKey.SYSTEM, macroName );
            macroDescriptor = macroDescriptorService.getByKey( macroKey );
        }

        return macroDescriptor;
    }

    private MacroDescriptor resolveMacroDescriptorCaseInsensitive( final SiteConfigs siteConfigs, final String macroName )
    {
        for ( SiteConfig siteConfig : siteConfigs )
        {
            final MacroDescriptors macroDescriptors = macroDescriptorService.getByApplication( siteConfig.getApplicationKey() );
            final MacroDescriptor macroDescriptor = macroDescriptors.stream().
                filter( ( md ) -> md.getName().equalsIgnoreCase( macroName ) ).
                findFirst().
                orElse( null );
            if ( macroDescriptor != null )
            {
                return macroDescriptor;
            }
        }
        return null;
    }

    private String unescapeValue( String value )
    {
        return value.replace( "\\", "" );
    }
}
