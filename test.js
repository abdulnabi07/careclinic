import { supabase } from './src/lib/supabaseClient.js';
async function test() {
  const { data } = await supabase.from('users').select('*').limit(1);
  console.log(data);
}
test();
