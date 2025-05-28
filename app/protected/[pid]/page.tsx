import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import ConsentCard from "@/components/projectcomponents/ConsentCard";


export default async function ConsentPage() {
  const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// Get the pid from the route params (Next.js 13+ uses props for dynamic routes)
// Since this is a server component, you can get params from the props argument
// But since you don't have access to params here, you need to use a client component or restructure
// For now, let's assume you pass pid as a prop or fetch it another way

const userId: string | null = user?.id ?? null;
// You need to get pid from somewhere, e.g., props or context
// For demonstration, let's set a placeholder
 // TODO: Replace with actual pid value

  if (!user) {
    return redirect("/sign-in");
  }


  return (
    <div className="w-full flex flex-col items-center gap-8 p-4">
      <ConsentCard  userId={userId} />
      
    </div>
  );
}
