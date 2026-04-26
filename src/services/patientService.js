import { supabase } from '../lib/supabaseClient';

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-ref');

let demoPatients = [
  { id: 'p1', name: 'John Doe', age: 45, area: 'Downtown', mobile: '555-0100', services: ['ECG', 'Consultation'], service_amounts: { 'ECG': 150, 'Consultation': 200 }, total_amount: 350, created_at: new Date().toISOString(), created_by: '1' },
  { id: 'p2', name: 'Jane Smith', age: 32, area: 'Uptown', mobile: '555-0101', services: ['GRBS'], service_amounts: { 'GRBS': 50 }, total_amount: 50, created_at: new Date().toISOString(), created_by: '2' }
];

const workerSafe = (p) => {
  const { total_amount, service_amounts, ...rest } = p;
  return rest;
};

export const createPatient = async (data) => {
  if (isDemo) {
    const newPatient = { id: 'p' + Date.now(), ...data, created_at: new Date().toISOString() };
    demoPatients.unshift(newPatient);
    return newPatient;
  }
  const { data: result, error } = await supabase.from('patients').insert([data]).select();
  if (error) throw error;
  return result[0];
};

export const updatePatient = async (id, updates) => {
  if (isDemo) {
    demoPatients = demoPatients.map(p => p.id === id ? { ...p, ...updates } : p);
    return demoPatients.find(p => p.id === id);
  }
  const { data, error } = await supabase.from('patients').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const getPatients = async (role, search = '') => {
  if (isDemo) {
    let results = [...demoPatients];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name?.toLowerCase().includes(q) || p.mobile?.toLowerCase().includes(q)
      );
    }
    if (role === 'worker') return results.map(workerSafe);
    return results.slice(0, 50);
  }
  let query = supabase.from('patients').select('*').order('created_at', { ascending: false }).limit(50);
  if (search) {
    query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  if (role === 'worker') return data.map(workerSafe);
  return data;
};

export const deletePatient = async (id) => {
  if (isDemo) {
    demoPatients = demoPatients.filter(p => p.id !== id);
    return;
  }
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
};

export const getTodayRevenue = async () => {
  if (isDemo) return demoPatients.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase.from('patients').select('total_amount').gte('created_at', today.toISOString());
  if (error) throw error;
  return data.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
};

export const getMonthlyRevenue = async () => {
  if (isDemo) return demoPatients.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0) + 1250;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { data, error } = await supabase.from('patients').select('total_amount').gte('created_at', startOfMonth.toISOString());
  if (error) throw error;
  return data.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
};
