package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class DslQueryTest
    extends ScriptTestSupport
{
    @Test
    public void testTermDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testTermDslExpression" );
    }

    @Test
    public void testLikeDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testLikeDslExpression" );
    }

    @Test
    public void testExistsDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testExistsDslExpression" );
    }

    @Test
    public void testPathMatchDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testPathMatchDslExpression" );
    }

    @Test
    public void testMatchAllDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testMatchAllDslExpression" );
    }

    @Test
    public void testFulltextDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testFulltextDslExpression" );
    }

    @Test
    public void testStemmedDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testStemmedDslExpression" );
    }

    @Test
    public void testNgramDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testNgramDslExpression" );
    }

    @Test
    public void testInDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testInDslExpression" );
    }

    @Test
    public void testRangeDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testRangeDslExpression" );
    }
    @Test
    public void testBooleanDslExpression()
    {
        runFunction( "lib/factory-dsl-test.js", "testBooleanDslExpression" );
    }
}
