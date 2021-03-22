package com.enonic.lib.guillotine.mapper;

import java.util.Collections;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;

import com.enonic.lib.guillotine.macro.HtmlEditorProcessedResult;
import com.enonic.lib.guillotine.macro.MacroDecorator;
import com.enonic.lib.guillotine.macro.MacroEditorJsonSerializer;
import com.enonic.xp.macro.Macro;
import com.enonic.xp.script.serializer.JsonMapGenerator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HtmlEditorResultMapperTest
{
    @Test
    void serialize()
    {
        Map<String, Object> macroResult = new MacroEditorJsonSerializer( MacroDecorator.from( Macro.create().
            name( "mymacro" ).
            param( "attr1", "val1" ).
            param( "attr2", "val2" ).
            build() ) ).serialize();

        HtmlEditorProcessedResult input = HtmlEditorProcessedResult.create().
            setProcessedHtml(
                "<p><editor-macro data-macro-name=\"mymacro\" data-macro-ref=\"307f02a2-7019-4012-807e-916df5779ae6\"></editor-macro></p>" ).
            setMacrosAsJson( Collections.singletonList( macroResult ) ).
            build();

        HtmlEditorResultMapper instance = new HtmlEditorResultMapper( input );

        JsonMapGenerator generator = new JsonMapGenerator();

        instance.serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        assertNotNull( actualJson );
        assertEquals(
            "<p><editor-macro data-macro-name=\"mymacro\" data-macro-ref=\"307f02a2-7019-4012-807e-916df5779ae6\"></editor-macro></p>",
            actualJson.path( "processedHtml" ).asText() );
        assertTrue( actualJson.path( "macrosAsJson" ).isArray() );

        JsonNode macrosAsJson = actualJson.path( "macrosAsJson" ).get( 0 );

        assertEquals( "mymacro", macrosAsJson.path( "macroName" ).asText() );

        assertTrue( macrosAsJson.path( "attr1" ).isArray() );
        assertEquals( "val1", macrosAsJson.path( "attr1" ).get( 0 ).asText() );

        assertTrue( macrosAsJson.path( "attr2" ).isArray() );
        assertEquals( "val2", macrosAsJson.path( "attr2" ).get( 0 ).asText() );

        assertTrue( macrosAsJson.path( "body" ).asText().isEmpty() );
        assertFalse( macrosAsJson.path( "macroRef" ).asText().isEmpty() );
    }
}
