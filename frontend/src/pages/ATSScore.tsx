import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AppLayout from '../layouts/AppLayout';

export default function ATSScore() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [atsScore, setAtsScore] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      // Animate score counting up
      let score = 0;
      const targetScore = 87;
      const increment = () => {
        if (score < targetScore) {
          score += 1;
          setAtsScore(score);
          setTimeout(increment, 30);
        }
      };
      increment();
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const strengths = [
    { item: 'Professional formatting', status: 'good' },
    { item: 'Relevant keywords present', status: 'good' },
    { item: 'Contact information complete', status: 'good' },
    { item: 'Skills section well-structured', status: 'good' },
  ];

  const weaknesses = [
    { item: 'Missing industry-specific keywords', status: 'warning' },
    { item: 'Could use more quantified achievements', status: 'warning' },
    { item: 'Experience descriptions could be more detailed', status: 'poor' },
  ];

  const suggestions = [
    'Add more technical keywords like "React", "API", "Cloud Computing"',
    'Include quantified results (e.g., "Increased sales by 25%")',
    'Use more action verbs at the beginning of bullet points',
    'Consider adding a professional summary section',
    'Ensure consistent formatting throughout the document'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-success" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning" />;
      case 'poor':
        return <XCircleIcon className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success to-success';
    if (score >= 60) return 'from-warning to-warning';
    return 'from-destructive to-destructive';
  };

  if (!uploadedFile && !showResults) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">ATS Score Analysis</h1>
            <p className="text-muted-foreground text-lg">
              Upload your resume to get an instant ATS compatibility score and improvement suggestions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel"
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-muted rounded-xl p-12 text-center hover:border-primary transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <DocumentArrowUpIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Upload Your Resume
              </h3>
              <p className="text-muted-foreground mb-6">
                Drag and drop your PDF resume here, or click to browse
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer inline-flex items-center"
              >
                Choose File
              </label>
              <p className="text-sm text-muted-foreground mt-4">
                Supports PDF files only • Max file size: 10MB
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">ATS Compatibility</h3>
              <p className="text-sm text-muted-foreground">
                Check how well your resume passes through ATS systems
              </p>
            </div>

            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Keyword Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Identify missing keywords for your target role
              </p>
            </div>

            <div className="glass-card text-center">
              <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized recommendations for improvement
              </p>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  if (uploadedFile && !showResults) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">Resume Uploaded</h1>
            <p className="text-muted-foreground text-lg">Ready to analyze your resume for ATS compatibility</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <DocumentArrowUpIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{uploadedFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadedFile(null)}
                className="btn-glass"
              >
                Remove
              </button>
            </div>

            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Analyzing Your Resume</h3>
                <p className="text-muted-foreground">
                  Our AI is scanning your resume for ATS compatibility, keywords, and formatting...
                </p>
                <div className="mt-6 w-64 mx-auto bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  className="btn-primary flex items-center mx-auto"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Analyze Resume
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">ATS Analysis Results</h1>
          <p className="text-muted-foreground text-lg">Here's how your resume performs with ATS systems</p>
        </motion.div>

        {/* ATS Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${atsScore * 2.51} 251`}
                  className={`${getScoreGradient(atsScore)} transition-all duration-1000 ease-out`}
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>{atsScore}%</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">ATS Compatibility Score</h2>
          <p className="text-muted-foreground">
            {atsScore >= 80 ? 'Excellent! Your resume is highly ATS-friendly.' :
             atsScore >= 60 ? 'Good score with room for improvement.' :
             'Needs work to pass ATS screening effectively.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel"
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Strengths</h3>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getStatusIcon(strength.status)}
                  <span className="text-foreground">{strength.item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel"
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Areas for Improvement</h3>
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {getStatusIcon(weakness.status)}
                  <span className="text-foreground">{weakness.item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6">AI Recommendations</h3>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-foreground">{suggestion}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center space-x-4"
        >
          <button
            onClick={() => {
              setUploadedFile(null);
              setShowResults(false);
              setAtsScore(0);
            }}
            className="btn-glass flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Analyze Another Resume
          </button>
          <button className="btn-primary flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            Optimize with AI
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}