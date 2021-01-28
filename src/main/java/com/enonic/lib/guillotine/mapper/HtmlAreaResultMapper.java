package com.enonic.lib.guillotine.mapper;

import com.enonic.lib.guillotine.macro.HtmlAreaProcessedResult;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class HtmlAreaResultMapper
    implements MapSerializable
{

    private final HtmlAreaProcessedResult htmlAreaResult;

    public HtmlAreaResultMapper( final HtmlAreaProcessedResult htmlMacrosResult )
    {
        this.htmlAreaResult = htmlMacrosResult;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "value", htmlAreaResult.getProcessedHtml() );

        if ( htmlAreaResult.getMacrosAsMap() != null )
        {
            gen.map( "macros" );

            htmlAreaResult.getMacrosAsMap().forEach( ( key, value ) -> {
                gen.map( key );
                gen.value( "macroAsHtml", value.getProcessedAsHtml() );
                gen.value( "macroAsJson", value.getProcessedAsJson() );
                gen.end();
            } );

            gen.end();
        }
    }
}
