import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import FullExperiment from "@/components/projectcomponents/FullExperiment";

interface PageProps {
  params: Promise<{ pid: string }>;

}

export default async function ConsentPage({ params }: PageProps) {
  const { pid } = await params; // Await params since it's now a Promise
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId: string | null = user?.id ?? null;
  const fpid = pid.replace(/-/g, "");

  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className=" flex h-[100vh] sm:h-screen">
      <FullExperiment userId={userId} project_id={fpid} />
    </div>
  );
}
