package com.enonic.lib.guillotine.macro;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMultimap;

import com.enonic.xp.form.FormItem;
import com.enonic.xp.form.FormItemSet;
import com.enonic.xp.form.FormOptionSet;
import com.enonic.xp.form.Input;
import com.enonic.xp.form.Occurrences;
import com.enonic.xp.macro.MacroDescriptor;

public class MacroEditorJsonSerializer
{
    private final MacroDecorator macro;

    private final MacroDescriptor descriptor;

    public MacroEditorJsonSerializer( final MacroDecorator macro, final MacroDescriptor descriptor )
    {
        this.macro = macro;
        this.descriptor = descriptor;
    }

    public Map<String, Object> serialize()
    {
        final Map<String, Object> result = new LinkedHashMap<>();

        result.put( "macroName", macro.getMacro().getName() );
        result.put( "macroRef", macro.getId() );

        final Map<String, Object> config = new LinkedHashMap<>(  );
        config.put( "body", macro.getMacro().getBody() );

        final ImmutableMultimap<String, String> params = macro.getMacro().getParameters();

        for ( String key : params.keySet() )
        {
            ImmutableList<String> values = macro.getMacro().getParameter( key );

            Occurrences occurrences = getOccurrences( descriptor.getForm().getFormItem( key ) );

            if ( occurrences != null && occurrences.isMultiple() )
            {
                config.put( key, values );
            }
            else
            {
                config.put( key, Objects.requireNonNullElse( values, List.of() ).isEmpty() ? null : values.get( 0 ) );
            }
        }

        result.put( "config", config );

        return result;
    }

    private Occurrences getOccurrences( final FormItem formItem )
    {
        if ( formItem instanceof Input )
        {
            return ( (Input) formItem ).getOccurrences();
        }
        else if ( formItem instanceof FormOptionSet )
        {
            return ( (FormOptionSet) formItem ).getOccurrences();
        }
        else if ( formItem instanceof FormItemSet )
        {
            return ( (FormItemSet) formItem ).getOccurrences();
        }

        return null;
    }

}
