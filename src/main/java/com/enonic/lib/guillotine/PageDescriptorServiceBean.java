package com.enonic.lib.guillotine;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.mapper.ComponentDescriptorMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.page.PageDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class PageDescriptorServiceBean
    implements ScriptBean
{

    private Supplier<PageDescriptorService> pageDescriptorServiceSupplier;

    public List<ComponentDescriptorMapper> getByApplication( final String applicationKey )
    {
        return pageDescriptorServiceSupplier.get().getByApplication( ApplicationKey.from( applicationKey ) ).
            stream().
            map( pageDescriptor -> new ComponentDescriptorMapper( pageDescriptor ) ).
            collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.pageDescriptorServiceSupplier = context.getService( PageDescriptorService.class );
    }
}
