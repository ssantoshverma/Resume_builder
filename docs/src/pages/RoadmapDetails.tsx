import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

export default function RoadmapDetails() {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);

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

  const handleStartQuiz = async (skill: string, milestoneId: number, milestoneTitle: string) => {
    const storedQuiz = roadmap.progress.quizzes.find((q: any) => q.skill === skill && q.milestoneId === milestoneId);
    if (storedQuiz) {
      setQuiz({
        skill,
        milestoneId,
        milestoneTitle,
        questions: storedQuiz.questions
      });
      setQuizAnswers(new Array(storedQuiz.questions.length).fill(''));
      setQuizSubmitted(false);
      setQuizResults([]);
    } else {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/growth-planner/generate-quiz", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ skill, milestone: milestoneTitle }),
        });

        const json = await res.json();
        if (json.success) {
          setQuiz({ ...json.quiz, skill, milestoneId, milestoneTitle });
          setQuizAnswers(new Array(json.quiz.questions.length).fill(''));
          setQuizSubmitted(false);
          setQuizResults([]);
        } else {
          setError(json.message || "Failed to generate quiz");
        }
      } catch (e: any) {
        setError(e.message || "Failed to generate quiz");
      }
    }
  };

  const handleQuizSubmit = async () => {
    if (quizAnswers.includes('')) {
      setError("Please answer all questions before submitting.");
      return;
    }

    const { skill, milestoneId, questions } = quiz;
    const results = questions.map((q: any, i: number) => q.answer === quizAnswers[i]);
    setQuizResults(results);
    const correctAnswers = results.filter(r => r).length;

    setQuizSubmitted(true); // Trigger feedback display

    // Clear any previous error
    setError(null);

    if (correctAnswers >= questions.length * 0.7) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:5000/api/growth-planner/update-progress", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ role: roadmap.role, skill, milestoneId }),
        });

        const json = await res.json();
        if (json.success) {
          const updatedRoadmap = { ...roadmap };
          updatedRoadmap.progress = json.progress;
          setRoadmap(updatedRoadmap);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          setError(json.message || "Failed to update progress");
        }
      } catch (e: any) {
        setError(e.message || "Failed to update progress");
      }
    } else {
      setError(`You scored ${correctAnswers}/${questions.length}. Need at least 70% to pass. Review below and retry.`);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizSubmitted(false);
    setQuizResults([]);
    setQuizAnswers(new Array(quiz.questions.length).fill(''));
    setError(null);
  };

  const calculateProgress = (roadmap: any) => {
    const totalMilestones = roadmap.growth.plans.reduce((acc: number, plan: any) => acc + plan.milestones.length, 0);
    const completedMilestones = roadmap.progress.milestonesCompleted.length;
    return Math.round((completedMilestones / totalMilestones) * 100) || 0;
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error && !quiz) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  if (!roadmap) return <p className="text-center text-gray-500">Roadmap not found</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && <Confetti />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
        <Link to="/progress" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Progress</Link>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600"><strong>Role:</strong> {roadmap.role}</p>
            <p className="text-gray-600"><strong>Created:</strong> {new Date(roadmap.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills Gap</h2>
        <ul className="list-disc list-inside mb-6 text-gray-600">
          {roadmap.gap.missingSkills?.map((skill: any) => (
            <li key={skill.name}>{skill.name} ({skill.importance})</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Growth Plans</h2>
        {roadmap.growth.plans?.map((plan: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">{plan.skill} ({plan.priority})</h3>
            <p className="text-gray-600 mb-2">Duration: {plan.estimatedDurationWeeks} weeks | Type: {plan.learningPathType}</p>

            <h4 className="text-md font-medium text-gray-700 mt-2 mb-2">Milestones</h4>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              {plan.milestones.map((m: any) => (
                <li key={m.id} className="flex items-center justify-between py-1">
                  {m.title}
                  {roadmap.progress.milestonesCompleted.some((mc: any) => mc.skill === plan.skill && mc.milestoneId === m.id) ? (
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(plan.skill, m.id, m.title)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Take Quiz
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <h4 className="text-md font-medium text-gray-700 mb-2">Resources</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {plan.resources?.map((r: any, i: number) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {r.title}
                  </a> 
                  <span className="text-sm text-gray-500">({r.type})</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {quiz && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setQuiz(null)} // Close on backdrop click
        >
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz: {quiz.milestoneTitle}</h2>
            {quiz.questions.map((q: any, i: number) => (
              <div key={i} className="mb-6">
                <p className="text-lg font-medium text-gray-700 mb-2"><strong>{q.question}</strong></p>
                {q.options.map((opt: string, j: number) => (
                  <div
                    key={j}
                    className={`flex items-center p-2 rounded mb-2 border ${
                      quizSubmitted
                        ? opt === q.answer
                          ? 'bg-green-100 border-green-500'
                          : quizAnswers[i] === opt
                            ? 'bg-red-100 border-red-500'
                            : 'border-gray-300'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={opt}
                      checked={quizAnswers[i] === opt}
                      onChange={(e) => {
                        if (!quizSubmitted) {
                          const newAnswers = [...quizAnswers];
                          newAnswers[i] = e.target.value;
                          setQuizAnswers(newAnswers);
                        }
                      }}
                      disabled={quizSubmitted}
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">
                      {opt}
                      {quizSubmitted && (
                        opt === q.answer ? (
                          <span className="ml-2 text-green-600 font-medium">✓</span>
                        ) : quizAnswers[i] === opt ? (
                          <span className="ml-2 text-red-600 font-medium">✗</span>
                        ) : null
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={quizAnswers.includes('')}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <div>
                <p className="mb-2 text-gray-700">
                  You scored {quizResults.filter(r => r).length}/{quiz.questions.length}.
                  {quizResults.filter(r => r).length >= quiz.questions.length * 0.7
                    ? " Congratulations! You passed!"
                    : " You need at least 70% to pass. Retake if needed."}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleRetakeQuiz}
                    className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setQuiz(null)}
                    className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-2 text-red-600 bg-red-100 p-2 rounded">{error}</p>}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}