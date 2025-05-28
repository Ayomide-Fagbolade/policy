import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ pid: string }> }
) {
    const { pid } = await context.params;
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('Policy')
        .select('*')
        .eq('linked_policy_project', pid);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}