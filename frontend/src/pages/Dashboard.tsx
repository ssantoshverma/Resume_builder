// src/pages/Dashboard.tsx (updated with Tailwind CSS and progress tracker)
import { motion } from 'framer-motion';
import {
  DocumentPlusIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Dashboard() {
  const userName = localStorage.getItem('userName') || 'John Doe';
  const userEmail = localStorage.getItem('userEmail') || 'john@example.com';
  const profilePhoto = localStorage.getItem('profilePhoto') || '';

  const stats = [
    {
      title: 'Resumes Created',
      value: '3',
      change: '+2 this month',
      icon: DocumentTextIcon,
      color: 'text-indigo-600'
    },
    {
      title: 'Last ATS Score',
      value: '87%',
      change: '+12% improved',
      icon: TrophyIcon,
      color: 'text-green-600'
    },
    {
      title: 'Profile Completion',
      value: '75%',
      change: 'Almost there!',
      icon: ArrowTrendingUpIcon,
      color: 'text-yellow-600'
    }
  ];

  const recentActivity = [
    { action: 'Created "Software Engineer Resume"', time: '2 hours ago' },
    { action: 'Updated profile information', time: '1 day ago' },
    { action: 'Optimized resume with AI', time: '3 days ago' },
    { action: 'Downloaded PDF resume', time: '1 week ago' }
  ];

  const tips = [
    "Use action verbs to make your achievements stand out",
    "Quantify your accomplishments with specific numbers",
    "Tailor your resume keywords to match the job description",
    "Keep your resume format clean and professional"
  ];

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

  const calculateOverallProgress = () => {
    if (roadmaps.length === 0) return 0;
    const totalProgress = roadmaps.reduce((acc, roadmap) => acc + calculateProgress(roadmap), 0);
    return Math.round(totalProgress / roadmaps.length);
  };

  const calculateProgress = (roadmap: any) => {
    const totalMilestones = roadmap.growth.plans.reduce((acc: number, plan: any) => acc + plan.milestones.length, 0);
    const completedMilestones = roadmap.progress.milestonesCompleted.length;
    return Math.round((completedMilestones / totalMilestones) * 100) || 0;
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-md bg-white flex items-center justify-center text-2xl font-extrabold text-indigo-700 select-none">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                userName.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <p className="mt-1 text-indigo-200 text-sm">{userEmail}</p>
            </div>
          </div>
          <Link
            to="/resume-builder"
            className="inline-flex items-center rounded-lg bg-white text-indigo-700 font-semibold px-5 py-2.5 shadow-md hover:shadow-indigo-400 transition-shadow duration-300"
          >
            <DocumentPlusIcon className="h-5 w-5 mr-1.5" />
            Create Resume
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 + 0.25, duration: 0.45 }}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-indigo-300 cursor-pointer transition-shadow duration-300 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-500 font-semibold tracking-wider uppercase text-xs">{stat.title}</p>
                <p className="text-4xl font-extrabold mt-1 text-gray-900">{stat.value}</p>
                <p className={`mt-1 font-medium text-sm ${stat.color}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md`}>
                <stat.icon className="h-8 w-8" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-md"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-5">Roadmap Progress</h2>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : roadmaps.length === 0 ? (
            <p className="text-gray-500">No roadmaps yet. Generate one in Growth Planner.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={calculateOverallProgress()}
                    text={`${calculateOverallProgress()}%`}
                    styles={buildStyles({ pathColor: '#3b82f6', textColor: '#333', trailColor: '#d6d6d6' })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                {roadmaps.map((roadmap: any) => (
                  <div key={roadmap._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{roadmap.title}</p>
                      <p className="text-sm text-gray-600">{calculateProgress(roadmap)}% Complete</p>
                    </div>
                    <Link to={`/progress/${roadmap._id}`} className="text-blue-600 hover:underline">View</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.55 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg"
        >
          <h2 className="text-white text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/resume-builder"
              className="flex items-center p-4 bg-white rounded-xl shadow-md hover:shadow-indigo-300 transition-shadow duration-300 cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-indigo-700 text-white mr-4">
                <DocumentPlusIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-md">Create New Resume</h3>
                <p className="mt-0.5 text-gray-600 text-sm">Start building your perfect resume</p>
              </div>
            </Link>

            <Link
              to="/ats-score"
              className="flex items-center p-4 bg-white rounded-xl shadow-md hover:shadow-green-300 transition-shadow duration-300 cursor-pointer"
            >
              <div className="p-2.5 rounded-lg bg-green-600 text-white mr-4">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-md">Optimize with AI</h3>
                <p className="mt-0.5 text-gray-600 text-sm">Get your ATS compatibility score</p>
              </div>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 border-b border-gray-200 pb-3 last:border-0"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                      <ClockIcon className="h-3.5 w-3.5 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.95, duration: 0.5 }}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-6 shadow-md"
          >
            <h2 className="text-xl font-extrabold text-yellow-900 mb-5 flex items-center gap-1.5">
              💡 Resume Tips
            </h2>
            <div className="space-y-5">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.12, duration: 0.35 }}
                  className="p-4 rounded-lg bg-yellow-200 border border-yellow-300 text-yellow-900 shadow-sm"
                >
                  <p className="text-sm font-medium">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}