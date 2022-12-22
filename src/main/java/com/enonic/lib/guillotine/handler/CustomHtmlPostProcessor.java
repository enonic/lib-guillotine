package com.enonic.lib.guillotine.handler;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.enonic.xp.portal.html.HtmlElement;
import com.enonic.xp.portal.url.HtmlElementPostProcessor;

class CustomHtmlPostProcessor
    implements HtmlElementPostProcessor
{
    private final List<Map<String, Object>> links;

    private final List<Map<String, Object>> images;

    CustomHtmlPostProcessor( final List<Map<String, Object>> links, final List<Map<String, Object>> images )
    {
        this.links = links;
        this.images = images;
    }

    @Override
    public void process( final HtmlElement element, final Map<String, String> properties )
    {
        if ( "a".equals( element.getTagName() ) )
        {
            final String linkEditorRef = UUID.randomUUID().toString();
            element.setAttribute( "data-link-ref", linkEditorRef );
            links.add( buildLinkProjection( linkEditorRef, properties ) );
        }
        if ( "img".equals( element.getTagName() ) )
        {
            final String imgEditorRef = UUID.randomUUID().toString();
            element.setAttribute( "data-image-ref", imgEditorRef );
            images.add( buildImageProjection( imgEditorRef, properties ) );
        }
    }

    private Map<String, Object> buildLinkProjection( String linkRef, Map<String, String> properties )
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

    public List<Map<String, Object>> getLinks()
    {
        return links;
    }

    public List<Map<String, Object>> getImages()
    {
        return images;
    }
}
