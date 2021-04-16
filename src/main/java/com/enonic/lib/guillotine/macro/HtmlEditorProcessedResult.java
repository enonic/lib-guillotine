package com.enonic.lib.guillotine.macro;

import java.util.List;
import java.util.Map;

public final class HtmlEditorProcessedResult
{
    private final String raw;

    private final String processedHtml;

    private final List<Map<String, Object>> macrosAsJson;

    private final List<Map<String, Object>> images;

    private HtmlEditorProcessedResult( final Builder builder )
    {
        this.raw = builder.raw;
        this.processedHtml = builder.processedHtml;
        this.macrosAsJson = builder.macrosAsJson;
        this.images = builder.images;
    }

    public String getRaw()
    {
        return raw;
    }

    public String getProcessedHtml()
    {
        return processedHtml;
    }

    public List<Map<String, Object>> getMacrosAsJson()
    {
        return macrosAsJson;
    }

    public List<Map<String, Object>> getImages()
    {
        return images;
    }

    public static HtmlEditorProcessedResult empty()
    {
        return HtmlEditorProcessedResult.create().build();
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static class Builder
    {
        private String raw;

        private String processedHtml;

        private List<Map<String, Object>> macrosAsJson;

        private List<Map<String, Object>> images;

        public Builder setRaw( final String raw )
        {
            this.raw = raw;
            return this;
        }

        public Builder setProcessedHtml( final String processedHtml )
        {
            this.processedHtml = processedHtml;
            return this;
        }

        public Builder setMacrosAsJson( final List<Map<String, Object>> macrosAsJson )
        {
            this.macrosAsJson = macrosAsJson;
            return this;
        }

        public Builder setImages( final List<Map<String, Object>> images )
        {
            this.images = images;
            return this;
        }

        public HtmlEditorProcessedResult build()
        {
            return new HtmlEditorProcessedResult( this );
        }
    }
}
