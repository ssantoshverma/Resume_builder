import React, { useState } from "react";

type Milestone = {
  id: string;
  title: string;
  description?: string;
  order: number;
  completed: boolean;
};

type Resource = {
  type: string;
  title: string;
  url: string;
};

type Plan = {
  skill: string;
  priority: string;
  estimatedDurationWeeks: number;
  learningPathType: string;
  progressPercent: number;
  milestones: Milestone[];
  resources: Resource[];
};

export default function GrowthPathCard({
  plan,
  growthId,
  skillIndex,
}: {
  plan: Plan;
  growthId: string;
  skillIndex: number;
}) {
  const [localPlan, setLocalPlan] = useState(plan);

  const toggleMilestone = async (mid: string, completed: boolean) => {
    try {
      const res = await fetch(
        `/api/growth/${growthId}/milestone/${skillIndex}/${mid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // update UI with latest plan
      const updated = data.growth.plans[skillIndex];
      setLocalPlan(updated);
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">{localPlan.skill}</h4>
          <div className="text-sm text-gray-600">
            {localPlan.priority} • {localPlan.estimatedDurationWeeks} weeks •{" "}
            {localPlan.learningPathType}
          </div>
        </div>
        <div className="font-bold">{localPlan.progressPercent ?? 0}%</div>
      </div>

      {/* Milestones */}
      <ul className="mt-3 space-y-2">
        {localPlan.milestones.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <label
              className={`cursor-pointer ${
                m.completed ? "line-through text-gray-500" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={m.completed}
                onChange={(e) => toggleMilestone(m.id, e.target.checked)}
                className="mr-2"
              />
              {m.title}
            </label>
            <span className="text-xs text-gray-500">#{m.order}</span>
          </li>
        ))}
      </ul>

      {/* Resources */}
      <div className="mt-3 flex flex-wrap gap-2">
        {localPlan.resources.map((r, idx) => (
          <a
            key={idx}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 border rounded text-sm bg-blue-50 hover:bg-blue-100"
          >
            {r.type}: {r.title}
          </a>
        ))}
      </div>
    </div>
  );
}
