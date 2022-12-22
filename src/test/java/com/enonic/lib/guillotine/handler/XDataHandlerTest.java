package com.enonic.lib.guillotine.handler;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.fasterxml.jackson.databind.JsonNode;

import com.enonic.lib.guillotine.mapper.XDatasMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.Input;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.schema.xdata.XData;
import com.enonic.xp.schema.xdata.XDataName;
import com.enonic.xp.schema.xdata.XDataService;
import com.enonic.xp.schema.xdata.XDatas;
import com.enonic.xp.script.serializer.JsonMapGenerator;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class XDataHandlerTest
    extends ScriptTestSupport
{
    private XDataService xDataService;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        this.xDataService = Mockito.mock( XDataService.class );

        addService( XDataService.class, this.xDataService );
    }

    @Test
    public void testGetXDataByApplicationKeys()
    {
        ApplicationKey applicationKey = ApplicationKey.from( "com.enonic.app.App" );

        XDatas xDatas = XDatas.create().
            add( XData.create().
                name( XDataName.from( applicationKey, "SoMe" ) ).
                form( Form.create().
                    addFormItem( Input.create().
                        inputType( InputTypeName.TEXT_LINE ).
                        name( "twitter" ).
                        label( "Twitter" ).
                        minimumOccurrences( 0 ).
                        maximumOccurrences( 1 ).
                        build() ).
                    build() ).
                build() ).build();

        Mockito.when( this.xDataService.getByApplication( Mockito.any( ApplicationKey.class ) ) ).thenReturn( xDatas );

        final XDataHandler instance = new XDataHandler();
        instance.initialize( newBeanContext( ResourceKey.from( "app-guillotine:/test" ) ) );

        final XDatasMapper xDataMapper = instance.getXDataByApplicationKeys( List.of( applicationKey.getName() ) );

        assertNotNull( xDataMapper );

        final JsonMapGenerator generator = new JsonMapGenerator();
        xDataMapper.serialize( generator );

        final JsonNode actualJson = (JsonNode) generator.getRoot();

        JsonNode values = actualJson.get( "com.enonic.app.App" );
        if ( values.isArray() )
        {
            assertEquals( 1, values.size() );

            final JsonNode jsonNode = values.get( 0 );

            assertEquals( "com.enonic.app.App", jsonNode.get( "applicationKey" ).asText() );
            assertEquals( "SoMe", jsonNode.get( "name" ).asText() );
            assertNotNull( jsonNode.get( "form" ) );
        }
    }
}
