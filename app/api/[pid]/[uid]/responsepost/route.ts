import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'



export async function POST(request: Request) {
    console.log("Received POST request to /api/responsepost");

    // 1. Get the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Missing or invalid Authorization header.' }, { status: 401 });
    }
    const accessToken = authHeader.replace('Bearer ', '');

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Validate the user using the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
        return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    // 4. Parse and validate body
    const body = await request.json();
    console.log("Received body:", body);
    console.log("Is body an array?", Array.isArray(body));

    if (!Array.isArray(body)) {
        return NextResponse.json({ error: 'Request body must be an array of responses.' }, { status: 400 });
    }

    // 5. Optionally, enforce user_id matches authenticated user
    // body.forEach(r => r.user_id = user.id);

    // 6. Insert into Supabase
    const { data, error } = await supabase
        .from('Response')
        .insert(body)
        .select();

    if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}



