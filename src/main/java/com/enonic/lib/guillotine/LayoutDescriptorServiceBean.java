package com.enonic.lib.guillotine;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.mapper.ComponentDescriptorMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.region.LayoutDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class LayoutDescriptorServiceBean
    implements ScriptBean
{

    private Supplier<LayoutDescriptorService> layoutDescriptorServiceSupplier;

    public List<ComponentDescriptorMapper> getByApplication( final String applicationKey )
    {
        return layoutDescriptorServiceSupplier.get().getByApplication( ApplicationKey.from( applicationKey ) ).
            stream().
            map( layoutDescriptor -> new ComponentDescriptorMapper( layoutDescriptor ) ).
            collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.layoutDescriptorServiceSupplier = context.getService( LayoutDescriptorService.class );
    }
}
