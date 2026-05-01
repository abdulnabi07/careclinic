import { supabase } from '../lib/supabaseClient';

const DEFAULT_TEMPLATE = `Hello {{name}},
Thank you for choosing Reema Hospital.
We wish you a speedy recovery.

Call: 8639728672

* Reema Hospital`;

// ---------- Active template (used by PatientCard WhatsApp button) ----------

let _cachedActiveTemplate = null;

/**
 * Get the currently active WhatsApp template content.
 * Falls back to DEFAULT_TEMPLATE if none is active.
 */
export const getWhatsAppTemplate = async () => {
  if (_cachedActiveTemplate) return _cachedActiveTemplate;

  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('content')
    .eq('is_active', true)
    .single();

  if (error || !data) return DEFAULT_TEMPLATE;
  _cachedActiveTemplate = data.content || DEFAULT_TEMPLATE;
  return _cachedActiveTemplate;
};

/** Invalidate the cached active template (call after set-active / edit / delete). */
export const invalidateTemplateCache = () => {
  _cachedActiveTemplate = null;
};

// ---------- CRUD for whatsapp_templates ----------

export const getTemplates = async () => {
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createTemplate = async ({ name, content }) => {
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .insert([{ name, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTemplate = async (id, { name, content }) => {
  const { error } = await supabase
    .from('whatsapp_templates')
    .update({ name, content })
    .eq('id', id);

  if (error) throw error;
  invalidateTemplateCache();
};

export const deleteTemplate = async (id) => {
  const { error } = await supabase
    .from('whatsapp_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
  invalidateTemplateCache();
};

/**
 * Set a template as active (deactivates all others first).
 */
export const setActiveTemplate = async (id) => {
  if (!id) {
    console.error('setActiveTemplate: invalid id', id);
    return;
  }

  // 1) Deactivate all — use .not('id', 'is', null) as a safe always-true filter
  const { error: e1 } = await supabase
    .from('whatsapp_templates')
    .update({ is_active: false })
    .not('id', 'is', null);

  if (e1) throw e1;

  // 2) Activate selected
  const { error: e2 } = await supabase
    .from('whatsapp_templates')
    .update({ is_active: true })
    .eq('id', id);

  if (e2) throw e2;
  invalidateTemplateCache();
};

// ---------- Template renderer ----------

/**
 * Render template by replacing placeholders with actual values.
 * Supported: {{name}}, {{date}}, {{hospital}}
 */
export const renderTemplate = (template, patient) => {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return template
    .replace(/\{\{name\}\}/gi, patient.name || '')
    .replace(/\{\{date\}\}/gi, today)
    .replace(/\{\{hospital\}\}/gi, 'Reema Hospital');
};
