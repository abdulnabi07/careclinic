import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { calculateReports } from '../../../utils/reportUtils';

export const dynamic = 'force-dynamic'; // Ensure it runs dynamically for cron jobs

function buildWhatsAppReport(report) {
  return `
🏥 *Daily Report*

*Patients:*
Total: ${report.today.count}
Review: ${report.today.review}
Consultation: ${report.today.consultation}

*Revenue:*
Total: ₹${report.today.revenue.toLocaleString()}
Cash: ₹${report.today.cash.toLocaleString()}
Online: ₹${report.today.online.toLocaleString()}
`.trim();
}

export async function GET(request) {
  try {
    // 1. Authenticate the cron request if running on Vercel
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch last 8 days of data to safely cover IST timezone boundary
    const fetchStart = new Date();
    fetchStart.setDate(fetchStart.getDate() - 8);
    
    const { data, error } = await supabase
      .from('patients')
      .select('created_at, total_amount, payment_type, services')
      .gte('created_at', fetchStart.toISOString());

    if (error) throw error;

    // 3. Calculate report — IST filtering is handled internally by calculateReports
    const reports = calculateReports(data || []);
    
    // 4. Generate message
    const message = buildWhatsAppReport(reports);

    // 5. Send via WhatsApp API
    // IMPORTANT: Replace this placeholder with an actual API call to Twilio, Meta, or another provider.
    console.log("---- WHATSAPP REPORT PREVIEW ----");
    console.log(message);
    console.log("---------------------------------");
    
    // Example: 
    // await fetch('https://api.whatsapp.provider...', { method: 'POST', body: JSON.stringify({ message }) });

    return NextResponse.json({ success: true, message: "Report generated successfully" });
  } catch (err) {
    console.error('[send-daily-report] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
