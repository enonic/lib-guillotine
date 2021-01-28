package com.enonic.lib.guillotine;

import java.util.function.Supplier;

import com.enonic.lib.guillotine.macro.HtmlAreaProcessedResult;
import com.enonic.lib.guillotine.macro.ProcessHtmlParams;
import com.enonic.lib.guillotine.macro.ProcessHtmlService;
import com.enonic.lib.guillotine.macro.ProcessHtmlServiceImpl;
import com.enonic.lib.guillotine.mapper.HtmlAreaResultMapper;
import com.enonic.xp.content.ContentService;
import com.enonic.xp.macro.MacroService;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.style.StyleDescriptorService;

public class ProcessHtmlHandler
    implements ScriptBean
{
    private Supplier<ContentService> contentServiceSupplier;

    private Supplier<StyleDescriptorService> styleDescriptorServiceSupplier;

    private Supplier<PortalUrlService> portalUrlServiceSupplier;

    private Supplier<MacroService> macroServiceSupplier;

    private PortalRequest request;

    @Override
    public void initialize( final BeanContext context )
    {
        this.request = context.getBinding( PortalRequest.class ).get();

        this.contentServiceSupplier = context.getService( ContentService.class );
        this.styleDescriptorServiceSupplier = context.getService( StyleDescriptorService.class );
        this.portalUrlServiceSupplier = context.getService( PortalUrlService.class );
        this.macroServiceSupplier = context.getService( MacroService.class );
    }

    public Object processHtml( ScriptValue params )
    {
        final ProcessHtmlParams htmlParams = new ProcessHtmlParams().setPortalRequest( this.request );

        if ( params.getMap().containsKey( "value" ) )
        {
            htmlParams.setValue( params.getMap().get( "value" ).toString() );
        }

        if ( params.getMap().containsKey( "type" ) )
        {
            htmlParams.setType( params.getMap().get( "type" ).toString() );
        }

        final ProcessHtmlService processHtmlService =
            new ProcessHtmlServiceImpl( contentServiceSupplier.get(), styleDescriptorServiceSupplier.get(), portalUrlServiceSupplier.get(),
                                        macroServiceSupplier.get() );

        final HtmlAreaProcessedResult result = processHtmlService.processHtml( htmlParams );

        return new HtmlAreaResultMapper( result );
    }

}
