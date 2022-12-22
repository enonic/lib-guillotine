package com.enonic.lib.guillotine.handler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.enonic.xp.portal.html.HtmlElement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CustomHtmlPostProcessorTest
{
    CustomHtmlPostProcessor instance;

    @BeforeEach
    public void setUp()
    {
        instance = new CustomHtmlPostProcessor( new ArrayList<>(), new ArrayList<>() );
    }

    @Test
    public void testProcessLinks()
    {
        HtmlElement htmlElement = mock( HtmlElement.class );
        when( htmlElement.getTagName() ).thenReturn( "a" );

        instance.process( htmlElement, Map.of() );

        List<Map<String, Object>> links = instance.getLinks();
        assertEquals( 1, links.size() );
        assertNotNull( links.get( 0 ).get( "linkRef" ) );
    }

    @Test
    public void testProcessImages()
    {
        HtmlElement htmlElement = mock( HtmlElement.class );
        when( htmlElement.getTagName() ).thenReturn( "img" );

        instance.process( htmlElement, Map.of() );

        List<Map<String, Object>> images = instance.getImages();
        assertEquals( 1, images.size() );
        assertNotNull( images.get( 0 ).get( "imageRef" ) );
    }
}
