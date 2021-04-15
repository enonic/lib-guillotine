package com.enonic.lib.guillotine.handler;

import java.util.Locale;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import com.enonic.lib.guillotine.mock.MockMacroServiceImpl;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.content.ContentPath;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.form.Form;
import com.enonic.xp.form.Input;
import com.enonic.xp.inputtype.InputTypeName;
import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.macro.MacroKey;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.site.Site;
import com.enonic.xp.site.SiteConfig;
import com.enonic.xp.site.SiteConfigs;
import com.enonic.xp.style.StyleDescriptorService;
import com.enonic.xp.style.StyleDescriptors;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProcessHtmlHandlerTest
    extends ScriptTestSupport
{
    private StyleDescriptorService styleDescriptorService;

    private MacroDescriptorService macroDescriptorService;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        this.styleDescriptorService = mock( StyleDescriptorService.class );
        this.macroDescriptorService = mock( MacroDescriptorService.class );

        addService( MacroService.class, new MockMacroServiceImpl() );
        addService( StyleDescriptorService.class, this.styleDescriptorService );
        addService( MacroDescriptorService.class, this.macroDescriptorService );
        addService( PortalUrlService.class, mock( PortalUrlService.class ) );

        getPortalRequest().setSite( Site.create().
            name( "site" ).
            parentPath( ContentPath.ROOT ).
            language( Locale.ENGLISH ).
            siteConfigs( SiteConfigs.create().
                add( SiteConfig.create().
                    application( ApplicationKey.from( "myapp" ) ).
                    config( new PropertyTree() ).
                    build() ).
                build() ).
            build() );
    }

    @Test
    @Disabled
    void testProcessHtml()
    {
        MacroDescriptor macroDescriptor = MacroDescriptor.create().
            key( MacroKey.from( "myapp:mymacro" ) ).
            form( Form.create().
                addFormItem( Input.create().
                    inputType( InputTypeName.TEXT_LINE ).
                    name( "field_name_1" ).
                    label( "Field Name 1" ).
                    minimumOccurrences( 0 ).
                    maximumOccurrences( 0 ).
                    build() ).
                build() ).
            build();

        when( styleDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn( StyleDescriptors.empty() );
        when( macroDescriptorService.getByApplications( any( ApplicationKeys.class ) ) ).thenReturn(
            MacroDescriptors.from( macroDescriptor ) );

        runFunction( "lib/macro-test.js", "testProcessHtml" );
    }
}
