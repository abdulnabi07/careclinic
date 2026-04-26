"use client";

import { useState } from 'react';
import { createPatient } from '../services/patientService';
import { getCurrentUser } from '../services/authService';

const AVAILABLE_SERVICES = [
  'GRBS', 'ECG', 'Suturing', 'Dressing', 'Injection',
  'Outside Injection', 'Nebulization', 'Random', 'Consultation', 'Review Patient'
];

export default function AddPatientForm({ onSuccess }) {
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [area, setArea] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedServices, setSelectedServices] = useState({});

  const submitPatient = async (data) => {
    setIsPending(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      await createPatient({ ...data, created_by: user.id });
      if (onSuccess) onSuccess();
      // Reset form
      setName('');
      setAge('');
      setArea('');
      setMobile('');
      setSelectedServices({});
    } catch (err) {
      alert('Failed to add patient: ' + err.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleServiceChange = (service) => {
    setSelectedServices(prev => {
      const updated = { ...prev };
      if (updated[service] !== undefined) {
        delete updated[service];
      } else {
        updated[service] = '';
      }
      return updated;
    });
  };

  const handleAmountChange = (service, amount) => {
    setSelectedServices(prev => ({
      ...prev,
      [service]: amount
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !age || !mobile || !area) {
      alert('Please fill all basic details');
      return;
    }

    const services = Object.keys(selectedServices);
    if (services.length === 0) {
      alert('Please select at least one service');
      return;
    }

    let totalAmount = 0;
    const serviceAmounts = {};

    for (const service of services) {
      const amt = parseFloat(selectedServices[service]);
      if (isNaN(amt) || amt < 0) {
        alert(`Please enter a valid amount for ${service}`);
        return;
      }
      totalAmount += amt;
      serviceAmounts[service] = amt;
    }

    submitPatient({
      name,
      age: parseInt(age),
      area,
      mobile,
      services,
      service_amounts: serviceAmounts,
      total_amount: totalAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Name</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" placeholder="Patient name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Age</label>
          <input required type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" placeholder="Age" min="0" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Area</label>
          <input required type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" placeholder="Location/Area" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Mobile</label>
          <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50" placeholder="10-digit number" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <label className="text-sm font-semibold text-zinc-200 block mb-4">Services</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AVAILABLE_SERVICES.map(service => (
            <div key={service} className={`p-3 rounded-xl border transition-all ${selectedServices[service] !== undefined ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-950/50 border-white/5 hover:border-white/10'}`}>
              <label className="flex items-center cursor-pointer gap-3">
                <div className="relative flex items-center">
                  <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded border-zinc-700 bg-zinc-800" checked={selectedServices[service] !== undefined} onChange={() => handleServiceChange(service)} />
                </div>
                <span className="text-sm font-medium text-zinc-300 flex-1">{service}</span>
              </label>
              
              {selectedServices[service] !== undefined && (
                <div className="mt-3 flex items-center gap-2 pl-8">
                  <span className="text-zinc-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={selectedServices[service]}
                    onChange={(e) => handleAmountChange(service, e.target.value)}
                    placeholder="Amount"
                    min="0"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] disabled:opacity-50 flex items-center gap-2">
          {isPending ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : null}
          Add Patient Record
        </button>
      </div>
    </form>
  );
}
