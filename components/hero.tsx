import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";

export default function Header() {
  return (
    <div className=" text-white rounded-lg min-h-[60vh]  p-6 max-w-md mx-auto mt-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-extrabold mb-2 text-white">Welcome to the Poll-Sense App</h1>
      <p className="text-white font-semibold">
        Empower policy-makers with real citizen input.{" "}
        <a href="/sign-up" className="text-white underline hover:text-blue-200 font-extrabold">
          Join now
        </a>{" "}
        to share your voice and help shape better policies!
      </p>
    </div>
  );
}
