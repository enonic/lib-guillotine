package com.enonic.lib.guillotine;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.mapper.ComponentDescriptorMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.region.PartDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class PartDescriptorServiceBean
    implements ScriptBean
{

    private Supplier<PartDescriptorService> partDescriptorServiceSupplier;

    public List<ComponentDescriptorMapper> getByApplication( final String applicationKey )
    {
        return partDescriptorServiceSupplier.get().getByApplication( ApplicationKey.from( applicationKey ) ).
            stream().
            map( partDescriptor -> new ComponentDescriptorMapper( partDescriptor ) ).
            collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.partDescriptorServiceSupplier = context.getService( PartDescriptorService.class );
    }
}
