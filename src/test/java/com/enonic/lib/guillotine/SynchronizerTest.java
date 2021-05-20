package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class SynchronizerTest
    extends ScriptTestSupport
{
    @Test
    public void testSync()
    {
        runFunction( "lib/sync-test.js", "sync" );
    }
}
