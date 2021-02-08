package com.enonic.lib.guillotine.mapper;

import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class MacroDescriptorMapper
    extends FormDescriptorMapperBase
    implements MapSerializable
{
    private final MacroDescriptor macroDescriptor;

    public MacroDescriptorMapper( final MacroDescriptor macroDescriptor )
    {
        this.macroDescriptor = macroDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "applicationKey", macroDescriptor.getKey().getApplicationKey() );
        gen.value( "name", macroDescriptor.getKey().getName() );
        serializeForm( gen, macroDescriptor.getForm() );
    }
}
