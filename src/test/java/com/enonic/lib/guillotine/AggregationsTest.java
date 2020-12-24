package com.enonic.lib.guillotine;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

public class AggregationsTest
    extends ScriptTestSupport
{
    @Test
    public void testCreateTermsAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateTermsAggregation" );
    }

    @Test
    public void testCreateStatsAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateStatsAggregation" );
    }

    @Test
    public void testCreateNumberRangeAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateNumberRangeAggregation" );
    }

    @Test
    public void testCreateDateRangeAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateDateRangeAggregation" );
    }

    @Test
    public void testCreateDateHistogramAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateDateHistogramAggregation" );
    }

    @Test
    public void testCreateGeoDistanceAggregation()
    {
        runFunction( "lib/factory-aggregations-test.js", "testCreateGeoDistanceAggregation" );
    }

}
