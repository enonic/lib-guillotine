package com.enonic.lib.guillotine.macro;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.UrlTypeConstants;

public class ProcessHtmlParams
{
    private String value;

    private PortalRequest portalRequest;

    private String type = UrlTypeConstants.SERVER_RELATIVE;

    public String getValue()
    {
        return value;
    }

    public ProcessHtmlParams setValue( String value )
    {
        this.value = value;
        return this;
    }

    public ProcessHtmlParams setPortalRequest( PortalRequest portalRequest )
    {
        this.portalRequest = portalRequest;
        return this;
    }

    public PortalRequest getPortalRequest()
    {
        return portalRequest;
    }

    public ProcessHtmlParams setType( String type )
    {
        this.type = type;
        return this;
    }

    public String getType()
    {
        return type;
    }
}
