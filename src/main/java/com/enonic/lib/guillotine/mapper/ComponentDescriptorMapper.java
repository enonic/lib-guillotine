package com.enonic.lib.guillotine.mapper;

import com.enonic.xp.region.ComponentDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class ComponentDescriptorMapper
    extends FormDescriptorMapperBase
    implements MapSerializable
{
    private final ComponentDescriptor componentDescriptor;

    public ComponentDescriptorMapper( final ComponentDescriptor componentDescriptor )
    {
        this.componentDescriptor = componentDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "applicationKey", componentDescriptor.getKey().getApplicationKey() );
        gen.value( "name", componentDescriptor.getKey().getName() );
        serializeForm( gen, componentDescriptor.getConfig() );
    }
}
