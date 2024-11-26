const API_TOKEN = Deno.env.get('BETTER_STACK_TOKEN');

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    } else if (req.method === 'GET') {
        return new Response('OK', { status: 200, headers: corsHeaders });
    }
    try {
        const response = await fetch('https://uptime.betterstack.com/api/v2/monitors', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                ...corsHeaders,
            },
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ success: false }), { status: 500, headers: corsHeaders });
        }

        const data = await response.json();
        return new Response(JSON.stringify({ ...data, success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        console.error('Error fetching monitors:', error);
        return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
    }
});
