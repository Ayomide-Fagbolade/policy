"use client";
import React, { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import BTS from "./BTS";
import SimpleRanking from "./SimpleRanking";
import Survey from "./Survey";
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client' // <-- use client-side supabase
import { useRouter } from 'next/navigation'; // <-- Add this import




interface Rankingtype { [key: string]: number }

export default function FullExperiment({ userId, project_id }: { userId: string; project_id: string }) {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [formData, setFormData] = useState({
    ranking: {} as Rankingtype,
    bts: {} as Rankingtype,
    survey: {} as Rankingtype,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize handlers so their reference is stable
  const handleFormUpdate = useCallback((key: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: data,
    }));
  }, []);

  const setModeInParent = useCallback((mode: string) => {
    setMode(mode);
  }, []);

  // Memoize onUpdate handler for SimpleRanking
  const handleRankingUpdate = useCallback(
    ({ mode, policyResponse }) => {
      handleFormUpdate("ranking", policyResponse);
      setModeInParent(mode);
    },
    [handleFormUpdate, setModeInParent]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi && currentSlide > 0) {
      emblaApi.scrollPrev();
      setCurrentSlide((prev) => prev - 1);
    }
  }, [emblaApi, currentSlide]);

  // Helper to parse responses
  const parseResponses = (responseMode: string | null) => {
    const ranking = formData.ranking || {};
    const bts = formData.bts || {};
    const allPolicyIds = new Set([
      ...Object.keys(ranking),
      ...Object.keys(bts),
    ]);
    return Array.from(allPolicyIds).map((policyId) => ({
     
      response_project_id: project_id,
      response_policy_id: Number(policyId),
      response_group: String(responseMode), // <-- use mode here
      response_value: Number(ranking[policyId] ?? 0),
      response_bts_value: Number(bts[policyId] ?? 0),
      user_id: String(userId),
    }));
  };

  // Helper to parse survey responses
  const parseSurveyResponses = (responseMode: string | null) => {
    const survey = formData.survey || {}; // Not .surveyResponse!
    console.log("Survey data:", survey);
    return Object.entries(survey).map(([key, value]) => (
     
      {
      
      response_project_id: project_id,
      response_group: String(responseMode), // <-- use mode here
      response_value: Number(value ?? 0),
      response_survey: Number(key),
      user_id: userId,
    }));
  };

  const scrollNext = useCallback(() => {
    if (currentSlide === 0) {
      const parsed = parseResponses(mode);
      console.log("Ranking data submitted:", parsed);
    } else if (currentSlide === 1) {
      const parsed = parseResponses(mode);
      console.log("BTS data submitted:", parsed);
    } else if (currentSlide === 2) {
      handleSubmit(); // Call handleSubmit on last slide
    }
    if (emblaApi && currentSlide < 2) {
      emblaApi.scrollNext();
      setCurrentSlide((prev) => prev + 1);
    }
  }, [emblaApi, currentSlide, formData, userId, project_id, mode]);

  // Example: adjust these to your actual requirements
  const TOTAL_TOKENS = 10; // or whatever your total is
  const TOTAL_PEOPLE = 100; // or whatever your total is

  function isRankingComplete(ranking: Rankingtype, mode?: string | null) {
    const values = Object.values(ranking);
    const sum = values.reduce((a, b) => a + b, 0);
    if (mode === "allocation") {
      return values.length > 0 && sum === TOTAL_TOKENS;
    }
    return values.length > 0;
  }

  function isBTSComplete(bts: Rankingtype) {
    const values = Object.values(bts);
    const sum = 100;
    // All policies must have a value and total must match
    return values.length > 0 && sum === TOTAL_PEOPLE;
  }

  // Updated handleSubmit to POST data
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    // Validate before submitting
    if (!isRankingComplete(formData.ranking)) {
      setError("Please allocate all tokens before submitting.");
      return;
    }
    

    setError(null); // Clear error if validation passes

    const parsedSurvey = parseSurveyResponses(mode);
    const parsedResponse = parseResponses(mode);

    try {
      // Get Supabase client and session
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) throw new Error("You must be logged in to submit.");

      const accessToken = data.session.access_token;

      // POST survey responses with Authorization header
      const surveyRes = await fetch(`/api/${project_id}/${userId}/surveyresponsepost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedSurvey),
      });
      if (!surveyRes.ok) throw new Error("Failed to submit survey responses");

      // POST ranking/BTS responses with Authorization header
      const responseRes = await fetch(`/api/${project_id}/${userId}/responsepost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedResponse),
      });
      if (!responseRes.ok) throw new Error("Failed to submit ranking/BTS responses");

      alert("All forms submitted successfully!");
      router.push(`/protected/${project_id}`); // <-- Redirect after success
    } catch (err: any) {
      alert(err.message || "Submission failed.");
    }
  };
  const handleSurveyUpdate = useCallback(
    (data: { surveyResponse: { [questionId: number]: number } }) => {
      handleFormUpdate("survey", data.surveyResponse); // Only store the surveyResponse object
    },
    [handleFormUpdate]
  );

  // Optionally store the mode in state if needed for logic or debugging


  return (
    <div className="flex flex-col items-start justify-start w-full h-full relative bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-blue-950">
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-1 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition sm:left-2 md:left-6"
        aria-label="Previous Slide"
      >
        <span className="text-xl sm:text-2xl md:text-3xl">&#8592;</span>
      </button>
      {error && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
        {error}
      </div>
    )}
      {/* Show Next button on slides 0 and 1, Submit button on last slide */}
      {currentSlide < 2 ? (
        <button
          onClick={scrollNext}
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition sm:right-2 md:right-6"
          aria-label="Next Slide"
        >
          <span className="text-xl sm:text-2xl md:text-3xl">&#8594;</span>
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-md p-2 shadow-md transition sm:right-2 md:right-6 bg-blue-600 text-white hover:bg-green-700"
          aria-label="Submit All"
        >
          <span className="text-xl font-normal">Submit</span>
        </button>
      )}
      <div className="w-full h-full" ref={emblaRef}>
        <div className="embla__container w-full flex gap-2 sm:gap-6 md:gap-10 h-full">
          <div className="embla__slide w-full md:px-8 h-full">
            <div className="h-full overflow-y-auto">
              <SimpleRanking
                userId={userId}
                project_id={project_id}
                onUpdate={handleRankingUpdate}
                onModeReady={setModeInParent}
              />
            </div>
          </div>
          <div className="embla__slide w-full md:px-8 h-full">
            <div className="h-full overflow-y-auto">
              <Survey
                userId={userId}
                project_id={project_id}
                onUpdate={handleSurveyUpdate}
              />
            </div>
          </div>
          <div className="embla__slide w-full s md:px-8 h-full">
            <div className="h-full overflow-y-auto">
              <BTS
                userId={userId}
                project_id={project_id}
                onUpdate={(data) => handleFormUpdate("bts", data)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }