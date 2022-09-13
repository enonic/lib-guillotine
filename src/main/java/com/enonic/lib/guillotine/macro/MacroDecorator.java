package com.enonic.lib.guillotine.macro;

import java.util.UUID;

import com.enonic.xp.macro.Macro;

public class MacroDecorator
{
    private final Macro macro;

    private final String nodeId;

    private final String id;

    private MacroDecorator( final Macro macro, final String nodeId )
    {
        this.macro = macro;
        this.nodeId = nodeId;
        this.id = UUID.randomUUID().toString();
    }

    public static MacroDecorator from( final Macro macro, final String nodeId )
    {
        return new MacroDecorator( macro, nodeId );
    }

    public Macro getMacro()
    {
        return macro;
    }

    public String getId()
    {
        return id;
    }

    public String getNodeId()
    {
        return nodeId;
    }
}
