package com.enonic.lib.guillotine.macro;

import java.util.List;
import java.util.Map;

public final class HtmlEditorProcessedResult
{
    private final String raw;

    private final String markup;

    private final List<Map<String, Object>> macrosAsJson;

    private final Map<String, List<Map<String, Object>>> macros;

    private final List<Map<String, Object>> images;

    private HtmlEditorProcessedResult( final Builder builder )
    {
        this.raw = builder.raw;
        this.markup = builder.markup;
        this.macrosAsJson = builder.macrosAsJson;
        this.macros = builder.macros;
        this.images = builder.images;
    }

    public String getRaw()
    {
        return raw;
    }

    public String getMarkup()
    {
        return markup;
    }

    public List<Map<String, Object>> getMacrosAsJson()
    {
        return macrosAsJson;
    }

    public Map<String, List<Map<String, Object>>> getMacros()
    {
        return macros;
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

        private String markup;

        private List<Map<String, Object>> macrosAsJson;

        private Map<String, List<Map<String, Object>>> macros;

        private List<Map<String, Object>> images;

        public Builder setRaw( final String raw )
        {
            this.raw = raw;
            return this;
        }

        public Builder setMarkup( final String markup )
        {
            this.markup = markup;
            return this;
        }

        public Builder setMacrosAsJson( final List<Map<String, Object>> macrosAsJson )
        {
            this.macrosAsJson = macrosAsJson;
            return this;
        }

        public Builder setMacros( final Map<String, List<Map<String, Object>>> macros )
        {
            this.macros = macros;
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
