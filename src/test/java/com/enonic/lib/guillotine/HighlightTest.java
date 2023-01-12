package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class HighlightTest
    extends ScriptTestSupport
{
    @Test
    public void testHighlight()
    {
        runFunction( "lib/factory-highlight-test.js", "testHighlight" );
    }

    @Test
    public void testInvalidHighlight()
    {
        runFunction( "lib/validation-test.js", "testInvalidHighlight" );
    }
}
