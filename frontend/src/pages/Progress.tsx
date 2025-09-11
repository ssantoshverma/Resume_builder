// src/pages/Progress.tsx (new file for Progress page)
import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

export default function Progress() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to view progress");
          return;
        }

        const res = await fetch("http://localhost:5000/api/growth-planner/user-roadmaps", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        });

        const json = await res.json();
        if (json.success) {
          setRoadmaps(json.roadmaps);
        } else {
          setError(json.message || "Failed to fetch roadmaps");
        }
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  const calculateProgress = (roadmap: any) => {
    const totalMilestones = roadmap.growth.plans.reduce((acc: number, plan: any) => acc + plan.milestones.length, 0);
    const completedMilestones = roadmap.progress.milestonesCompleted.length;
    return Math.round((completedMilestones / totalMilestones) * 100) || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Roadmaps Progress</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : roadmaps.length === 0 ? (
        <p className="text-center text-gray-500">No roadmaps saved yet. Generate one in Growth Planner and save it.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap: any) => (
            <motion.div 
              key={roadmap._id}
              className="bg-white rounded-xl shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{roadmap.title}</h2>
              <div className="flex justify-center mb-4">
                <div style={{ width: 100, height: 100 }}>
                  <CircularProgressbar
                    value={calculateProgress(roadmap)}
                    text={`${calculateProgress(roadmap)}%`}
                    styles={buildStyles({ pathColor: '#3b82f6', textColor: '#333', trailColor: '#d6d6d6' })}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Role: {roadmap.role}</p>
              <p className="text-sm text-gray-600 mb-4">Created: {new Date(roadmap.createdAt).toLocaleDateString()}</p>
              <Link to={`/roadmap-details/${roadmap._id}`} className="text-blue-600 hover:text-blue-800 font-medium">View Details</Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}