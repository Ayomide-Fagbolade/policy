"use client";
import { useState, useEffect } from 'react';

interface Policy {
  id: number;
  created_at: string;
  Policy_title: string;
  Policy_description: string;
  Policy_image_link: string | null;
  linked_policy_project: string;
}

interface PolicyResponse {
  [policyId: number]: number;
}

const BTS = ({
  userId,
  project_id,
  onUpdate,
}: {
  userId: string;
  project_id: string;
  onUpdate?: (data: PolicyResponse) => void;
}) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyResponse, setPolicyResponse] = useState<PolicyResponse>({});
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(100);
  

  // Fetch policies from API and initialize policyResponse
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch(`/api/${project_id}/policy`);
        const data = await res.json();
        setPolicies(data);
        // Initialize policyResponse for each policy
        const initialResponse: PolicyResponse = {};
        data.forEach((policy: Policy) => {
          initialResponse[policy.id] = 0;
        });
        setPolicyResponse(initialResponse);
      } catch (error) {
        setError("Failed to fetch policies");
      }
    };
    fetchPolicies();
  }, [project_id]);

  // Calculate remaining tokens whenever policyResponse changes
  useEffect(() => {
    const total = Object.values(policyResponse).reduce((acc, curr) => acc + curr, 0);
    setRemaining(100 - total);
    if (total === 100) {
      setError(null);
    }
  }, [policyResponse]);

  const handleInputChange = (id: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (numValue < 0) return;
    const oldValue = policyResponse[id] || 0;
    const diff = numValue - oldValue;
    const newTotal = Object.values(policyResponse).reduce((acc, curr) => acc + curr, 0) + diff;
    if (newTotal > 100) {
      setError("The total cannot exceed 100 people.");
      return;
    }
    const newPolicyResponse = { ...policyResponse, [id]: numValue };
    setPolicyResponse(newPolicyResponse);
    if (onUpdate && newTotal === 100) {
      onUpdate(newPolicyResponse);
    }
  };

  const adjustRating = (id: number, amount: number) => {
    const currentValue = policyResponse[id] || 0;
    const newValue = currentValue + amount;
    if (newValue < 0 || remaining - amount < 0) return;
    setPolicyResponse((prev) => ({ ...prev, [id]: newValue }));
  };

 
  return (
    <div className="px-10 py-4 bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-white   rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-white">For each of the following policies, estimate the portion of people out of 100, who would rank it among their top 3 policies</h1>
      <div className="bg-blue-50 p-4 rounded-md mb-6 flex justify-between items-center">
        <span className="font-medium text-blue-800">People remaining to allocate:</span>
        <span className={`text-xl font-bold ${remaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
          {remaining}
        </span>
      </div>
      <div className="space-y-6">
        {policies.map((policy) => (
          <div key={policy.id} className="p-4 border bg-white border-gray-200 rounded-md  transition-colors">
            <div className="mb-2">
              <label htmlFor={`policy-${policy.id}`} className="font-semibold text-gray-800">
                {policy.Policy_title}
              </label>
              {policy.Policy_description && (
                <p className="text-sm text-gray-600">{policy.Policy_description}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                onClick={() => adjustRating(policy.id, -1)}
                disabled={policyResponse[policy.id] <= 0}
              >
                -
              </button>
              <input
                type="number"
                id={`policy-${policy.id}`}
                value={policyResponse[policy.id] || ''}
                onChange={(e) => handleInputChange(policy.id, e.target.value)}
                min="0"
                max="100"
                className="w-16 text-center text-black border-gray-300 rounded-md text-lg"
              />
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                onClick={() => adjustRating(policy.id, 1)}
                disabled={remaining <= 0}
              >
                +
              </button>
              <span className="ml-2 text-gray-600">people</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm">
            <p className="font-medium">Total allocated: <span className={remaining === 0 ? 'text-green-600 font-bold' : 'text-blue-600'}>
              {100 - remaining}
            </span> / 100</p>
          </div>
          
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BTS;