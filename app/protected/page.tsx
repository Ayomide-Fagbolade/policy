import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Project } from "@/utils/types";
import ProjectCard from "@/components/projectcomponents/ProjectCard";
import { headers } from "next/headers";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get host and protocol for absolute URL
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "http" : "http";

  const fetchProjects = async () => {
    const res = await fetch(`${protocol}://${host}/api/projects`, { cache: "no-store" }); // Use absolute URL
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  };

  // Fetch projects directly in the main component
  const projects = await fetchProjects();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <ProjectCard projects={projects} />
    </div>
  );
}
