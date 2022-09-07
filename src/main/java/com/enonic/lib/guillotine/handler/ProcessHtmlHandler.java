package com.enonic.lib.guillotine.handler;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
import com.enonic.xp.portal.html.HtmlElement;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.site.Site;
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

    @SuppressWarnings("unchecked")
    public Object processHtml( ScriptValue params )
    {
        final com.enonic.xp.portal.url.ProcessHtmlParams htmlParams =
            new com.enonic.xp.portal.url.ProcessHtmlParams().portalRequest( this.request );

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

        List<Map<String, Object>> links = new ArrayList<>();
        List<Map<String, Object>> images = new ArrayList<>();
        List<MacroDecorator> processedMacros = new ArrayList<>();

        final Map<String, MacroDescriptor> registeredMacros =
            request.getSite() != null ? getRegisteredMacrosInSystemForSite( request.getSite() ) : getRegisteredMacrosInSystem();

        htmlParams.useCustomMacrosProcessing( true );
        htmlParams.customHtmlProcessor( processor -> {
            processor.processDefault( ( element, properties ) -> {
                if ( "a".equals( element.getTagName() ) )
                {
                    final String linkEditorRef = UUID.randomUUID().toString();
                    element.setAttribute( "data-link-ref", linkEditorRef );
                    links.add( buildLinkProjection( linkEditorRef, properties, element ) );
                }
                if ( "img".equals( element.getTagName() ) )
                {
                    final String imgEditorRef = UUID.randomUUID().toString();
                    element.setAttribute( "data-image-ref", imgEditorRef );
                    images.add( buildImageProjection( imgEditorRef, properties ) );
                }
            } );

            processor.getDocument().select( "figcaption:empty" ).
                forEach( HtmlElement::remove );

            String html = macroServiceSupplier.get().evaluateMacros( processor.getDocument().getInnerHtml(), macro -> {
                if ( !registeredMacros.containsKey( macro.getName() ) )
                {
                    return macro.toString();
                }

                final MacroDecorator macroDecorator = MacroDecorator.from( macro );

                processedMacros.add( macroDecorator );

                return new MacroEditorSerializer( macroDecorator ).serialize();
            } );

            return html;
        } );

        String processedHtml = portalUrlServiceSupplier.get().processHtml( htmlParams );

        HtmlEditorProcessedResult.Builder builder = HtmlEditorProcessedResult.create().
            setRaw( htmlParams.getValue() ).
            setImages( images ).
            setLinks( links ).
            setProcessedHtml( processedHtml );

        if ( !processedMacros.isEmpty() )
        {
            final List<Map<String, Object>> macrosAsJson = processedMacros.stream().
                map( macro -> new MacroEditorJsonSerializer( macro, registeredMacros.get( macro.getMacro().getName() ) ).serialize() ).
                collect( Collectors.toList() );

            builder.setMacrosAsJson( macrosAsJson );
        }

        return new HtmlEditorResultMapper( builder.build() );
    }

    private Map<String, Object> buildLinkProjection( String linkRef, Map<String, String> properties, HtmlElement element )
    {
        final Map<String, Object> projection = new LinkedHashMap<>();

        String mode = properties.get( "mode" );

        projection.put( "contentId", mode != null ? null : properties.get( "contentId" ) ); // only for content
        projection.put( "linkRef", linkRef );
        projection.put( "uri", properties.get( "uri" ) );

        if ( mode != null )
        {
            Map<String, Object> mediaAsMap = new LinkedHashMap<>();
            mediaAsMap.put( "intent", mode );
            mediaAsMap.put( "contentId", properties.get( "contentId" ) );
            projection.put( "media", mediaAsMap ); // only for media
        }

        return projection;
    }

    private Map<String, Object> buildImageProjection( final String imgEditorRef, final Map<String, String> properties )
    {
        final Map<String, Object> imageProjection = new LinkedHashMap<>();

        imageProjection.put( "imageId", properties.get( "contentId" ) );
        imageProjection.put( "imageRef", imgEditorRef );

        final Map<String, Object> styleProjection = new LinkedHashMap<>();

        if ( properties.containsKey( "style:name" ) )
        {
            styleProjection.put( "name", properties.get( "style:name" ) );
        }
        if ( properties.containsKey( "style:aspectRatio" ) )
        {
            styleProjection.put( "aspectRatio", properties.get( "style:aspectRatio" ) );
        }
        if ( properties.containsKey( "style:filter" ) )
        {
            styleProjection.put( "filter", properties.get( "style:filter" ) );
        }

        if ( !styleProjection.isEmpty() )
        {
            imageProjection.put( "style", styleProjection );
        }

        return imageProjection;
    }

    private Map<String, MacroDescriptor> getRegisteredMacrosInSystemForSite( final Site site )
    {
        final List<ApplicationKey> applicationKeys = new ArrayList<>();
        applicationKeys.add( ApplicationKey.SYSTEM );
        applicationKeys.addAll( site.getSiteConfigs().stream().
            map( SiteConfig::getApplicationKey ).collect( Collectors.toList() ) );

        final Map<String, MacroDescriptor> result = new LinkedHashMap<>();

        macroDescriptorServiceSupplier.get().getByApplications( ApplicationKeys.from( applicationKeys ) ).
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
        return macroDescriptorServiceSupplier.get().getAll().stream().collect(
            Collectors.toMap( MacroDescriptor::getName, Function.identity() ) );
    }

}
