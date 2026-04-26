"use client";

import { useState, memo } from 'react';
import { useConfirmDialog } from './ConfirmDialog';
import dynamic from 'next/dynamic';

const EditPatientModal = dynamic(() => import('./EditPatientModal'), { ssr: false });

// Tiny success sound using Web Audio API — no external file needed
export function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) { /* silently ignore if AudioContext not available */ }
}

function WhatsAppButton({ mobile, name, services }) {
  const onClick = () => {
    const cleaned = String(mobile || '').replace(/\D/g, '');
    const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    const msg = encodeURIComponent(
      `Hello ${name}, your hospital visit details:\nServices: ${Array.isArray(services) ? services.join(', ') : 'N/A'}\nThank you for visiting us. Get well soon! 🏥`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };
  return (
    <button onClick={onClick} title="WhatsApp"
      className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 flex items-center justify-center text-green-400 transition-all active:scale-90">
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </button>
  );
}

function PatientCard({ patient, showAmount = false, onDelete, canEdit = false }) {
  const { confirm, Dialog } = useConfirmDialog();
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Patient?',
      message: `Remove "${patient.name}" from records? This cannot be undone.`
    });
    if (ok && onDelete) onDelete(patient.id);
  };

  return (
    <>
      {Dialog}
      {editing && (
        <EditPatientModal patient={patient} onClose={() => setEditing(false)} />
      )}

      <div className="bg-zinc-900/60 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] group">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">
              {patient.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{patient.name}</h3>
              <p className="text-zinc-500 text-xs mt-0.5">{patient.area} · Age {patient.age}</p>
            </div>
          </div>

          {/* Action icons — always visible on mobile, hover only on desktop */}
          <div className="flex items-center gap-1.5 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <WhatsAppButton mobile={patient.mobile} name={patient.name} services={patient.services} />
            {canEdit && (
              <button onClick={() => setEditing(true)} title="Edit"
                className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} title="Delete"
                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          {patient.mobile}
        </div>

        {/* Service chips */}
        {patient.services?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {patient.services.map(s => (
              <span key={s} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/15 text-blue-300 rounded-lg text-xs font-medium">{s}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-zinc-600 text-xs">{new Date(patient.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          {showAmount && patient.total_amount != null && (
            <span className="text-emerald-400 text-sm font-semibold">₹ {Number(patient.total_amount).toLocaleString()}</span>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(PatientCard);
