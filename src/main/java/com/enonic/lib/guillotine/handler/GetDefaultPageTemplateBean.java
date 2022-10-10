package com.enonic.lib.guillotine.handler;

import java.util.concurrent.Callable;
import java.util.function.Supplier;

import com.enonic.xp.content.ContentId;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.lib.content.mapper.ContentMapper;
import com.enonic.xp.page.GetDefaultPageTemplateParams;
import com.enonic.xp.page.PageTemplate;
import com.enonic.xp.page.PageTemplateService;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.site.Site;

public class GetDefaultPageTemplateBean
    implements ScriptBean
{

    private Supplier<PageTemplateService> pageTemplateService;

    private Supplier<ContentService> contentService;

    private ContentTypeName contentType;

    private String contentId;

    public void setContentType( final String contentType )
    {
        this.contentType = ContentTypeName.from( contentType );
    }

    public void setContentId( final String contentId )
    {
        this.contentId = contentId;
    }

    public ContentMapper execute()
    {
        return callAsContentAdmin( () -> {
            final Site nearestSite = contentService.get().getNearestSite( ContentId.from( contentId ) );

            if ( nearestSite != null )
            {
                final GetDefaultPageTemplateParams params =
                    GetDefaultPageTemplateParams.create().contentType( contentType ).site( nearestSite.getId() ).build();
                final PageTemplate defaultPageTemplate = pageTemplateService.get().getDefault( params );
                return defaultPageTemplate == null ? null : new ContentMapper( defaultPageTemplate );
            }
            return null;

        } );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.pageTemplateService = context.getService( PageTemplateService.class );
        this.contentService = context.getService( ContentService.class );
    }

    private <T> T callAsContentAdmin( final Callable<T> callable )
    {
        final Context context = ContextAccessor.current();
        return ContextBuilder.from( context ).authInfo(
            AuthenticationInfo.copyOf( context.getAuthInfo() ).principals( RoleKeys.CONTENT_MANAGER_ADMIN ).build() ).build().callWith(
            callable );
    }
}
