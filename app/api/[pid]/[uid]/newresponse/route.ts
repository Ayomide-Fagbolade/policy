import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ pid: string; uid: string }> }
): Promise<NextResponse> {
  const { pid, uid } = await context.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Response')
    .select('*')
    .eq('response_project_id', pid)
    .eq('user_id', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}