import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function RoadmapDetails() {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to view details");
          return;
        }

        const res = await fetch(`http://localhost:5000/api/growth-planner/roadmaps/${id}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        });

        const json = await res.json();
        if (json.success) {
          setRoadmap(json.roadmap);
        } else {
          setError(json.message || "Failed to fetch roadmap details");
        }
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  if (!roadmap) return <p className="text-center text-gray-500">Roadmap not found</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{roadmap.title}</h1>
      <div className="bg-white rounded-xl p-6 shadow-md">
        <p className="text-gray-600 mb-4"><strong>Role:</strong> {roadmap.role}</p>
        <p className="text-gray-600 mb-4"><strong>Created:</strong> {new Date(roadmap.createdAt).toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills Gap</h2>
        <ul className="list-disc list-inside mb-6">
          {roadmap.gap.missingSkills?.map((skill: any) => (
            <li key={skill.name} className="text-gray-600">{skill.name} ({skill.importance})</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Growth Plans</h2>
        {roadmap.growth.plans?.map((plan: any, idx: number) => (
          <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">{plan.skill} ({plan.priority})</h3>
            <p className="text-gray-600">Duration: {plan.estimatedDurationWeeks} weeks</p>
            <p className="text-gray-600">Type: {plan.learningPathType}</p>
            <h4 className="text-md font-medium text-gray-700 mt-2">Milestones</h4>
            <ul className="list-disc list-inside mt-1 text-gray-600">
              {plan.milestones.map((m: any) => (
                <li key={m.id}>{m.title}</li>
              ))}
            </ul>
            <h4 className="text-md font-medium text-gray-700 mt-2">Resources</h4>
            <ul className="list-disc list-inside mt-1 text-gray-600">
              {plan.resources.map((r: any, i: number) => (
                <li key={i}><a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{r.title}</a> ({r.type})</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}