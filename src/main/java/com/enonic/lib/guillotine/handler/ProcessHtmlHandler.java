package com.enonic.lib.guillotine.handler;

import java.util.List;
import java.util.function.Supplier;

import com.enonic.lib.guillotine.macro.ProcessHtmlParams;
import com.enonic.lib.guillotine.macro.ProcessHtmlService;
import com.enonic.lib.guillotine.macro.ProcessHtmlServiceImpl;
import com.enonic.lib.guillotine.mapper.HtmlAreaResultMapper;
import com.enonic.xp.macro.MacroDescriptorService;
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
    private Supplier<StyleDescriptorService> styleDescriptorServiceSupplier;

    private Supplier<PortalUrlService> portalUrlServiceSupplier;

    private Supplier<MacroService> macroServiceSupplier;

    private Supplier<MacroDescriptorService> macroDescriptorServiceSupplier;

    private PortalRequest request;

    @Override
    public void initialize( final BeanContext context )
    {
        this.request = context.getBinding( PortalRequest.class ).get();

        this.styleDescriptorServiceSupplier = context.getService( StyleDescriptorService.class );
        this.portalUrlServiceSupplier = context.getService( PortalUrlService.class );
        this.macroServiceSupplier = context.getService( MacroService.class );
        this.macroDescriptorServiceSupplier = context.getService( MacroDescriptorService.class );
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

        if ( params.getMap().containsKey( "imageWidths" ) )
        {
            htmlParams.setImageWidths( (List<Integer>) params.getMap().get( "imageWidths" ) );
        }

        final ProcessHtmlService processHtmlService =
            new ProcessHtmlServiceImpl( styleDescriptorServiceSupplier.get(), portalUrlServiceSupplier.get(), macroServiceSupplier.get(),
                                        macroDescriptorServiceSupplier.get() );

        return new HtmlAreaResultMapper( processHtmlService.processHtml( htmlParams ) );
    }

}
