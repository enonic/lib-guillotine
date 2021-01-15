package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class NamingTest
    extends ScriptTestSupport
{
    @Test
    public void testNaming()
    {
        runFunction( "lib/naming-test.js", "testNaming" );
    }
}
