import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ pid: string; uid: string }> }
) {
    const { pid, uid } = await context.params;
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('Response_survey')
        .select('*')
        .eq('project_active', pid)
        .eq('id', uid);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const body = await request.json();
    console.log("Received body:", body);

    if (!Array.isArray(body)) {
        return NextResponse.json(
            { error: "Request body must be an array of responses." },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from("Response_survey")
        .insert(body)
        .select();

    if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}