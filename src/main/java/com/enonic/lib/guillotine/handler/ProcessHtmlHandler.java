package com.enonic.lib.guillotine.handler;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.macro.HtmlEditorProcessedResult;
import com.enonic.lib.guillotine.macro.MacroDecorator;
import com.enonic.lib.guillotine.macro.MacroEditorJsonSerializer;
import com.enonic.lib.guillotine.macro.MacroEditorSerializer;
import com.enonic.lib.guillotine.mapper.HtmlEditorResultMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.html.HtmlDocument;
import com.enonic.xp.portal.html.HtmlElement;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.portal.url.ProcessHtmlParams;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.site.SiteConfig;

public class ProcessHtmlHandler
    implements ScriptBean
{
    private Supplier<PortalUrlService> portalUrlServiceSupplier;

    private Supplier<MacroService> macroServiceSupplier;

    private Supplier<MacroDescriptorService> macroDescriptorServiceSupplier;

    private PortalRequest request;

    @Override
    public void initialize( final BeanContext context )
    {
        this.request = context.getBinding( PortalRequest.class ).get();

        this.portalUrlServiceSupplier = context.getService( PortalUrlService.class );
        this.macroServiceSupplier = context.getService( MacroService.class );
        this.macroDescriptorServiceSupplier = context.getService( MacroDescriptorService.class );
    }

    public Object processHtml( ScriptValue params )
    {
        final ProcessHtmlParams htmlParams = createProcessHtmlParams( params );

        String contentId = params.getMap().containsKey( "contentId" ) ? params.getMap().get( "contentId" ).toString() : null;

        List<Map<String, Object>> links = new ArrayList<>();
        List<Map<String, Object>> images = new ArrayList<>();
        List<MacroDecorator> processedMacros = new ArrayList<>();

        final Map<String, MacroDescriptor> registeredMacros =
            request.getSite() != null ? getRegisteredMacrosInSystemForSite() : getRegisteredMacrosInSystem();

        htmlParams.processMacros( false );
        htmlParams.customHtmlProcessor( processor -> {
            processor.processDefault( new CustomHtmlPostProcessor( links, images ) );

            final HtmlDocument htmlDocument = processor.getDocument();
            htmlDocument.select( "figcaption:empty" ).forEach( HtmlElement::remove );
            return htmlDocument.getInnerHtml();
        } );

        final String processedHtml =
            macroServiceSupplier.get().evaluateMacros( portalUrlServiceSupplier.get().processHtml( htmlParams ), macro -> {
                if ( !registeredMacros.containsKey( macro.getName() ) )
                {
                    return macro.toString();
                }
                final MacroDecorator macroDecorator = MacroDecorator.from( macro, contentId );
                processedMacros.add( macroDecorator );
                return new MacroEditorSerializer( macroDecorator ).serialize();
            } );

        final HtmlEditorProcessedResult.Builder builder =
            HtmlEditorProcessedResult.create().setRaw( htmlParams.getValue() ).setImages( images ).setLinks( links ).setProcessedHtml(
                processedHtml );

        if ( !processedMacros.isEmpty() )
        {
            final List<Map<String, Object>> macrosAsJson = processedMacros.stream().map(
                macro -> new MacroEditorJsonSerializer( macro, registeredMacros.get( macro.getMacro().getName() ) ).serialize() ).collect(
                Collectors.toList() );

            builder.setMacrosAsJson( macrosAsJson );
        }

        return new HtmlEditorResultMapper( builder.build() );
    }

    private ProcessHtmlParams createProcessHtmlParams( final ScriptValue params )
    {
        final ProcessHtmlParams htmlParams = new ProcessHtmlParams().portalRequest( this.request );
        if ( params.getMap().containsKey( "value" ) )
        {
            htmlParams.value( params.getMap().get( "value" ).toString() );
        }
        if ( params.getMap().containsKey( "type" ) )
        {
            htmlParams.type( params.getMap().get( "type" ).toString() );
        }
        if ( params.getMap().containsKey( "imageWidths" ) )
        {
            htmlParams.imageWidths( (List<Integer>) params.getMap().get( "imageWidths" ) );
        }
        if ( params.getMap().containsKey( "imageSizes" ) )
        {
            htmlParams.imageSizes( params.getMap().get( "imageSizes" ).toString() );
        }
        return htmlParams;
    }

    private Map<String, MacroDescriptor> getRegisteredMacrosInSystemForSite()
    {
        final List<ApplicationKey> applicationKeys = new ArrayList<>();
        applicationKeys.add( ApplicationKey.SYSTEM );
        applicationKeys.addAll(
            request.getSite().getSiteConfigs().stream().map( SiteConfig::getApplicationKey ).collect( Collectors.toList() ) );

        final Map<String, MacroDescriptor> result = new LinkedHashMap<>();

        macroDescriptorServiceSupplier.get().getByApplications( ApplicationKeys.from( applicationKeys ) ).forEach( macroDescriptor -> {
            if ( !result.containsKey( macroDescriptor.getName() ) )
            {
                result.put( macroDescriptor.getName(), macroDescriptor );
            }
        } );

        return result;
    }

    private Map<String, MacroDescriptor> getRegisteredMacrosInSystem()
    {
        return macroDescriptorServiceSupplier.get().getAll().stream().collect(
            Collectors.toMap( MacroDescriptor::getName, Function.identity() ) );
    }
}
