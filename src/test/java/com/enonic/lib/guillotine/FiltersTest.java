package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class FiltersTest
    extends ScriptTestSupport
{
    @Test
    public void testExistsFilter()
    {
        runFunction( "lib/factory-filters-test.js", "testCreateHasValueFilter" );
    }

    @Test
    public void testCreateHasValueFilter_Failed()
    {
        runFunction( "lib/factory-filters-test.js", "testCreateHasValueFilter_Failed" );
    }

    @Test
    public void testComplexFilter()
    {
        runFunction( "lib/factory-filters-test.js", "testComplexFilter" );
    }

    @Test
    public void testBooleanShouldFilter()
    {
        runFunction( "lib/factory-filters-test.js", "testBooleanShouldFilter" );
    }
}
