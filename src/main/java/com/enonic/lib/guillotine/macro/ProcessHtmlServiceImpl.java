package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
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
    private final StyleDescriptorService styleDescriptorService;

    private final PortalUrlService portalUrlService;

    private final MacroService macroService;

    private final MacroDescriptorService macroDescriptorService;

    public ProcessHtmlServiceImpl( final StyleDescriptorService styleDescriptorService, final PortalUrlService portalUrlService,
                                   final MacroService macroService, final MacroDescriptorService macroDescriptorService )
    {
        this.styleDescriptorService = styleDescriptorService;
        this.portalUrlService = portalUrlService;
        this.macroService = macroService;
        this.macroDescriptorService = macroDescriptorService;
    }

    @Override
    public HtmlEditorProcessedResult processHtml( final ProcessHtmlParams params )
    {
        if ( params.getValue() == null || params.getValue().isEmpty() )
        {
            return HtmlEditorProcessedResult.empty();
        }

        final HtmlEditorProcessedResult.Builder builder = HtmlEditorProcessedResult.create();

        builder.setRaw( params.getValue() );

        final List<Map<String, Object>> images = new ArrayList<>();

        final List<Map<String, Object>> links = new ArrayList<>();

        String processedHtml = new HtmlLinkProcessor( styleDescriptorService, portalUrlService ).
            process( params.getValue(), params.getType(), params.getPortalRequest(), params.getImageWidths(), params.getImageSizes(),
                     images::add, links::add );

        builder.setImages( images );
        builder.setLinks( links );

        final Map<String, MacroDescriptor> registeredMacros = params.getPortalRequest().getSite() != null
            ? getRegisteredMacrosInSystemForSite( params.getPortalRequest().getSite() )
            : getRegisteredMacrosInSystem();

        final List<MacroDecorator> processedMacros = new ArrayList<>();

        builder.setProcessedHtml( macroService.evaluateMacros( processedHtml, ( macro ) -> {
            if ( !registeredMacros.containsKey( macro.getName() ) )
            {
                return macro.toString();
            }

            final MacroDecorator macroDecorator = MacroDecorator.from( macro );

            processedMacros.add( macroDecorator );

            return new MacroEditorSerializer( macroDecorator ).serialize();
        } ) );

        if ( !processedMacros.isEmpty() )
        {
            final List<Map<String, Object>> macrosAsJson = processedMacros.stream().
                map( macro -> new MacroEditorJsonSerializer( macro, registeredMacros.get( macro.getMacro().getName() ) ).serialize() ).
                collect( Collectors.toList() );

            builder.setMacrosAsJson( macrosAsJson );
        }

        return builder.build();
    }

    private Map<String, MacroDescriptor> getRegisteredMacrosInSystemForSite( final Site site )
    {
        final List<ApplicationKey> applicationKeys = new ArrayList<>();
        applicationKeys.add( ApplicationKey.SYSTEM );
        applicationKeys.addAll( site.getSiteConfigs().stream().
            map( SiteConfig::getApplicationKey ).collect( Collectors.toList() ) );

        final Map<String, MacroDescriptor> result = new LinkedHashMap<>();

        macroDescriptorService.getByApplications( ApplicationKeys.from( applicationKeys ) ).
            forEach( macroDescriptor -> {
                if ( !result.containsKey( macroDescriptor.getName() ) )
                {
                    result.put( macroDescriptor.getName(), macroDescriptor );
                }
            } );

        return result;
    }

    private Map<String, MacroDescriptor> getRegisteredMacrosInSystem()
    {
        return macroDescriptorService.getAll().stream().collect( Collectors.toMap( MacroDescriptor::getName, Function.identity() ) );
    }
}
