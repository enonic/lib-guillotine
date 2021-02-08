package com.enonic.lib.guillotine.handler;

import java.util.function.Supplier;

import com.enonic.xp.content.ContentId;
import com.enonic.xp.lib.content.mapper.ContentMapper;
import com.enonic.xp.page.GetDefaultPageTemplateParams;
import com.enonic.xp.page.PageTemplate;
import com.enonic.xp.page.PageTemplateService;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class GetDefaultPageTemplateBean
    implements ScriptBean
{

    private Supplier<PageTemplateService> pageTemplateService;

    private ContentTypeName contentType;

    private ContentId siteId;

    public void setContentType( final String contentType )
    {
        this.contentType = ContentTypeName.from( contentType );
    }

    public void setSiteId( final String siteId )
    {
        this.siteId = ContentId.from( siteId );
    }

    public ContentMapper execute()
    {
        final GetDefaultPageTemplateParams params = GetDefaultPageTemplateParams.create().
            contentType( contentType ).
            site( siteId ).
            build();
        final PageTemplate defaultPageTemplate = pageTemplateService.get().getDefault( params );
        return defaultPageTemplate == null ? null : new ContentMapper( defaultPageTemplate );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.pageTemplateService = context.getService( PageTemplateService.class );
    }
}
