package com.enonic.lib.guillotine.macro;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.enonic.xp.macro.Macro;

class MacroEditorSerializerTest
{
    @Test
    void testSerialize()
    {
        final MacroDecorator macroDecorator = MacroDecorator.from( Macro.create().
            name( "mymacro" ).
            param( "attr1", "val1" ).
            body( "Body" ).
            build(), "nodeId" );
        MacroEditorSerializer instance = new MacroEditorSerializer( macroDecorator );

        String expected = "<editor-macro data-macro-name=\"mymacro\" data-macro-ref=\"" + macroDecorator.getId() + "\">Body</editor-macro>";

        Assertions.assertEquals( expected, instance.serialize() );
    }
}
