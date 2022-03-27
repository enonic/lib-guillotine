package com.enonic.lib.guillotine.macro;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;
import com.enonic.xp.portal.url.AttachmentUrlParams;
import com.enonic.xp.portal.url.ImageUrlParams;
import com.enonic.xp.portal.url.PageUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.site.SiteConfig;
import com.enonic.xp.site.SiteConfigs;
import com.enonic.xp.style.ImageStyle;
import com.enonic.xp.style.StyleDescriptor;
import com.enonic.xp.style.StyleDescriptorService;
import com.enonic.xp.style.StyleDescriptors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class HtmlLinkProcessorTest
{
    @Test
    public void test()
    {
        StyleDescriptorService styleDescriptorService = Mockito.mock( StyleDescriptorService.class );
        PortalUrlService portalUrlService = Mockito.mock( PortalUrlService.class );

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( StyleDescriptors.empty() );
        when( portalUrlService.imageUrl( any( ImageUrlParams.class ) ) ).thenReturn( "imageUrl" );

        HtmlLinkProcessor instance = new HtmlLinkProcessor( styleDescriptorService, portalUrlService );

        String result = instance.process( "" + "<figure class=\"editor-style-image-cinema\">" +
                                              "<img alt=\"matrix.jpg\" src=\"image://content-id?style=editor-style-image-cinema\" />" +
                                              "<figcaption>Caption</figcaption>" + "</figure>", "server", createPortalRequest(),
                                          Arrays.asList( 760, 1024 ), "(max-width: 1024px) 760px", image -> {
            }, link -> {
            } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" src=\"imageUrl\" data-image-ref=" ) );
        assertTrue( result.contains( "srcset=\"imageUrl 760w,imageUrl 1024w\"" ) );
        assertTrue( result.contains( "sizes=\"(max-width: 1024px) 760px\"" ) );

        result = instance.process( "" + "<figure class=\"editor-style-image-cinema\">" +
                                       "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"image://content-id?style=editor-style-image-cinema\" />" +
                                       "<figcaption>Caption</figcaption>" + "</figure>", "server", createPortalRequest(),
                                   Arrays.asList( 1024, 2048 ), "(max-width: 1024px) 1024px", image -> {
            }, link -> {
            } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"imageUrl\" data-image-ref=" ) );
        assertTrue( result.contains( "srcset=\"imageUrl 1024w,imageUrl 2048w\"" ) );
        assertTrue( result.contains( "sizes=\"(max-width: 1024px) 1024px\"" ) );

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn(
            StyleDescriptors.from( StyleDescriptor.create().
                addStyleElement( ImageStyle.create().
                    name( "editor-style-image-cinema" ).
                    aspectRatio( "16:9" ).
                    build() ).
                application( ApplicationKey.from( "myapp" ) ).
                build() ) );

        result = instance.process( "" + "<figure class=\"editor-style-image-cinema\">" +
                                       "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"image://content-id?style=editor-style-image-cinema\" />" +
                                       "<figcaption>Caption</figcaption>" + "</figure>", "server", createPortalRequest(), null, null,
                                   image -> {
                                   }, link -> {
            } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"imageUrl\" data-image-ref=" ) );
        assertFalse( result.contains( "srcset=" ) );
        assertFalse( result.contains( "sizes=" ) );
    }

    @Test
    public void testProcessOriginalImage()
    {
        StyleDescriptorService styleDescriptorService = Mockito.mock( StyleDescriptorService.class );
        PortalUrlService portalUrlService = Mockito.mock( PortalUrlService.class );

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( StyleDescriptors.empty() );
        when( portalUrlService.attachmentUrl( any( AttachmentUrlParams.class ) ) ).thenReturn( "imageUrl" );

        HtmlLinkProcessor instance = new HtmlLinkProcessor( styleDescriptorService, portalUrlService );

        String result = instance.process(
            "<figure class=\"captioned editor-align-justify editor-style-original\"><img alt=\"the-dark-knight.jpg\" src=\"media://content-id\" style=\"width:100%\" />\n" +
                "<figcaption>Original</figcaption></figure>", "server", createPortalRequest(), null, null, image -> {
            }, link -> {
            } );

        assertTrue( result.contains( "<img alt=\"the-dark-knight.jpg\" src=\"imageUrl\" data-image-ref=" ) );
    }

    @Test
    public void testProcessingMediaLinks()
    {
        String html =
            "<p><a href=\"content://a8b374a2-c532-45eb-9aa1-73d1c37cd681\" target=\"_blank\" title=\"Tooltip\">Text 1</a></p>\n\n<p><a href=\"media://download/09b3af0e-6da3-4bcf-88d9-11cbe9c41283\" title=\"media tooltip\">media text</a></p>";

        StyleDescriptorService styleDescriptorService = Mockito.mock( StyleDescriptorService.class );
        PortalUrlService portalUrlService = Mockito.mock( PortalUrlService.class );

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( StyleDescriptors.empty() );
        when( portalUrlService.pageUrl( any( PageUrlParams.class ) ) ).thenReturn( "generatedContentUrl" );
        when( portalUrlService.attachmentUrl( any( AttachmentUrlParams.class ) ) ).thenReturn( "generatedMediaUrl" );

        HtmlLinkProcessor instance = new HtmlLinkProcessor( styleDescriptorService, portalUrlService );

        final List<Map<String, Object>> links = new ArrayList<>();

        instance.process( html, "server", createPortalRequest(), null, null, image -> {
        }, links::add );

        assertEquals( 2, links.size() );
        assertEquals( "content://a8b374a2-c532-45eb-9aa1-73d1c37cd681", links.get( 0 ).get( "uri" ) );
        assertEquals( "a8b374a2-c532-45eb-9aa1-73d1c37cd681", links.get( 0 ).get( "contentId" ) );
        assertNotNull( links.get( 0 ).get( "linkRef" ) );
        assertNull( links.get( 0 ).get( "media" ) );

        assertEquals( "media://download/09b3af0e-6da3-4bcf-88d9-11cbe9c41283", links.get( 1 ).get( "uri" ) );
        assertNull( links.get( 1 ).get( "contentId" ) );
        assertNotNull( links.get( 1 ).get( "linkRef" ) );
        assertNotNull( links.get( 1 ).get( "media" ) );
    }

    private PortalRequest createPortalRequest()
    {
        PortalRequest request = new PortalRequest();

        request.setMode( RenderMode.LIVE );
        request.setBranch( Branch.from( "draft" ) );
        request.setApplicationKey( ApplicationKey.from( "myapp" ) );
        request.setBaseUri( "/site" );
        request.setSite( Site.create().
            name( "site" ).
            parentPath( ContentPath.ROOT ).
            language( Locale.ENGLISH ).
            siteConfigs( SiteConfigs.create().
                add( SiteConfig.create().
                    application( ApplicationKey.from( "myapp" ) ).
                    config( new PropertyTree() ).
                    build() ).
                build() ).
            build() );

        return request;
    }
}
