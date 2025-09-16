import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

type Skill = string;

type Progress = {
  points: number;
  level: number;
  badges: string[];
  streak: number;
  milestonesCompleted: { skill: string; milestoneId: number }[];
  skillsCompleted: string[];
};

type SkillEntryProps = {
  skills: Skill[];
  onChange: (newSkills: Skill[]) => void;
};

function SkillEntry({ skills, onChange }: SkillEntryProps) {
  const [text, setText] = useState("");

  const addSkill = () => {
    const s = text.trim();
    if (!s) return;
    if (!skills.includes(s)) onChange([...skills, s]);
    setText("");
  };

  const removeSkill = (skill: Skill) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a skill and press Add (e.g., React)"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
      </div>

      <div className="mt-4">
        {skills.length === 0 && <p className="text-sm text-gray-500">No skills added yet</p>}
        <div className="flex flex-wrap gap-4 mt-2">
          {skills.map((s) => (
            <div
              key={s}
              className="flex items-center px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-sm"
            >
              <span>{s}</span>
              <button
                onClick={() => removeSkill(s)}
                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GrowthPlanner() {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(5);
  const [track, setTrack] = useState<"fast-track" | "standard" | "deep-dive">("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gapResult, setGapResult] = useState<any | null>(null);
  const [growthResult, setGrowthResult] = useState<any | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<{ [key: string]: number }>({});
  const [roadmapSaved, setRoadmapSaved] = useState(false);

  const handleAnalyze = async () => {
    if (!role.trim()) {
      setError("Please enter a target role");
      return;
    }
    setError(null);
    setLoading(true);
    setGapResult(null);
    setGrowthResult(null);
    setQuiz(null);
    setRoadmapSaved(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to continue");
        return;
      }

      const res = await fetch("http://localhost:5000/api/growth-planner/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role, userSkills: skills, weeklyHours, track }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
        } else if (res.status === 400) {
          setError(json.message || "Invalid input. Please check your target role.");
        } else {
          setError(json.message || "Failed to analyze. See server logs.");
        }
        return;
      }

      setGapResult(json.gap);
      setGrowthResult(json.growth);
      setProgress(json.progress);
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoadmap = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to continue");
        return;
      }

      const res = await fetch("http://localhost:5000/api/growth-planner/save-roadmap", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${role} Roadmap`,
          role,
          gap: gapResult,
          growth: growthResult,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRoadmapSaved(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setError(json.message || "Failed to save roadmap");
      }
    } catch (e: any) {
      setError(e.message || "Failed to save roadmap");
    }
  };

  const handleGenerateQuiz = async (skill: string, milestoneTitle: string, milestoneId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to continue");
        return;
      }

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
        setQuiz({ ...json.quiz, skill, milestoneTitle, milestoneId });
        setQuizAnswers(new Array(json.quiz.questions.length).fill(''));
      } else {
        setError(json.message || "Failed to generate quiz");
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate quiz");
    }
  };

  const handleQuizSubmit = async () => {
    const { skill, milestoneId } = quiz;
    const correctAnswers = quiz.questions.filter((q: any, i: number) => q.answer === quizAnswers[i]).length;
    const passThreshold = quiz.questions.length * 0.7; // 70% to pass
    if (correctAnswers >= passThreshold) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Please log in to continue");
          return;
        }

        const res = await fetch("http://localhost:5000/api/growth-planner/update-progress", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ role, skill, milestoneId }),
        });

        const json = await res.json();
        if (json.success) {
          setProgress(json.progress);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          setQuiz(null);
          setQuizAnswers([]);
          setQuizAttempts((prev) => ({ ...prev, [`${skill}:${milestoneId}`]: 0 })); // Reset attempts on success
        } else {
          setError(json.message);
        }
      } catch (e: any) {
        setError(e.message || "Failed to update progress");
      }
    } else {
      const key = `${skill}:${milestoneId}`;
      const attempts = (quizAttempts[key] || 0) + 1;
      setQuizAttempts((prev) => ({ ...prev, [key]: attempts }));
      setError(`Try again! You need at least 70% correct. Attempt: ${attempts}/3`);
      if (attempts >= 3) {
        setQuiz(null);
        setQuizAnswers([]);
        setQuizAttempts((prev) => ({ ...prev, [key]: 0 })); // Reset after max attempts
      } else {
        setQuizAnswers(new Array(quiz.questions.length).fill('')); // Reset answers for retake
      }
    }
  };

  const handleCompleteSkill = async (skill: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to continue");
        return;
      }

      const res = await fetch("http://localhost:5000/api/growth-planner/update-progress", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role, skill }),
      });

      const json = await res.json();
      if (json.success) {
        setProgress(json.progress);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setError(json.message);
      }
    } catch (e: any) {
      setError(e.message || "Failed to update progress");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showConfetti && <Confetti />}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Career Growth Adventure</h1>

      {/* Progress Dashboard */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-md mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24">
              <CircularProgressbar
                value={(progress.points % 100) * (100 / (progress.level === 5 ? 100 : 100))}
                text={`Level ${progress.level}`}
                styles={buildStyles({ pathColor: '#3b82f6', textColor: '#333', trailColor: '#d6d6d6' })}
              />
            </div>
            <div>
              <p className="text-gray-600"><strong>Points:</strong> {progress.points}</p>
              <p className="text-gray-600"><strong>Streak:</strong> {progress.streak} day{progress.streak !== 1 ? 's' : ''}</p>
              <p className="text-gray-600"><strong>Badges:</strong> {progress.badges.length ? progress.badges.join(', ') : 'None yet'}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Prompt Engineer"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills</label>
          <SkillEntry skills={skills} onChange={setSkills} />
        </div>

        <div className="flex gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours</label>
            <input
              type="number"
              min={1}
              max={40}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Track</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fast-track">Fast-track</option>
              <option value="standard">Standard</option>
              <option value="deep-dive">Deep-dive</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? "Generating…" : "Start My Adventure"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {gapResult && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills Gap Analysis</h2>
            <p className="text-gray-600">
              Role: <strong>{gapResult.role}</strong> — Match: <strong>{gapResult.matchPercentage}%</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Matched Skills</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {Array.isArray(gapResult.matchedSkills) && gapResult.matchedSkills.length > 0 ? (
                    gapResult.matchedSkills.map((m: any) => (
                      <li key={m.name}>
                        {m.name} <em>({m.importance})</em>
                      </li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Missing Skills</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {Array.isArray(gapResult.missingSkills) && gapResult.missingSkills.length > 0 ? (
                    gapResult.missingSkills.map((m: any) => (
                      <li key={m.name}>
                        {m.name} <em>({m.importance})</em>
                      </li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {growthResult && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Quest Log</h2>
            {Array.isArray(growthResult.plans) ? (
              growthResult.plans.map((plan: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl p-4 shadow-md mb-4"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    Quest: {plan.skill} <span className="text-sm text-gray-500">({plan.priority})</span>
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Duration: <strong>{plan.estimatedDurationWeeks} weeks</strong> — Type: {plan.learningPathType}
                  </p>

                  <div className="mt-3">
                    <strong className="text-gray-700">Milestones</strong>
                    <ul className="list-disc list-inside mt-2 text-gray-600">
                      {Array.isArray(plan.milestones) && plan.milestones.map((m: any) => (
                        <li key={m.id} className="flex items-center gap-2">
                          {progress?.milestonesCompleted?.some((mc: any) => mc.skill === plan.skill && mc.milestoneId === m.id) ? (
                            <span className="text-green-600">Completed</span>
                          ) : (
                            <button
                              onClick={() => handleGenerateQuiz(plan.skill, m.title, m.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Take Quiz for {m.title}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <strong className="text-gray-700">Resources</strong>
                    <ul className="list-disc list-inside mt-2 text-gray-600">
                      {Array.isArray(plan.resources) &&
                        plan.resources.map((r: any, i: number) => (
                          <li key={i}>
                            <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {r.title}
                            </a>{" "}
                            <span className="text-sm text-gray-500">({r.type})</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCompleteSkill(plan.skill)}
                    disabled={progress?.skillsCompleted?.includes(plan.skill) || false}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {progress?.skillsCompleted?.includes(plan.skill) ? 'Completed' : 'Mark Skill Complete'}
                  </button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No quests available</p>
            )}
            <button
              onClick={handleSaveRoadmap}
              disabled={roadmapSaved || !growthResult}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-green-600 disabled:cursor-not-allowed"
            >
              {roadmapSaved ? 'Roadmap Saved' : 'Save Roadmap to Progress'}
            </button>
          </div>
        )}

        {quiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quest Challenge: Quiz for {quiz.milestoneTitle}</h2>
            {quiz.questions.map((q: any, i: number) => (
              <div key={i} className="mb-6">
                <p className="text-lg font-medium text-gray-700 mb-2"><strong>{q.question}</strong></p>
                {q.options.map((opt: string, j: number) => (
                  <div key={j} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={opt}
                      checked={quizAnswers[i] === opt}
                      onChange={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[i] = opt;
                        setQuizAnswers(newAnswers);
                      }}
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-600">{opt}</span>
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={handleQuizSubmit}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit Quiz
            </button>
            {error && <p className="mt-2 text-red-600">{error}</p>}
          </motion.div>
        )}
      </div>
    </div>
  );
}