package com.enonic.lib.guillotine.macro;

import java.util.List;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.UrlTypeConstants;

public class ProcessHtmlParams
{
    private String value;

    private PortalRequest portalRequest;

    private String type = UrlTypeConstants.SERVER_RELATIVE;

    private List<Integer> imageWidths;

    private String imageSizes;

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

    public List<Integer> getImageWidths()
    {
        return imageWidths;
    }

    public ProcessHtmlParams setImageWidths( final List<Integer> imageWidths )
    {
        this.imageWidths = imageWidths;
        return this;
    }

    public String getImageSizes()
    {
        return imageSizes;
    }

    public ProcessHtmlParams setImageSizes( final String imageSizes )
    {
        this.imageSizes = imageSizes;
        return this;
    }
}
