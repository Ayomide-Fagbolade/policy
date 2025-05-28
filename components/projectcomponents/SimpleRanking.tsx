"use client";
import React, { useState, useEffect, useRef } from 'react';

interface Policy {
  id: number;
  created_at: string;
  Policy_title: string;
  Policy_description: string;
  Policy_image_link: string | null;
  linked_policy_project: string;
  rank: number;
  tokens: number;
}

interface Role {
  id: string;
  created_at: string;
  has_consented: boolean;
  group_id: number;
  project_active: string;
}

const SimpleRanking = ({
  userId,
  project_id,
  onUpdate,
  onModeReady,
}: {
  userId: string;
  project_id: string;
  onUpdate?: (data: { mode: string; policyResponse: { [key: number]: number } }) => void;
  onModeReady?: (mode: string) => void;
}) => {
  const [a, setA] = useState<number | null>(null); // a will be group_id
  const mode = a && a % 2 === 1 ? 'ranking' : 'allocation';
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [remainingTokens, setRemainingTokens] = useState(10);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true); // <-- loading state
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({}); // <-- add this

  // Fetch policies from API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch(`/api/${project_id}/policy`);
        const data = await res.json();
        const policiesWithRank = data.map((policy: any, idx: number) => ({
          ...policy,
          rank: idx + 1,
          tokens: 0,
        }));
        setPolicies(policiesWithRank);
      } catch (error) {
        console.error("Failed to fetch policies", error);
      } finally {
        setLoading(false); // <-- set loading to false after fetch
      }
    };
    fetchPolicies();
  }, [project_id]);

  // Fetch role and set a to group_id
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/${project_id}/${userId}/role`);
        const data = await res.json();
        if (data && data.length > 0) {
          setA(data[0].group_id);
        }
        console.log("Fetched role data:", data);
      } catch (error) {
        console.error("Failed to fetch role data", error);
      }
    };
    if (userId && project_id) {
      fetchRole();
    }
  }, [userId, project_id]);

  // Notify parent when mode is determined
  useEffect(() => {
    if (a !== null && onModeReady) {
      onModeReady(mode);
    }
  }, [a, mode, onModeReady]);

  // Track last sent policyResponse to avoid unnecessary updates
  const lastPolicyResponse = useRef<{ mode: string; policyResponse: { [key: number]: number } } | null>(null);

  // Call onUpdate whenever policies or mode change
  useEffect(() => {
    if (!onUpdate) return;

    let policyResponse: { [key: number]: number } = {};

    if (mode === 'ranking') {
      const sorted = [...policies].sort((a, b) => a.rank - b.rank);
      sorted.forEach((policy, idx) => {
        policyResponse[policy.id] = idx + 1;
      });
    } else {
      policies.forEach(policy => {
        policyResponse[policy.id] = policy.tokens || 0;
      });
    }

    const updateObj = { mode, policyResponse };

    // Only update if values have changed
    const last = lastPolicyResponse.current;
    const changed =
      !last ||
      last.mode !== updateObj.mode ||
      Object.keys(updateObj.policyResponse).some(
        key => updateObj.policyResponse[Number(key)] !== last.policyResponse?.[Number(key)]
      );

    if (changed) {
      onUpdate(updateObj);
      lastPolicyResponse.current = updateObj;
    }
  }, [policies, mode, onUpdate]);

  const movePolicy = (policy: Policy, direction: string) => {
    setUpdating(true);

    setTimeout(() => {
      const sortedPolicies = [...policies].sort((a, b) => a.rank - b.rank);

      const currentIndex = sortedPolicies.findIndex(p => p.id === policy.id);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sortedPolicies.length) {
        setUpdating(false);
        return;
      }

      const targetPolicy = sortedPolicies[targetIndex];
      const updatedPolicies = [...sortedPolicies];

      const tempRank = policy.rank;
      updatedPolicies[currentIndex] = {
        ...policy,
        rank: targetPolicy.rank,
      };
      updatedPolicies[targetIndex] = { ...targetPolicy, rank: tempRank };

      setPolicies(updatedPolicies);
      setUpdating(false);
    }, 300);
  };

  const allocateToken = (policyId: number, amount: number) => {
    if (updating) return;

    setPolicies(currentPolicies => {
      const updatedPolicies = currentPolicies.map(policy => {
        if (policy.id === policyId) {
          const newTokens = Math.max(0, (policy.tokens || 0) + amount);

          if (amount > 0 && remainingTokens <= 0) {
            return policy;
          }

          return { ...policy, tokens: newTokens };
        }
        return policy;
      });

      const totalAllocated = updatedPolicies.reduce((sum, policy) => sum + (policy.tokens || 0), 0);
      setRemainingTokens(10 - totalAllocated);

      return updatedPolicies;
    });
  };

  const saveTokenAllocation = () => {
    if (updating || remainingTokens !== 0) return;

    setUpdating(true);

    setTimeout(() => {
      setUpdating(false);
      alert('Token allocation saved!');
    }, 800);
  };

  // Sort policies by rank
  const sortedPolicies = [...policies].sort((a, b) => a.rank - b.rank);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-white text-xl font-bold animate-pulse">Loading...</span>
      </div>
    );
  }

  // Handler to toggle description
  const toggleDescription = (policyId: number) => {
    setExpanded(prev => ({
      ...prev,
      [policyId]: !prev[policyId],
    }));
  };

  return (
    <div className="bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-white  rounded-lg shadow-md  py-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold px-4">Policy Preference </h1>
      </div>

      <div className="p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            {mode === 'ranking' ? 'Rank the Policies' : 'Allocate 10 Tokens'}
          </h2>
          {updating && <span className="text-blue-500">Updating...</span>}
        </div>

        {mode === 'allocation' && (
          <div className=" p-4 rounded mb-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                Distribute 10 tokens across policies based on importance
              </p>
              <p className={`font-bold ${remainingTokens === 0 ? 'text-green-600' : 'text-white'}`}>
                {remainingTokens} tokens remaining
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 ">
          {sortedPolicies.map((policy, index) => (
            <div
              key={policy.id}
              className="flex items-center p-2  sm:p-4 border border-gray-200 rounded hover:bg-white/90 transition- bg-white"
            >
              {mode === 'ranking' ? (
                <>
                  <div className="flex-none w-8 h-8 flex items-center justify-center bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-white  rounded-full font-medium">
                    {index + 1}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-blue-950">{policy.Policy_title}</h3>
                    {expanded[policy.id] && (
                      <p className="text-blue-950">{policy.Policy_description}</p>
                    )}
                    <button
                      className="text-blue-700 underline text-sm mt-1"
                      onClick={() => toggleDescription(policy.id)}
                    >
                      {expanded[policy.id] ? 'See less' : 'See more'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      className="p-2 bg-green-700 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      onClick={() => movePolicy(policy, 'up')}
                      disabled={index === 0 || updating}
                      aria-label="Move up"
                    >
                      ↑
                    </button>

                    <button
                      className="p-2 bg-red-700 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      onClick={() => movePolicy(policy, 'down')}
                      disabled={index === sortedPolicies.length - 1 || updating}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-grow">
                    <h3 className="text-blue-950 font-bold">{policy.Policy_title}</h3>
                    {expanded[policy.id] && (
                      <p className="text-gray-600">{policy.Policy_description}</p>
                    )}
                    <button
                      className="text-blue-700 underline text-sm mt-1"
                      onClick={() => toggleDescription(policy.id)}
                    >
                      {expanded[policy.id] ? 'See less' : 'See more'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      onClick={() => allocateToken(policy.id, -1)}
                      disabled={(policy.tokens || 0) <= 0 || updating}
                      aria-label="Remove token"
                    >
                      -
                    </button>

                    <div className="w-10 text-center font-bold text-blue-950 text-lg">
                      {policy.tokens || 0}
                    </div>

                    <button
                      className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      onClick={() => allocateToken(policy.id, 1)}
                      disabled={remainingTokens <= 0 || updating}
                      aria-label="Add token"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {/* ...existing code... */}
      </div>
    </div>
  );
};

export default SimpleRanking;