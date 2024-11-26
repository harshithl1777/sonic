import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables for Supabase project
const SUPABASE_URL = Deno.env.get('DB_URL')!;
const SUPABASE_KEY = Deno.env.get('KEY')!;

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders });
        } else if (req.method === 'GET') {
            return new Response('OK', { status: 200, headers: corsHeaders });
        } else if (req.method === 'PATCH') {
            // Parse the request body
            const { id, status, email, subject, content } = await req.json();

            // Validate input
            if (!id || !status || !['ERROR', 'PENDING', 'COMPLETED'].includes(status)) {
                return new Response(
                    JSON.stringify({
                        error: "Invalid input. Provide 'id' and 'status' as 'ERROR', 'PENDING', or 'COMPLETED'.",
                    }),
                    { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
                );
            }

            // Update the status column in the database
            const { data, error } = await supabase
                .from('emails') // Replace with your table name
                .update({ email, subject, content, status })
                .eq('id', id)
                .select();

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            return new Response(JSON.stringify({ message: 'Status updated successfully', data }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        } else if (req.method === 'POST') {
            const { name, email, subject, content, trigger_id, send_at, university, lab_url, status } =
                await req.json();
            const { data, error } = await supabase
                .from('emails') // Replace with your table name
                .insert([
                    {
                        name,
                        email,
                        subject,
                        content,
                        trigger_id,
                        ...(send_at ? { send_at } : {}),
                        university,
                        lab_url,
                        status: status ? status : 'PENDING',
                    },
                ])
                .select();

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            return new Response(JSON.stringify({ message: 'Row created successfully', data }), {
                status: 201,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        } else if (req.method === 'DELETE') {
            const { id } = await req.json();
            const { error } = await supabase.from('emails').delete().eq('id', id);

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            return new Response(JSON.stringify({ message: 'Row deleted successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON or internal error' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
});
