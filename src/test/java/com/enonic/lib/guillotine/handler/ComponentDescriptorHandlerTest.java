package com.enonic.lib.guillotine.handler;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;

import com.enonic.lib.guillotine.mapper.ComponentDescriptorMapper;
import com.enonic.lib.guillotine.mapper.MacroDescriptorMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.form.FieldSet;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.Input;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.macro.MacroKey;
import com.enonic.xp.page.DescriptorKey;
import com.enonic.xp.page.PageDescriptor;
import com.enonic.xp.page.PageDescriptorService;
import com.enonic.xp.page.PageDescriptors;
import com.enonic.xp.region.LayoutDescriptor;
import com.enonic.xp.region.LayoutDescriptorService;
import com.enonic.xp.region.LayoutDescriptors;
import com.enonic.xp.region.PartDescriptor;
import com.enonic.xp.region.PartDescriptorService;
import com.enonic.xp.region.PartDescriptors;
import com.enonic.xp.region.RegionDescriptors;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.script.serializer.JsonMapGenerator;
import com.enonic.xp.testing.mock.MockBeanContext;
import com.enonic.xp.testing.mock.MockServiceRegistry;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ComponentDescriptorHandlerTest
{
    private MockServiceRegistry serviceRegistry;

    private PartDescriptorService partDescriptorService;

    private LayoutDescriptorService layoutDescriptorService;

    private PageDescriptorService pageDescriptorService;

    private MacroDescriptorService macroDescriptorService;

    @BeforeEach
    public void setUp()
    {
        this.partDescriptorService = mock( PartDescriptorService.class );
        this.layoutDescriptorService = mock( LayoutDescriptorService.class );
        this.pageDescriptorService = mock( PageDescriptorService.class );
        this.macroDescriptorService = mock( MacroDescriptorService.class );

        this.serviceRegistry = new MockServiceRegistry();

        serviceRegistry.register( PartDescriptorService.class, this.partDescriptorService );
        serviceRegistry.register( LayoutDescriptorService.class, this.layoutDescriptorService );
        serviceRegistry.register( PageDescriptorService.class, this.pageDescriptorService );
        serviceRegistry.register( MacroDescriptorService.class, this.macroDescriptorService );
    }

    final MockBeanContext newBeanContext( final ResourceKey key )
    {
        return new MockBeanContext( key, this.serviceRegistry );
    }

    @Test
    void testGetByApplicationForPage()
    {
        final PageDescriptors pageDescriptors = PageDescriptors.from( PageDescriptor.create().
            displayName( "pageDescriptor" ).
            key( DescriptorKey.from( "app-guillotine:pageDescriptor" ) ).
            config( Form.create().build() ).
            regions( RegionDescriptors.create().build() ).
            build() );

        final ComponentDescriptorHandler instance = new ComponentDescriptorHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "app-guillotine:/test" ) ) );

        when( pageDescriptorService.getByApplication( any( ApplicationKey.class ) ) ).thenReturn( pageDescriptors );

        final Object result = instance.getComponentDescriptors( "Page", "app-guillotine" );

        assertNotNull( result );

        final List<ComponentDescriptorMapper> values = (List<ComponentDescriptorMapper>) result;

        assertEquals( 1, values.size() );

        final JsonMapGenerator generator = new JsonMapGenerator();

        values.get( 0 ).serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        assertEquals( "pageDescriptor", actualJson.path( "name" ).asText() );
        assertEquals( "app-guillotine", actualJson.path( "applicationKey" ).asText() );
    }

    @Test
    void testGetByApplicationForPart()
    {
        final PartDescriptors descriptors = PartDescriptors.from( PartDescriptor.create().
            displayName( "partDescriptor" ).
            key( DescriptorKey.from( "app-guillotine:partDescriptor" ) ).
            config( Form.create().build() ).
            build() );

        final ComponentDescriptorHandler instance = new ComponentDescriptorHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "app-guillotine:/test" ) ) );

        when( partDescriptorService.getByApplication( any( ApplicationKey.class ) ) ).thenReturn( descriptors );

        final Object result = instance.getComponentDescriptors( "Part", "app-guillotine" );

        assertNotNull( result );

        final List<ComponentDescriptorMapper> values = (List<ComponentDescriptorMapper>) result;

        assertEquals( 1, values.size() );

        final JsonMapGenerator generator = new JsonMapGenerator();

        values.get( 0 ).serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        assertEquals( "partDescriptor", actualJson.path( "name" ).asText() );
        assertEquals( "app-guillotine", actualJson.path( "applicationKey" ).asText() );
    }

    @Test
    void testGetByApplicationForLayout()
    {
        final LayoutDescriptors descriptors = LayoutDescriptors.from( LayoutDescriptor.create().
            displayName( "layoutDescriptor" ).
            key( DescriptorKey.from( "app-guillotine:layoutDescriptor" ) ).
            config( Form.create().build() ).
            regions( RegionDescriptors.create().build() ).
            config( Form.create().
                addFormItem( Input.create().
                    inputType( InputTypeName.TEXT_LINE ).
                    label( "inputField" ).
                    name( "inputField" ).
                    build() ).
                addFormItem( FieldSet.create().
                    name( "layoutName" ).
                    label( "FieldSetLabel" ).
                    addFormItem( Input.create().
                        inputType( InputTypeName.TEXT_LINE ).
                        label( "inputFieldInFieldSet" ).
                        name( "inputFieldInFieldSet" ).
                        build() ).build() ).
                build() ).
            build() );

        final ComponentDescriptorHandler instance = new ComponentDescriptorHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "app-guillotine:/test" ) ) );

        when( layoutDescriptorService.getByApplication( any( ApplicationKey.class ) ) ).thenReturn( descriptors );

        final Object result = instance.getComponentDescriptors( "Layout", "app-guillotine" );

        assertNotNull( result );

        final List<ComponentDescriptorMapper> values = (List<ComponentDescriptorMapper>) result;

        assertEquals( 1, values.size() );

        final JsonMapGenerator generator = new JsonMapGenerator();

        values.get( 0 ).serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        assertEquals( "layoutDescriptor", actualJson.path( "name" ).asText() );
        assertEquals( "app-guillotine", actualJson.path( "applicationKey" ).asText() );

        final JsonNode form = actualJson.get( "form" );

        assertTrue( form.isArray() );
        assertEquals( 2, form.size() );
        assertEquals( "inputField", form.get( 0 ).path( "name" ).asText() );
        assertEquals( "inputFieldInFieldSet", form.get( 1 ).path( "name" ).asText() );
    }

    @Test
    void testGetMacroDescriptors()
    {
        final MacroDescriptors descriptors = MacroDescriptors.from( MacroDescriptor.create().
            displayName( "testMacro" ).
            key( MacroKey.from( "com.app:testMacro" ) ).
            form( Form.create().
                addFormItem( Input.create().
                    name( "fieldName" ).
                    label( "Label" ).
                    inputType( InputTypeName.TEXT_LINE ).
                    build() ).
                build() ).
            build() );

        final ComponentDescriptorHandler instance = new ComponentDescriptorHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "com.app:/test" ) ) );

        when( macroDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( descriptors );

        final Object result = instance.getMacroDescriptors( Collections.singletonList( "com.app" ) );

        assertNotNull( result );

        final List<MacroDescriptorMapper> values = (List<MacroDescriptorMapper>) result;

        assertEquals( 1, values.size() );

        final JsonMapGenerator generator = new JsonMapGenerator();

        values.get( 0 ).serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        assertEquals( "testMacro", actualJson.path( "name" ).asText() );
        assertEquals( "com.app", actualJson.path( "applicationKey" ).asText() );
    }

    @Test
    void testGetByApplication_Unsupported()
    {
        final ComponentDescriptorHandler instance = new ComponentDescriptorHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "com.app:/test" ) ) );

        final IllegalArgumentException ex =
            assertThrows( IllegalArgumentException.class, () -> instance.getComponentDescriptors( "Unknown", "com.app.name" ) );

        assertEquals( "Unsupported component type \"Unknown\"", ex.getMessage() );
    }
}
