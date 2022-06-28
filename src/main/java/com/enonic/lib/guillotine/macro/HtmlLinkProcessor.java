package com.enonic.lib.guillotine.macro;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.html.HtmlEscapers;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.AttachmentUrlParams;
import com.enonic.xp.portal.url.ImageUrlParams;
import com.enonic.xp.portal.url.PageUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.style.ImageStyle;
import com.enonic.xp.style.StyleDescriptorService;
import com.enonic.xp.style.StyleDescriptors;

public class HtmlLinkProcessor
{
    private static final ApplicationKey SYSTEM_APPLICATION_KEY = ApplicationKey.from( "com.enonic.xp.app.system" );

    /*
     * Pattern Constants
     */

    private static final int MATCH_INDEX = 1;

    private static final int TAG_NAME_INDEX = MATCH_INDEX + 1;

    private static final int ATTR_INDEX = TAG_NAME_INDEX + 1;

    private static final int ATTR_VALUE_INDEX = ATTR_INDEX + 1;

    private static final int LINK_INDEX = ATTR_VALUE_INDEX + 1;

    private static final int TYPE_INDEX = LINK_INDEX + 1;

    private static final int MODE_INDEX = TYPE_INDEX + 1;

    private static final int ID_INDEX = MODE_INDEX + 1;

    private static final int PARAMS_INDEX = ID_INDEX + 1;

    private static final int NB_GROUPS = ID_INDEX;

    private static final String CONTENT_TYPE = "content";

    private static final String MEDIA_TYPE = "media";

    private static final String IMAGE_TYPE = "image";

    private static final String DOWNLOAD_MODE = "download";

    private static final String INLINE_MODE = "inline";

    /*
     * Parameters Keys
     */

    private static final String SCALE_PARAM = "scale";

    private static final String STYLE_PARAM = "style";

    /*
     * Default Values
     */

    private static final String IMAGE_SCALE = "width(768)";

    private static final int DEFAULT_WIDTH = 768;

    private static final Pattern CONTENT_PATTERN = Pattern.compile(
        "(<(\\w+)[^>]+?(href|src)=(\"((" + CONTENT_TYPE + "|" + MEDIA_TYPE + "|" + IMAGE_TYPE + ")://(?:(" + DOWNLOAD_MODE + "|" +
            INLINE_MODE + ")/)?([0-9a-z-/]+)(\\?[^\"]+)?)\"))", Pattern.MULTILINE | Pattern.UNIX_LINES );

    private static final Pattern ASPECT_RATIO_PATTEN = Pattern.compile( "^(?<horizontalProportion>\\d+):(?<verticalProportion>\\d+)$" );

    private static final int[] QUERY_OR_FRAGMENT_ALLOWED_CHARACTERS =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ?/:@-._~!$&'()*+,;=%".chars().sorted().toArray();

    private final StyleDescriptorService styleDescriptorService;

    private final PortalUrlService portalUrlService;

    public HtmlLinkProcessor( final StyleDescriptorService styleDescriptorService, final PortalUrlService portalUrlService )
    {
        this.styleDescriptorService = styleDescriptorService;
        this.portalUrlService = portalUrlService;
    }

    public String process( final String text, final String urlType, final PortalRequest portalRequest, final List<Integer> imageWidths,
                           final String imageSizes, final Consumer<Map<String, Object>> imageConsumer,
                           final Consumer<Map<String, Object>> linkConsumer )
    {
        String processedHtml = text;
        final ImmutableMap<String, ImageStyle> imageStyleMap = getImageStyleMap( portalRequest );
        final Matcher contentMatcher = CONTENT_PATTERN.matcher( text );

        while ( contentMatcher.find() )
        {
            if ( contentMatcher.groupCount() >= NB_GROUPS )
            {
                final String tagName = contentMatcher.group( TAG_NAME_INDEX );
                final String attr = contentMatcher.group( ATTR_INDEX );
                final String attrValue = contentMatcher.group( ATTR_VALUE_INDEX );
                final String link = contentMatcher.group( LINK_INDEX );
                final String type = contentMatcher.group( TYPE_INDEX );
                final String mode = contentMatcher.group( MODE_INDEX );
                final String id = contentMatcher.group( ID_INDEX );
                final String urlParamsString = contentMatcher.groupCount() == PARAMS_INDEX ? contentMatcher.group( PARAMS_INDEX ) : null;

                switch ( type )
                {
                    case CONTENT_TYPE:
                    {
                        PageUrlParams pageUrlParams = new PageUrlParams().
                            type( urlType ).
                            id( id ).
                            portalRequest( portalRequest );

                        final String pageUrl = HtmlEscapers.htmlEscaper().escape(
                            addQueryParamsIfPresent( portalUrlService.pageUrl( pageUrlParams ), urlParamsString ) );

                        final StringBuilder replacement = new StringBuilder( "\"" + pageUrl + "\"" );

                        if ( "a".equals( tagName ) )
                        {
                            final String linkEditorRef = UUID.randomUUID().toString();

                            replacement.append( " data-link-ref=\"" ).append( linkEditorRef ).append( "\"" );

                            linkConsumer.accept( buildLinkProjection( id, linkEditorRef, link, mode ) );
                        }

                        processedHtml = processedHtml.replaceFirst( Pattern.quote( attrValue ), replacement.toString() );
                        break;
                    }
                    case IMAGE_TYPE:
                    {
                        final Map<String, String> urlParams = extractUrlParams( urlParamsString );

                        ImageStyle imageStyle = getImageStyle( imageStyleMap, urlParams );

                        ImageUrlParams imageUrlParams = new ImageUrlParams().
                            type( urlType ).
                            id( id ).
                            scale( getScale( imageStyle, urlParams, null ) ).
                            filter( getFilter( imageStyle ) ).
                            portalRequest( portalRequest );

                        final String imageUrl = portalUrlService.imageUrl( imageUrlParams );

                        final StringBuilder replacement = new StringBuilder( "\"" + imageUrl + "\"" );

                        if ( "img".equals( tagName ) && "src".equals( attr ) )
                        {
                            final String srcsetValues =
                                Objects.requireNonNullElse( imageWidths, List.<Integer>of() ).stream().map( imageWidth -> {
                                    final ImageUrlParams imageParams = new ImageUrlParams().
                                        type( urlType ).
                                        id( id ).
                                        scale( getScale( imageStyle, urlParams, imageWidth ) ).
                                        filter( getFilter( imageStyle ) ).
                                        portalRequest( portalRequest );

                                    return portalUrlService.imageUrl( imageParams ) + " " + imageWidth + "w";
                                } ).collect( Collectors.joining( "," ) );

                            final String imgEditorRef = UUID.randomUUID().toString();

                            replacement.append( " data-image-ref=\"" ).append( imgEditorRef ).append( "\"" );

                            if ( !srcsetValues.isEmpty() )
                            {
                                replacement.append( " srcset=\"" ).append( srcsetValues ).append( "\"" );
                            }

                            if ( imageSizes != null && !imageSizes.isBlank() )
                            {
                                replacement.append( " sizes=\"" ).append( imageSizes ).append( "\"" );
                            }

                            imageConsumer.accept( buildStyleProjection( id, imgEditorRef, imageStyle ) );
                        }

                        processedHtml = processedHtml.replaceFirst( Pattern.quote( attrValue ), replacement.toString() );
                        break;
                    }
                    default:
                    {
                        AttachmentUrlParams attachmentUrlParams = new AttachmentUrlParams().
                            type( urlType ).
                            id( id ).
                            download( DOWNLOAD_MODE.equals( mode ) ).
                            portalRequest( portalRequest );

                        final String attachmentUrl = portalUrlService.attachmentUrl( attachmentUrlParams );

                        final StringBuilder replacement = new StringBuilder( "\"" + attachmentUrl + "\"" );

                        if ( "a".equals( tagName ) )
                        {
                            final String linkEditorRef = UUID.randomUUID().toString();

                            replacement.append( " data-link-ref=\"" ).append( linkEditorRef ).append( "\"" );

                            linkConsumer.accept( buildLinkProjection( id, linkEditorRef, link, mode ) );
                        }
                        else if ( "img".equals( tagName ) && "src".equals( attr ) )
                        {
                            final String imgEditorRef = UUID.randomUUID().toString();

                            replacement.append( " data-image-ref=\"" ).append( imgEditorRef ).append( "\"" );

                            imageConsumer.accept( buildStyleProjection( id, imgEditorRef, imageStyleMap.get( "editor-style-original" ) ) );
                        }

                        processedHtml = processedHtml.replaceFirst( Pattern.quote( attrValue ), replacement.toString() );
                        break;
                    }
                }
            }
        }
        return processedHtml;
    }

    private Map<String, Object> buildStyleProjection( final String id, final String imgEditorRef, final ImageStyle imageStyle )
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

    private ImmutableMap<String, ImageStyle> getImageStyleMap( final PortalRequest portalRequest )
    {
        final ImmutableMap.Builder<String, ImageStyle> imageStyleMap = ImmutableMap.builder();
        final StyleDescriptors styleDescriptors = getStyleDescriptors( portalRequest );
        styleDescriptors.stream().
            flatMap( styleDescriptor -> styleDescriptor.getElements().stream() ).
            filter( elementStyle -> ImageStyle.STYLE_ELEMENT_NAME.equals( elementStyle.getElement() ) ).
            forEach( elementStyle -> imageStyleMap.put( elementStyle.getName(), (ImageStyle) elementStyle ) );
        return imageStyleMap.build();
    }

    private StyleDescriptors getStyleDescriptors( final PortalRequest portalRequest )
    {
        final ImmutableList.Builder<ApplicationKey> applicationKeyList = new ImmutableList.Builder<ApplicationKey>().
            add( SYSTEM_APPLICATION_KEY );
        if ( portalRequest != null )
        {
            final Site site = portalRequest.getSite();
            if ( site != null )
            {
                final ImmutableSet<ApplicationKey> siteApplicationKeySet = site.getSiteConfigs().getApplicationKeys();
                applicationKeyList.addAll( siteApplicationKeySet );
            }
        }

        final ApplicationKeys applicationKeys = ApplicationKeys.from( applicationKeyList.build() );
        return styleDescriptorService.getByApplications( applicationKeys );
    }

    private ImageStyle getImageStyle( final Map<String, ImageStyle> imageStyleMap, final Map<String, String> urlParams )
    {
        final String styleString = urlParams.get( STYLE_PARAM );
        if ( styleString != null )
        {
            return imageStyleMap.get( styleString );
        }
        return null;
    }

    private String getScale( final ImageStyle imageStyle, final Map<String, String> urlParams, final Integer expectedWidth )
    {
        final String aspectRatio = getAspectRation( imageStyle, urlParams );

        if ( aspectRatio != null )
        {
            final Matcher matcher = ASPECT_RATIO_PATTEN.matcher( aspectRatio );
            if ( !matcher.matches() )
            {
                throw new IllegalArgumentException( "Invalid aspect ratio: " + aspectRatio );
            }
            final String horizontalProportion = matcher.group( "horizontalProportion" );
            final String verticalProportion = matcher.group( "verticalProportion" );

            final int width = Objects.requireNonNullElse( expectedWidth, DEFAULT_WIDTH );
            final int height = width / Integer.parseInt( horizontalProportion ) * Integer.parseInt( verticalProportion );

            return "block(" + width + "," + height + ")";
        }

        return expectedWidth != null ? "width(" + expectedWidth + ")" : IMAGE_SCALE;
    }

    private String getFilter( final ImageStyle imageStyle )
    {
        return imageStyle == null ? null : imageStyle.getFilter();
    }

    private String getAspectRation( final ImageStyle imageStyle, final Map<String, String> urlParams )
    {
        if ( imageStyle != null )
        {
            final String aspectRatio = imageStyle.getAspectRatio();
            if ( aspectRatio != null )
            {
                return aspectRatio;
            }
        }
        return urlParams.get( SCALE_PARAM );
    }

    private Map<String, String> extractUrlParams( final String urlQuery )
    {
        if ( urlQuery == null )
        {
            return Collections.emptyMap();
        }
        final String query = urlQuery.startsWith( "?" ) ? urlQuery.substring( 1 ) : urlQuery;
        return Splitter.on( '&' ).
            trimResults().
            withKeyValueSeparator( "=" ).
            split( query.replace( "&amp;", "&" ) );
    }

    private String addQueryParamsIfPresent( final String url, final String urlQuery )
    {
        if ( urlQuery == null )
        {
            return url;
        }
        final String query = urlQuery.startsWith( "?" ) ? urlQuery.substring( 1 ) : urlQuery;

        final StringBuilder urlSuffix = new StringBuilder();
        final Map<String, String> queryParamsAsMap = extractUrlParams( query );

        addComponentToUrlIfValid( queryParamsAsMap.get( "query" ), "?", urlSuffix );
        addComponentToUrlIfValid( queryParamsAsMap.get( "fragment" ), "#", urlSuffix );

        return url + urlSuffix.toString();
    }

    private void addComponentToUrlIfValid( final String value, final String mark, final StringBuilder builder )
    {
        if ( value == null )
        {
            return;
        }
        final String decodedValue = URLDecoder.decode( value, StandardCharsets.UTF_8 );
        if ( decodedValue.chars().allMatch( ch -> Arrays.binarySearch( QUERY_OR_FRAGMENT_ALLOWED_CHARACTERS, ch ) >= 0 ) )
        {
            builder.append( mark ).append( decodedValue );
        }
    }

}
