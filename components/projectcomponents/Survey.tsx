"use client";
import { useState, useEffect, useRef } from 'react';

interface SurveyQuestion {
  id: number;
  created_at: string;
  survey_question: string;
  linked_survey_project: string;
}

const likertScale = [
  "Strongly Disagree", "Disagree", "Somewhat Disagree", 
  "Neutral", "Somewhat Agree", "Agree", "Strongly Agree"
];

export default function Survey({
  userId,
  project_id,
  onUpdate,
}: {
  userId: string;
  project_id: string;
  onUpdate?: (data: { surveyResponse: { [questionId: number]: number } }) => void;
}) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Track last sent surveyResponse to avoid unnecessary updates
  const lastSurveyResponse = useRef<{ [questionId: number]: number } | null>(null);

  // Fetch survey questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/${project_id}/survey`);
        const data = await res.json();
        setQuestions(data);
        setResponses(new Array(data.length).fill(4)); // Default to Neutral (index 3)
        
      } catch (err) {
        setError("Failed to fetch survey questions.");
      }
    };
    fetchQuestions();
  }, [project_id]);

  const handleSliderChange = (index: number, value: number) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);

    // Prepare survey response data
    const surveyResponse: { [questionId: number]: number } = {};
    questions.forEach((question, idx) => {
      surveyResponse[question.id] = newResponses[idx];
    });

    // Log the updated survey response
    console.log("Updated surveyResponse:", surveyResponse);

    // Check if the response has changed
    if (JSON.stringify(surveyResponse) !== JSON.stringify(lastSurveyResponse.current)) {
      lastSurveyResponse.current = surveyResponse;
      onUpdate?.({ surveyResponse });
    }
  }

  // Effect to handle survey response updates
  useEffect(() => {
    if (questions.length && responses.length && onUpdate) {
      const surveyResponse: { [questionId: number]: number } = {};
      questions.forEach((question, idx) => {
        surveyResponse[question.id] = responses[idx];
      });
      lastSurveyResponse.current = surveyResponse;
      onUpdate({ surveyResponse });
    }
    // Only run when questions or responses change
  }, [questions, responses, onUpdate]);
 
  return (
    <div className="px-10 py-4 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4 text-center">User Satisfaction Survey</h1>
      <form >
        {questions.map((question, index) => (
          <div key={question.id} className="mb-6">
            <label className="block mb-2">{question.survey_question}</label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="7"
                value={responses[index] ?? 4}
                onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                className="slider w-full"
              />
              <div className="flex justify-between text-xs mt-2">
                <span className="text-gray-600">{likertScale[0]}</span>
                <span className="text-gray-600">{likertScale[6]}</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm">
                  Selected: {likertScale[(responses[index] || 4) - 1]}
                </span>
              </div>
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="text-center">
          
            
        </div>
      </form>
    </div>
  );

}
