package com.enonic.lib.guillotine.macro;

import java.util.Arrays;
import java.util.Locale;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.branch.Branch;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ProcessHtmlServiceImplTest
{
    @Test
    void testProcessHtml_imageWidths()
    {
        StyleDescriptorService styleDescriptorService = Mockito.mock( StyleDescriptorService.class );
        PortalUrlService portalUrlService = Mockito.mock( PortalUrlService.class );
        MacroService macroService = Mockito.mock( MacroService.class );
        MacroDescriptorService macroDescriptorService = Mockito.mock( MacroDescriptorService.class );

        StyleDescriptors styleDescriptors = StyleDescriptors.from( StyleDescriptor.create().
            addStyleElement( ImageStyle.create().
                name( "editor-style-image-cinema" ).
                aspectRatio( "16:9" ).
                build() ).
            application( ApplicationKey.from( "myapp" ) ).
            build() );

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( styleDescriptors );
        when( macroDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( MacroDescriptors.empty() );

        ProcessHtmlServiceImpl instance =
            new ProcessHtmlServiceImpl( styleDescriptorService, portalUrlService, macroService, macroDescriptorService );

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

        ProcessHtmlParams params = new ProcessHtmlParams();
        params.setValue(
            "<p>&nbsp;</p>\n\n<figure class=\"captioned editor-align-justify editor-style-image-cinema\"><img alt=\"matrix.jpg\" " +
                "src=\"image://5f1daa61-c95f-4c41-8769-cd0103b010b2?style=editor-style-image-cinema\" />\n<figcaption><br />\nHello World" +
                "</figcaption>\n</figure>\n\n<p><a href=\"content://e45caba3-510a-467c-8a48-5d471eef4d7f\" target=\"_blank\">My Link</a></p>\n" );
        params.setType( "server" );
        params.setImageWidths( Arrays.asList( 1024, 2048 ) );
        params.setPortalRequest( request );

        HtmlEditorProcessedResult result = instance.processHtml( params );

        assertNotNull( result );
        assertNotNull( result.getImages() );
        assertFalse( result.getImages().isEmpty() );

        Map<String, Object> imageProjection = result.getImages().get( 0 );

        assertNotNull( imageProjection.get( "imageId" ) );
        assertNotNull( imageProjection.get( "imageRef" ) );
        assertNotNull( imageProjection.get( "style" ) );

        Map<String, Object> styleProjection = (Map<String, Object>) imageProjection.get( "style" );

        assertEquals( "editor-style-image-cinema", styleProjection.get( "name" ).toString() );
        assertEquals( "16:9", styleProjection.get( "aspectRatio" ).toString() );
    }
}
