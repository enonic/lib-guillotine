package com.enonic.lib.guillotine.mapper;

import com.enonic.xp.schema.xdata.XData;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class XDataMapper
    extends FormDescriptorMapperBase
    implements MapSerializable
{
    private final XData xData;

    public XDataMapper( final XData xData )
    {
        this.xData = xData;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "applicationKey", xData.getName().getApplicationKey() );
        gen.value( "name", xData.getName().getLocalName() );
        serializeForm( gen, xData.getForm() );
    }
}
