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
        gen.value( "raw", htmlAreaResult.getRaw() );
        gen.value( "markup", htmlAreaResult.getMarkup() );

        gen.array( "macrosAsJson" );
        if ( htmlAreaResult.getMacrosAsJson() != null )
        {
            htmlAreaResult.getMacrosAsJson().forEach( gen::value );
        }
        gen.end();

        gen.map( "macros" );
        if ( htmlAreaResult.getMacros() != null )
        {
            htmlAreaResult.getMacros().forEach( gen::value );
        }
        gen.end();
    }
}
