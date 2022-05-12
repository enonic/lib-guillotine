package com.enonic.lib.guillotine.macro;

import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.UrlTypeConstants;
import com.enonic.xp.web.servlet.ServletRequestUrlHelper;

public final class UrlHelper
{
    public static String resolveImageUrl( final String urlType, final String url, final PortalRequest portalRequest )
    {
        return portalRequest.getSite() == null ? buildUrl( urlType, url, portalRequest, "/_/image" ) : url;
    }

    public static String resolveAttachmentUrl( final String urlType, final String url, final PortalRequest portalRequest )
    {
        return portalRequest.getSite() == null ? buildUrl( urlType, url, portalRequest, "/_/attachment" ) : url;
    }

    private static String buildRepoAndBranchPartUrl()
    {
        Context context = ContextAccessor.current();
        return context.getRepositoryId().toString().substring( "com.enonic.cms.".length() ) + "/" + context.getBranch().toString();
    }

    private static String buildUrl( final String urlType, final String url, final PortalRequest portalRequest,
                                    final String endpointSubPath )
    {
        final String urlPrefix =
            urlType.equals( UrlTypeConstants.ABSOLUTE ) ? ServletRequestUrlHelper.getServerUrl( portalRequest.getRawRequest() ) : "";
        return urlPrefix + "/site/" + buildRepoAndBranchPartUrl() + url.substring( url.indexOf( endpointSubPath ) );
    }
}
