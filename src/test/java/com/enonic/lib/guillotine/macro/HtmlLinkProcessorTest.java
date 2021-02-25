package com.enonic.lib.guillotine.macro;

import java.util.Arrays;
import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;
import com.enonic.xp.portal.url.ImageUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.site.SiteConfig;
import com.enonic.xp.site.SiteConfigs;
import com.enonic.xp.style.ImageStyle;
import com.enonic.xp.style.StyleDescriptor;
import com.enonic.xp.style.StyleDescriptorService;
import com.enonic.xp.style.StyleDescriptors;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
                                          Arrays.asList( 760, 1024 ), image -> {
            } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" src=\"imageUrl\" data-image-ref=" ) );
        assertTrue( result.contains( "srcset=\"imageUrl 760w,imageUrl 1024w\"" ) );

        result = instance.process( "" + "<figure class=\"editor-style-image-cinema\">" +
                                       "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"image://content-id?style=editor-style-image-cinema\" />" +
                                       "<figcaption>Caption</figcaption>" + "</figure>", "server", createPortalRequest(),
                                   Arrays.asList( 1024, 2048 ), image -> {
            } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"imageUrl\" data-image-ref=" ) );
        assertTrue( result.contains( "srcset=\"imageUrl 1024w,imageUrl 2048w\"" ) );

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
                                       "<figcaption>Caption</figcaption>" + "</figure>", "server", createPortalRequest(), null, image -> {
        } );

        assertTrue( result.contains( "<img alt=\"matrix.jpg\" class=\"custom-class\" src=\"imageUrl\" data-image-ref=" ) );
        assertFalse( result.contains( "srcset=" ) );
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
