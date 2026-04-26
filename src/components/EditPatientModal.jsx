"use client";

import { useState, useEffect, useCallback } from 'react';
import { updatePatient } from '../services/patientService';

const AVAILABLE_SERVICES = [
  'GRBS', 'ECG', 'Suturing', 'Dressing', 'Injection',
  'Outside Injection', 'Nebulization', 'Random', 'Consultation', 'Review Patient'
];

export default function EditPatientModal({ patient, onClose, onSuccess }) {
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState(patient.name || '');
  const [age, setAge] = useState(patient.age || '');
  const [area, setArea] = useState(patient.area || '');
  const [mobile, setMobile] = useState(patient.mobile || '');
  const [selectedServices, setSelectedServices] = useState(() => {
    const init = {};
    if (patient.service_amounts) {
      Object.entries(patient.service_amounts).forEach(([svc, amt]) => {
        init[svc] = String(amt);
      });
    } else {
      (patient.services || []).forEach(s => { init[s] = ''; });
    }
    return init;
  });

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const submitUpdate = async (data) => {
    setIsPending(true);
    try {
      await updatePatient(patient.id, data);
      alert('Patient updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      alert('Update failed: ' + e.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[service] !== undefined) { delete next[service]; }
      else { next[service] = ''; }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const services = Object.keys(selectedServices);
    let total = 0;
    const amounts = {};
    for (const svc of services) {
      const amt = parseFloat(selectedServices[svc]);
      if (isNaN(amt) || amt < 0) {
        alert(`Enter a valid amount for ${svc}`);
        return;
      }
      total += amt;
      amounts[svc] = amt;
    }
    submitUpdate({
      name, age: parseInt(age), area, mobile,
      services, service_amounts: amounts, total_amount: total
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-white font-semibold text-base">Edit Patient Record</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Patient name' },
              { label: 'Age', value: age, set: setAge, type: 'number', placeholder: 'Age' },
              { label: 'Area', value: area, set: setArea, type: 'text', placeholder: 'Location/Area' },
              { label: 'Mobile', value: mobile, set: setMobile, type: 'tel', placeholder: '10-digit number' },
            ].map(f => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{f.label}</label>
                <input
                  required type={f.type} value={f.value} placeholder={f.placeholder}
                  onChange={e => f.set(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            ))}
          </div>

          {/* Services */}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide block mb-3">Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVAILABLE_SERVICES.map(svc => (
                <div
                  key={svc}
                  className={`p-3 rounded-xl border transition-all ${selectedServices[svc] !== undefined ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-950/50 border-white/5'}`}
                >
                  <label className="flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      className="accent-blue-500"
                      checked={selectedServices[svc] !== undefined}
                      onChange={() => handleServiceToggle(svc)}
                    />
                    <span className="text-sm text-zinc-300 flex-1">{svc}</span>
                  </label>
                  {selectedServices[svc] !== undefined && (
                    <div className="mt-2 flex items-center gap-2 pl-6">
                      <span className="text-zinc-400 text-sm">₹</span>
                      <input
                        type="number" min="0"
                        value={selectedServices[svc]}
                        onChange={e => setSelectedServices(prev => ({ ...prev, [svc]: e.target.value }))}
                        placeholder="Amount"
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />}
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
