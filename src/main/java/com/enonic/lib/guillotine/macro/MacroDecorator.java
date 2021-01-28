package com.enonic.lib.guillotine.macro;

import java.util.UUID;

import com.enonic.xp.macro.Macro;

public class MacroDecorator
{
    private final Macro macro;

    private final String id;

    private MacroDecorator( final Macro macro )
    {
        this.macro = macro;
        this.id = UUID.randomUUID().toString();
    }

    public static MacroDecorator from( final Macro macro )
    {
        return new MacroDecorator( macro );
    }

    public Macro getMacro()
    {
        return macro;
    }

    public String getId()
    {
        return id;
    }
}
