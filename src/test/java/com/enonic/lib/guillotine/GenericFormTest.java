package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class GenericFormTest
    extends ScriptTestSupport
{
    @Test
    public void test()
    {
        runFunction( "lib/generic-form-test.js", "testGenerateFormItemObjectType" );
    }

}
