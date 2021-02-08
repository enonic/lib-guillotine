package com.enonic.lib.guillotine.handler;

import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.lib.guillotine.mapper.ComponentDescriptorMapper;
import com.enonic.lib.guillotine.mapper.MacroDescriptorMapper;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.page.PageDescriptorService;
import com.enonic.xp.region.LayoutDescriptorService;
import com.enonic.xp.region.PartDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class ComponentDescriptorHandler
    implements ScriptBean
{
    private Supplier<PartDescriptorService> partDescriptorServiceSupplier;

    private Supplier<LayoutDescriptorService> layoutDescriptorServiceSupplier;

    private Supplier<PageDescriptorService> pageDescriptorServiceSupplier;

    private Supplier<MacroDescriptorService> macroDescriptorServiceSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        this.partDescriptorServiceSupplier = context.getService( PartDescriptorService.class );
        this.layoutDescriptorServiceSupplier = context.getService( LayoutDescriptorService.class );
        this.pageDescriptorServiceSupplier = context.getService( PageDescriptorService.class );
        this.macroDescriptorServiceSupplier = context.getService( MacroDescriptorService.class );
    }

    public Object getByApplication( final String componentType, final String applicationKey )
    {
        final ApplicationKey appKey = ApplicationKey.from( applicationKey );

        switch ( componentType )
        {
            case "Part":
                return partDescriptorServiceSupplier.get().getByApplication( appKey ).
                    stream().
                    map( ComponentDescriptorMapper::new ).
                    collect( Collectors.toList() );
            case "Layout":
                return layoutDescriptorServiceSupplier.get().getByApplication( appKey ).
                    stream().
                    map( ComponentDescriptorMapper::new ).
                    collect( Collectors.toList() );
            case "Page":
                return pageDescriptorServiceSupplier.get().getByApplication( appKey ).
                    stream().
                    map( ComponentDescriptorMapper::new ).
                    collect( Collectors.toList() );
            case "Macro":
                return macroDescriptorServiceSupplier.get().getByApplication( appKey ).
                    stream().
                    map( MacroDescriptorMapper::new ).
                    collect( Collectors.toList() );
            default:
                throw new IllegalArgumentException( "Unsupported component type \"" + componentType + "\"" );
        }
    }
}
