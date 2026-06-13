import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { quizService } from '../services/api';
import { 
  Sparkles, UploadCloud, FileText, Brain, Key, 
  HelpCircle, CheckCircle2, AlertCircle, ArrowRight, Zap, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export const SyllabusQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { show: showToast } = useToastStore();
  
  // Interactive options states
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [syllabusText, setSyllabusText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('gemini_user_api_key') || '');
  const [showKeyField, setShowKeyField] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Loading and progressive steps
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 40-40-20 calculations
  const countEasy = Math.round(numQuestions * 0.40);
  const countMedium = Math.round(numQuestions * 0.40);
  const countHard = numQuestions - countEasy - countMedium;

  // Persist API Key in localStorage for convenience
  useEffect(() => {
    if (customApiKey) {
      localStorage.setItem('gemini_user_api_key', customApiKey);
    } else {
      localStorage.removeItem('gemini_user_api_key');
    }
  }, [customApiKey]);

  // Progressive generation loading animation
  useEffect(() => {
    if (!loading) {
      setProgressStep(0);
      return;
    }

    const intervals = [
      setTimeout(() => setProgressStep(1), 1000),  // Parsing
      setTimeout(() => setProgressStep(2), 2500),  // Building prompts
      setTimeout(() => setProgressStep(3), 5000),  // AI generation
      setTimeout(() => setProgressStep(4), 11000), // Saving
    ];

    return () => intervals.forEach(clearTimeout);
  }, [loading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['.txt', '.md', '.json', '.csv', '.pdf', '.docx'];
      const fileExt = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(fileExt) || droppedFile.type === 'text/plain' || droppedFile.type === 'application/pdf' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(droppedFile);
        showToast(`File "${droppedFile.name}" selected!`, 'success');
      } else {
        showToast('Invalid file type. Please upload a .txt, .md, .json, .csv, .pdf, or .docx file.', 'error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'paste' && !syllabusText.trim()) {
      showToast('Please paste your syllabus/topic content first.', 'error');
      return;
    }
    
    if (activeTab === 'upload' && !file) {
      showToast('Please upload a syllabus file.', 'error');
      return;
    }

    try {
      setLoading(true);
      
      let response;
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('num_questions', numQuestions.toString());
        if (customApiKey) {
          formData.append('api_key', customApiKey);
        }
        response = await quizService.generateFromSyllabus(formData, customApiKey);
      } else {
        const payload = {
          syllabus_text: syllabusText,
          num_questions: numQuestions,
          api_key: customApiKey
        };
        response = await quizService.generateFromSyllabus(payload, customApiKey);
      }

      showToast('Quiz generated successfully!', 'success');
      navigate(`/quiz/${response.quiz_id}`);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to generate syllabus-based quiz. Check your connection or API Key.';
      showToast(errMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Title Banner */}
        <div className="relative overflow-hidden rounded-xl border border-violet-500/15 dark:border-violet-500/10 bg-gradient-to-br from-violet-600/10 via-violet-500/5 to-transparent dark:from-violet-600/10 dark:via-violet-500/5 dark:to-[#1A1A24] p-6 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,122,0,0.12),transparent_60%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 border border-violet-500/15 text-violet-600 dark:text-violet-400 mb-2">
                <Sparkles className="w-3 h-3 animate-pulse" /> AI Powered
              </span>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                AI Syllabus Quiz Generator
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-xl">
                Upload your course syllabus, PDF guide contents, or paste a customized topic list. 
                Our backend compiler generates a tailored, balanced practice set utilizing standard testing methodologies.
              </p>
            </div>
            <div className="hidden lg:flex w-24 h-24 rounded-full bg-violet-600/10 border border-violet-500/10 items-center justify-center shrink-0">
              <Brain className="w-10 h-10 text-violet-600 dark:text-violet-400 animate-pulse" />
            </div>
          </div>
        </div>

        {loading ? (
          /* Premium AI Compilation Loading Interface */
          <Card className="border-violet-500/20 bg-violet-500/5 backdrop-blur-md shadow-2xl relative overflow-hidden py-10">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 animate-shimmer" />
            <CardContent className="flex flex-col items-center justify-center py-6 gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-600 animate-spin" />
                <Brain className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <div className="text-center space-y-1 max-w-sm">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Assembling Personalized Quiz</h3>
                <p className="text-xs text-zinc-500">Gemini 2.5 Flash is analyzing your syllabus topics and generating questions...</p>
              </div>

              {/* Progress Steps */}
              <div className="w-full max-w-xs space-y-3 mt-4 text-left">
                {[
                  { id: 0, text: 'Processing inputs & resolving file encodings' },
                  { id: 1, text: 'Mapping topics to core computer science themes' },
                  { id: 2, text: 'Generating 40-40-20 Easy-Medium-Hard questions' },
                  { id: 3, text: 'Seeding Database and compiling quiz dashboard' }
                ].map((step) => {
                  const isDone = progressStep > step.id;
                  const isActive = progressStep === step.id;
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700 dark:border-zinc-800 bg-zinc-900 shrink-0" />
                      )}
                      <span className={cn(
                        'text-xs transition-colors',
                        isDone ? 'text-zinc-400 dark:text-zinc-600 line-through' :
                        isActive ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-zinc-500'
                      )}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Syllabus Content</CardTitle>
                  <CardDescription>Paste raw text or drag-and-drop a supported text format file</CardDescription>
                </div>
                
                {/* Expand API Key Section */}
                <button
                  type="button"
                  onClick={() => setShowKeyField(!showKeyField)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-zinc-200 dark:border-white/[0.04] text-[10px] text-zinc-600 dark:text-zinc-400 font-medium transition-all"
                >
                  <Key className="w-3 h-3 text-amber-500" />
                  {customApiKey ? 'Gemini Key Configured' : 'Configure Gemini Key'}
                </button>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Expanded API Key field */}
                {showKeyField && (
                  <div className="p-3.5 rounded-lg border border-amber-500/25 bg-amber-500/5 animate-fade-in space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-200">Personal API Key Fallback</p>
                        <p className="text-zinc-500 mt-0.5">
                          If the host backend doesn't have a global `GEMINI_API_KEY` configured in `.env`, 
                          supply your own key below. It remains cached locally in your browser workspace.
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 relative">
                      <Input
                        type="password"
                        placeholder="AIzaSy..."
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className="font-mono text-xs pr-10"
                      />
                      {customApiKey && (
                        <button
                          type="button"
                          onClick={() => setCustomApiKey('')}
                          className="absolute right-3 top-3 text-[10px] font-bold text-rose-500 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs selection */}
                <div className="flex border-b border-zinc-200/60 dark:border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={cn(
                      'px-4 py-2 text-xs font-semibold border-b-2 -mb-[2px] transition-all',
                      activeTab === 'paste'
                        ? 'border-violet-600 dark:border-violet-400 text-violet-700 dark:text-violet-300'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    )}
                  >
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      'px-4 py-2 text-xs font-semibold border-b-2 -mb-[2px] transition-all',
                      activeTab === 'upload'
                        ? 'border-violet-600 dark:border-violet-400 text-violet-700 dark:text-violet-300'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    )}
                  >
                    Upload File
                  </button>
                </div>

                {/* Content rendering based on tab */}
                {activeTab === 'paste' ? (
                  <div className="space-y-1">
                    <label htmlFor="syllabusText" className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Paste Syllabus / Topic Bulletins</label>
                    <textarea
                      id="syllabusText"
                      rows={8}
                      placeholder="e.g.&#10;1. Database Management Systems (DBMS)&#10;- Entity Relationship (ER) Diagrams, Schema refinement&#10;- SQL Queries: Joins, Nested Queries, Aggregates&#10;- Relational Algebra, Normalization (1NF, 2NF, 3NF, BCNF)&#10;- Transactions: ACID Properties, Concurrency Control (2PL, Locks)..."
                      className="w-full text-xs rounded-lg border border-border/30 bg-[#15151E] p-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all font-mono"
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3',
                      isDragOver 
                        ? 'border-violet-500 bg-violet-500/5' 
                        : 'border-zinc-200 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.1] bg-[#090909]/40'
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".txt,.md,.json,.csv,.pdf,.docx"
                      onChange={handleFileChange}
                    />
                    
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-white/[0.05]">
                      <UploadCloud className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center justify-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(2)} KB • Click or drag to replace</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Drag & Drop Syllabus File</p>
                        <p className="text-[10px] text-zinc-500">Supports .txt, .md, .json, .csv, .pdf, .docx files up to 5MB</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customization and Difficulty distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Properties</CardTitle>
                <CardDescription>Tune your quiz sizes and explore the difficulty allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question size selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Questions</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded border border-violet-500/10">
                      {numQuestions} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {[10, 15, 20, 30].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setNumQuestions(size)}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-semibold border transition-all',
                          numQuestions === size
                            ? 'bg-violet-600/15 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300'
                            : 'border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-500'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty 40-40-20 Visualizer */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Difficulty Distribution Breakdown</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Strict 40-40-20 Split
                    </span>
                  </div>

                  {/* Progressive visual bar */}
                  <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-800 border border-zinc-200/10">
                    <div 
                      className="bg-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/20" 
                      style={{ width: '40%' }} 
                      title="40% Easy"
                    />
                    <div 
                      className="bg-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20" 
                      style={{ width: '40%' }} 
                      title="40% Medium"
                    />
                    <div 
                      className="bg-rose-500 transition-all duration-300 shadow-lg shadow-rose-500/20" 
                      style={{ width: '20%' }} 
                      title="20% Hard"
                    />
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1.5">
                    <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Easy (40%)</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-emerald-400 mt-1">{countEasy}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">Foundational QA</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                      <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest leading-none">Medium (40%)</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-amber-400 mt-1">{countMedium}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">Standard Refinement</p>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/15">
                      <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none">Hard (20%)</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-rose-400 mt-1">{countHard}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">Advanced Architecture</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                className="w-1/3"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="w-2/3 flex items-center justify-center gap-2 group text-sm"
              >
                Compile AI Syllabus Quiz
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  };
