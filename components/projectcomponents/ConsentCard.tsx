"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Card from "../ui/card";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function ConsentForm({ userId }: ConsentCardProps) {
  const [consented, setConsented] = useState(false);
  const [experimentCompleted, setExperimentCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const params = useParams();
  const pid = params.pid as string | undefined;
  const router = useRouter();

  useEffect(() => {
    const checkCompleted = async () => {
      if (!pid || !userId) {
        setLoading(false);
        return;
      }
      // Remove dashes from pid and userId
      const cleanPid = pid.replace(/-/g, "");
      const cleanUserId = String(userId).replace(/-/g, "");
      try {
        const res = await fetch(`/api/${cleanPid}/${cleanUserId}/newresponse`);
        const data = await res.json();
        console.log("Experiment completion check response:", data);
        if (Array.isArray(data) && data.length > 0) {
          setExperimentCompleted(true);
        }
      } catch (e) {
        console.error("Error checking experiment completion:", e); // log error
      } finally {
        setLoading(false);
      }
    };
    checkCompleted();
  }, [pid, userId]);

  const handleSubmit = async () => {
    console.log(pid, userId);
    setConsented(true);

    // Store consent in Supabase (client-side)
    const { error } = await supabase
      .from("Role")
      .insert([{ has_consented: true, id: userId, project_active: pid }]);
    router.push(`/protected/${pid}/experiment`);

    if (error) {
      console.error("Consent submission failed:", error);
    }
  };

  if (loading)
    return (
      <Card className="px-4 py-4 min-h-full flex items-start justify-center bg-gray-100">
        Loading...
      </Card>
    );
  if (experimentCompleted) {
    return (
      <Card className="px-4 py-4 min-h-full flex items-start text-blue-950 justify-center bg-gray-100">
        <p className="text-green-700 text-xl font-bold">
          Experiment already completed
        </p>
      </Card>
    );
  }

  return (
    <Card className="px-4 py-4  min-h-full text-blue-950 flex items-start justify-center bg-gray-100">
      {!consented ? (
        <div className="flex flex-col ">
          <h2 className="text-lg font-bold">Consent Agreement</h2>
          <p>By proceeding, you acknowledge and agree to the following terms:</p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Voluntary Participation:</strong> You may withdraw at any
              time.
            </li>
            <li>
              <strong>Data Usage & Privacy:</strong> Your data is securely
              handled.
            </li>
            <li>
              <strong>Responsibilities:</strong> Misuse may lead to restricted
              access.
            </li>
            <li>
              <strong>Right to Withdraw:</strong> Contact support to revoke
              consent.
            </li>
            <li>
              <strong>Acknowledgment:</strong> Clicking "I Agree" confirms
              understanding.
            </li>
          </ul>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            I Agree
          </button>
        </div>
      ) : (
        <p>Thank you for your consent!</p>
      )}
    </Card>
  );
}

interface ConsentCardProps {
  userId: string | null;
}