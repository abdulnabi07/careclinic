"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { getCurrentUser } from '../../../../services/authService';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate,
} from '../../../../services/settingsService';

export default function TemplatesPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState(null); // null = create mode, uuid = edit mode
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auth check — admin only
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace('/login'); return; }

        const user = await getCurrentUser();
        if (user && user.role === 'admin') {
          setAuthChecked(true);
        } else {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch templates once
  const fetchAll = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) fetchAll();
  }, [authChecked]);

  // --- Handlers ---

  const openCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormContent('');
    setError('');
    setFormOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setFormName(t.name);
    setFormContent(t.content);
    setError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormName('');
    setFormContent('');
    setError('');
  };

  const handleSave = async () => {
    if (!formName.trim() || !formContent.trim()) {
      setError('Name and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTemplate(editingId, { name: formName.trim(), content: formContent.trim() });
      } else {
        await createTemplate({ name: formName.trim(), content: formContent.trim() });
      }
      closeForm();
      await fetchAll();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteTemplate(id);
      await fetchAll();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await setActiveTemplate(id);
      await fetchAll();
    } catch (err) {
      alert('Failed to set active: ' + err.message);
    }
  };

  // --- Render ---

  if (!authChecked || loading) {
    return <div className="p-3 text-zinc-500 text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">WhatsApp Templates</h1>
            <p className="text-zinc-500 text-xs">Manage message templates.</p>
          </div>
        </div>

        {!formOpen && (
          <button
            onClick={openCreate}
            className="px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
          >
            + New
          </button>
        )}
      </div>

      {/* Placeholder hint */}
      <p className="text-zinc-500 text-xs px-1">
        Use <span className="text-blue-400">{'{{name}}'}</span>, <span className="text-blue-400">{'{{date}}'}</span>, <span className="text-blue-400">{'{{hospital}}'}</span> as placeholders.
      </p>

      {/* Create / Edit Form */}
      {formOpen && (
        <div className="border border-white/5 rounded-lg p-4 bg-zinc-900/60 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-white">
            {editingId ? 'Edit Template' : 'New Template'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">NAME</label>
            <input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Post-Visit Thank You"
              className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">CONTENT</label>
            <textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              rows={6}
              placeholder={"Hello {{name}},\nThank you for visiting..."}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={closeForm}
              className="flex-1 py-2.5 text-xs font-medium text-zinc-300 border border-white/10 rounded-lg hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No templates yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Tap "+ New" to create one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map(t => (
            <div
              key={t.id}
              className={`p-3 border rounded-lg flex flex-col gap-2 ${
                t.is_active
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-zinc-900/60 border-white/5'
              }`}
            >
              {/* Top row: name + active badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white flex-1 truncate">{t.name}</span>
                {t.is_active && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {/* Preview */}
              <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                {t.content?.substring(0, 100)}{t.content?.length > 100 ? '…' : ''}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openEdit(t)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  Delete
                </button>
                {!t.is_active && (
                  <button
                    onClick={() => handleSetActive(t.id)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg ml-auto"
                  >
                    Set Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
