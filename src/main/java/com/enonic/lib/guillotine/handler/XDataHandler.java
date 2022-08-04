package com.enonic.lib.guillotine.handler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.mapper.XDatasMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.schema.xdata.XDataService;
import com.enonic.xp.schema.xdata.XDatas;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class XDataHandler
    implements ScriptBean
{
    private Supplier<XDataService> xDataServiceSupplier;

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.xDataServiceSupplier = beanContext.getService( XDataService.class );
    }

    public XDatasMapper getXDataByApplicationKeys( List<String> applicationKeys )
    {
        final List<ApplicationKey> appKeys = applicationKeys.stream().map( ApplicationKey::from ).collect( Collectors.toList() );
        appKeys.add( ApplicationKey.BASE );
        appKeys.add( ApplicationKey.MEDIA_MOD );

        final Map<ApplicationKey, XDatas> xDatasMap = new HashMap<>();
        appKeys.forEach( applicationKey -> {
            final XDatas xDatas = xDataServiceSupplier.get().getByApplication( applicationKey );
            if (xDatas.isNotEmpty()) {
                xDatasMap.put( applicationKey, xDatas );
            }
        } );

        return new XDatasMapper( xDatasMap );
    }
}
