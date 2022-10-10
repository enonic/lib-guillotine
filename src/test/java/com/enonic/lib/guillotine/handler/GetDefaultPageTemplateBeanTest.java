package com.enonic.lib.guillotine.handler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.lib.content.mapper.ContentMapper;
import com.enonic.xp.page.GetDefaultPageTemplateParams;
import com.enonic.xp.page.PageTemplate;
import com.enonic.xp.page.PageTemplateService;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.site.Site;
import com.enonic.xp.testing.mock.MockBeanContext;
import com.enonic.xp.testing.mock.MockServiceRegistry;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class GetDefaultPageTemplateBeanTest
{
    private MockServiceRegistry serviceRegistry;

    private ContentService contentService;

    private PageTemplateService pageTemplateService;

    private MockBeanContext newBeanContext( final ResourceKey key )
    {
        return new MockBeanContext( key, this.serviceRegistry );
    }

    @BeforeEach
    public void setUp()
    {
        this.contentService = mock( ContentService.class );
        this.pageTemplateService = mock( PageTemplateService.class );
        this.serviceRegistry = new MockServiceRegistry();
        serviceRegistry.register( ContentService.class, this.contentService );
        serviceRegistry.register( PageTemplateService.class, this.pageTemplateService );
    }

    @Test
    public void testExecute()
    {
        GetDefaultPageTemplateBean instance = new GetDefaultPageTemplateBean();
        instance.initialize( newBeanContext( ResourceKey.from( "app-guillotine:/test" ) ) );

        Site site = Site.create().id( ContentId.from( "siteId" ) ).name( "site" ).parentPath( ContentPath.ROOT ).build();

        PageTemplate pageTemplate = PageTemplate.newPageTemplate().id( ContentId.from( "templateId" ) ).name( "default" ).parentPath(
            ContentPath.from( ContentPath.ROOT, "templates" ) ).build();

        when( contentService.getNearestSite( any( ContentId.class ) ) ).thenReturn( site );
        when( pageTemplateService.getDefault( any( GetDefaultPageTemplateParams.class ) ) ).thenReturn( pageTemplate );

        instance.setContentId( "contentId" );
        instance.setContentType( "app-guillotine:contentType" );

        ContentMapper contentMapper = instance.execute();

        assertNotNull( contentMapper );
    }
}
