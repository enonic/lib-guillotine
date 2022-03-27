package com.enonic.lib.guillotine.mapper;

import com.enonic.lib.guillotine.macro.HtmlEditorProcessedResult;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class HtmlEditorResultMapper
    implements MapSerializable
{
    private final HtmlEditorProcessedResult htmlEditorResult;

    public HtmlEditorResultMapper( final HtmlEditorProcessedResult htmlMacrosResult )
    {
        this.htmlEditorResult = htmlMacrosResult;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "raw", htmlEditorResult.getRaw() );
        gen.value( "processedHtml", htmlEditorResult.getProcessedHtml() );

        gen.array( "macrosAsJson" );
        if ( htmlEditorResult.getMacrosAsJson() != null )
        {
            htmlEditorResult.getMacrosAsJson().forEach( gen::value );
        }
        gen.end();

        gen.array( "images" );
        if ( htmlEditorResult.getImages() != null )
        {
            htmlEditorResult.getImages().forEach( gen::value );
        }
        gen.end();

        gen.array( "links" );
        if ( htmlEditorResult.getLinks() != null )
        {
            htmlEditorResult.getLinks().forEach( gen::value );
        }
        gen.end();
    }
}
