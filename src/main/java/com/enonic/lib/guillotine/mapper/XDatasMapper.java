package com.enonic.lib.guillotine.mapper;

import java.util.Map;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.schema.xdata.XDatas;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class XDatasMapper
    implements MapSerializable
{
    private final Map<ApplicationKey, XDatas> xDatasMap;

    public XDatasMapper( final Map<ApplicationKey, XDatas> xDatasMap )
    {
        this.xDatasMap = xDatasMap;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        xDatasMap.forEach( ( applicationKey, xDatas ) -> {
            gen.array( applicationKey.getName() );
            xDatas.forEach( xData -> {
                gen.map();
                new XDataMapper( xData ).serialize( gen );
                gen.end();
            } );
            gen.end();
        } );
    }
}
