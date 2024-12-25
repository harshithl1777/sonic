const notionToken = Deno.env.get('NOTION_SECRET'); // Replace with your Notion integration token
const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID'); // Replace with your Notion database ID

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getPageIdByEmail = async (email) => {
    const url = `https://api.notion.com/v1/databases/${notionDatabaseId}/query`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${notionToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28', // Use the latest version
        },
        body: JSON.stringify({
            filter: {
                property: 'Email', // Replace with the name of your email column
                email: {
                    equals: email,
                },
            },
        }),
    });

    const data = await response.json();

    if (response.ok && data.results.length > 0) {
        const pageId = data.results[0].id;
        return pageId;
    } else if (data.results.length === 0) {
        throw new Error(`Error: No page found matching given email.`);
    } else {
        throw new Error(`Error: ${data.message}`);
    }
};

// Define the handler function
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    } else if (req.method === 'GET') {
        return new Response('OK', { status: 200, headers: corsHeaders });
    } else if (req.method === 'POST') {
        try {
            const allRows = [];
            let nextCursor = undefined; // Initialize cursor for pagination
            const url = new URL(req.url);
            const statusFilter = url.searchParams.get('status')?.split(',') || [];

            // Loop through all pages until there is no next_cursor
            do {
                const notionResponse = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${notionToken}`,
                        'Notion-Version': '2022-06-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filter: {
                            or: statusFilter.map((status) => ({
                                property: 'Status',
                                status: {
                                    equals: status.trim(), // Trim to ensure clean inputs
                                },
                            })),
                        },
                        ...(nextCursor ? { start_cursor: nextCursor } : {}),
                    }),
                });

                // Check if the response is okay
                if (!notionResponse.ok) {
                    throw new Error(`Notion API Error: ${notionResponse.statusText}`);
                }

                // Parse the response JSON
                const notionData = await notionResponse.json();
                const formattedRows = notionData.results.map((row) => ({
                    id: row.id,
                    email: row.properties.Email.email || null,
                    name: row.properties.Name.title[0].plain_text || null,
                    labURL: row.properties['Lab URL'].url || null,
                    university: row.properties.University.select.name || null,
                    status: row.properties.Status.status.name || null,
                    createdAt: row.created_time,
                }));
                allRows.push(...formattedRows); // Add results to allRows

                // Set the next cursor for pagination (if available)
                nextCursor = notionData.next_cursor;
            } while (nextCursor); // Continue looping if there's more data

            // Return all the data back to the frontend
            return new Response(JSON.stringify(allRows), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error fetching Notion data:', error);
            return new Response('Error fetching data from Notion', { status: 500, headers: { ...corsHeaders } });
        }
    } else if (req.method === 'PATCH') {
        try {
            // Get the Notion page ID from the request body
            const { email, status } = await req.json();

            const notionPageID = await getPageIdByEmail(email);

            // Construct the request URL for Notion API
            const notionApiUrl = `https://api.notion.com/v1/pages/${notionPageID}`;

            // Prepare the body to update the Status to "Contacted"
            const requestBody = {
                properties: {
                    Status: {
                        status: {
                            name: status, // The status value you want to set
                        },
                    },
                },
            };

            // Send the PATCH request to update the page's status
            const response = await fetch(notionApiUrl, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${notionToken}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28', // Make sure to use the correct Notion API version
                    ...corsHeaders,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                return new Response('Failed to update status', {
                    status: response.status,
                    headers: { ...corsHeaders },
                });
            }

            // If successful, return a success message
            const responseData = await response.json();
            return new Response(JSON.stringify({ message: `Status updated to ${status}`, data: responseData }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        } catch (error) {
            // Catch errors and return a response
            return new Response('Internal Server Error', { status: 500, headers: { ...corsHeaders } });
        }
    } else {
        return new Response('Method Not Allowed', { status: 405, headers: { ...corsHeaders } });
    }
});
