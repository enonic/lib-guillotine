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
import com.enonic.xp.style.ImageStyle;

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

        htmlParams.setLinkProcessor( linkProjection -> {
            linkProjection.makeDefault();


            final HtmlElement element = linkProjection.getElement();
            final String linkEditorRef = UUID.randomUUID().toString();
            element.setAttribute( "data-link-ref", linkEditorRef );
            links.add( buildLinkProjection( linkProjection.getContentId(), linkEditorRef, element.getAttribute( "href" ),
                                            linkProjection.getMode() ) );
        } );

        htmlParams.setImageProcessor( imageProjection -> {
            imageProjection.makeDefault();

            final String imgEditorRef = UUID.randomUUID().toString();
            imageProjection.getElement().setAttribute( "data-image-ref", imgEditorRef );
            images.add( buildImageProjection( imageProjection.getContentId(), imgEditorRef, imageProjection.getImageStyle() ) );
        } );

        htmlParams.setMacrosProcessor( html -> macroServiceSupplier.get().evaluateMacros( html, macro -> {
            if ( !registeredMacros.containsKey( macro.getName() ) )
            {
                return macro.toString();
            }

            final MacroDecorator macroDecorator = MacroDecorator.from( macro );

            processedMacros.add( macroDecorator );

            return new MacroEditorSerializer( macroDecorator ).serialize();
        } ) );

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

    private Map<String, Object> buildLinkProjection( String id, String linkRef, String uri, String download )
    {
        final Map<String, Object> projection = new LinkedHashMap<>();

        projection.put( "contentId", download != null ? null : id ); // only for content
        projection.put( "linkRef", linkRef );
        projection.put( "uri", uri );

        if ( download != null )
        {
            Map<String, Object> mediaAsMap = new LinkedHashMap<>();
            mediaAsMap.put( "intent", download );
            mediaAsMap.put( "contentId", id );
            projection.put( "media", mediaAsMap ); // only for media
        }

        return projection;
    }

    private Map<String, Object> buildImageProjection( final String id, final String imgEditorRef, final ImageStyle imageStyle )
    {
        final Map<String, Object> imageProjection = new LinkedHashMap<>();

        imageProjection.put( "imageId", id );
        imageProjection.put( "imageRef", imgEditorRef );

        final Map<String, Object> styleProjection = new LinkedHashMap<>();

        if ( imageStyle != null )
        {
            styleProjection.put( "name", imageStyle.getName() );
            styleProjection.put( "aspectRatio", imageStyle.getAspectRatio() );
            styleProjection.put( "filter", imageStyle.getFilter() );

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
