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
    <form onSubmit={handleSubmit} className="border border-white/5 rounded-lg p-4 flex flex-col gap-4 bg-zinc-900/50">
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Name</label>
          <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" placeholder="Patient name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Age</label>
          <input required type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" placeholder="Age" min="0" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Area</label>
          <input required type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" placeholder="Location/Area" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Mobile</label>
          <input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500" placeholder="10-digit number" />
        </div>
      </div>

      <div className="pt-3 border-t border-white/5">
        <label className="text-sm font-semibold text-zinc-200 block mb-3">Services</label>
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {AVAILABLE_SERVICES.map(service => (
            <div key={service} className={`p-3 rounded-lg border ${selectedServices[service] !== undefined ? 'bg-blue-500/10 border-blue-500/30' : 'bg-zinc-950/50 border-white/5'}`}>
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
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium text-sm disabled:opacity-50">
        {isPending ? 'Adding...' : 'Add Patient Record'}
      </button>
    </form>
  );
}
