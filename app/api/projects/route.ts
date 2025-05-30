import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'



export async function GET() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Projects')
        .select('*');

    if (error) {
        return await NextResponse.json({ error: error.message }, { status: 500 });
    }

    return await NextResponse.json(data);
}


