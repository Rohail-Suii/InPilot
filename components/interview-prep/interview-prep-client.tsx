"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Building2,
  MessageSquare,
  DollarSign,
  Briefcase,
  Trash2,
  RefreshCw,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InterviewQuestion {
  question: string;
  suggestedAnswer: string;
  category: "behavioral" | "technical" | "situational" | "company";
}

interface InterviewPrepData {
  _id: string;
  jobApplicationId: string;
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  companyResearch: {
    overview: string;
    culture: string;
    recentNews: string[];
    competitors: string[];
  };
  salaryInsights: {
    min: number;
    max: number;
    median: number;
    source: string;
  };
  createdAt: string;
}

interface JobApplication {
  _id: string;
  jobTitle: string;
  company: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InterviewPrepClient() {
  const [preps, setPreps] = useState<InterviewPrepData[]>([]);
  const [selectedPrep, setSelectedPrep] = useState<InterviewPrepData | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("questions");

  const fetchPreps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/interview-prep");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreps(data.preps || []);
      if (data.preps?.length > 0 && !selectedPrep) {
        setSelectedPrep(data.preps[0]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load interview preps");
    } finally {
      setLoading(false);
    }
  }, [selectedPrep]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs?view=applications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(data.applications || []);
    } catch {
      // Silently handle - applications are optional context
    }
  }, []);

  useEffect(() => {
    fetchPreps();
    fetchApplications();
  }, [fetchPreps, fetchApplications]);

  const handleGenerate = async () => {
    if (!selectedAppId) {
      toast.error("Please select a job application");
      return;
    }
    try {
      setGenerating(true);
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobApplicationId: selectedAppId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedPrep(data.prep);
      toast.success("Interview prep generated");
      fetchPreps();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate interview prep");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/interview-prep?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Interview prep removed");
      if (selectedPrep?._id === id) setSelectedPrep(null);
      fetchPreps();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const categoryColors: Record<string, string> = {
    behavioral: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    technical: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    situational: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    company: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    behavioral: <MessageSquare className="h-3 w-3" />,
    technical: <Lightbulb className="h-3 w-3" />,
    situational: <HelpCircle className="h-3 w-3" />,
    company: <Building2 className="h-3 w-3" />,
  };

  const formatSalary = (amount: number) => {
    if (!amount) return "N/A";
    return `$${(amount / 1000).toFixed(0)}k`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interview Prep</h1>
          <p className="text-white/50 mt-1">
            AI-generated interview questions and company research
          </p>
        </div>
        <Button onClick={fetchPreps} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Generate New Prep */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            Generate Interview Prep
          </CardTitle>
          <CardDescription>
            Select a job application to prepare for the interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                <option value="">Select a job application...</option>
                {applications.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.jobTitle} at {app.company}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={generating || !selectedAppId}>
              {generating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Preps List */}
      {preps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/50">Previous Preparations</h3>
          <div className="flex gap-2 flex-wrap">
            {preps.map((prep) => (
              <Button
                key={prep._id}
                variant={selectedPrep?._id === prep._id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedPrep(prep);
                  setExpandedQuestions({});
                }}
                className="relative"
              >
                <Briefcase className="h-3 w-3 mr-1" />
                {prep.jobTitle} - {prep.company}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(prep._id);
                  }}
                  className="ml-2 text-white/30 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Prep Content */}
      {selectedPrep && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="questions">
              Questions ({selectedPrep.questions.length})
            </TabsTrigger>
            <TabsTrigger value="company">Company Research</TabsTrigger>
            <TabsTrigger value="salary">Salary Insights</TabsTrigger>
          </TabsList>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <div className="space-y-3">
              {(["behavioral", "technical", "situational", "company"] as const).map((category) => {
                const categoryQuestions = selectedPrep.questions.filter(
                  (q) => q.category === category
                );
                if (categoryQuestions.length === 0) return null;
                return (
                  <div key={category}>
                    <h4 className="text-white font-medium capitalize flex items-center gap-2 mb-2">
                      {categoryIcons[category]}
                      {category} Questions
                    </h4>
                    <div className="space-y-2">
                      {categoryQuestions.map((q, idx) => {
                        const globalIdx = selectedPrep.questions.indexOf(q);
                        const isExpanded = expandedQuestions[globalIdx];
                        return (
                          <Card key={idx}>
                            <CardContent className="p-0">
                              <button
                                className="w-full flex items-start justify-between p-4 text-left cursor-pointer"
                                onClick={() => toggleQuestion(globalIdx)}
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${categoryColors[q.category]}`}>
                                    {categoryIcons[q.category]}
                                    {q.category}
                                  </span>
                                  <p className="text-sm text-white/80 flex-1">{q.question}</p>
                                </div>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
                                )}
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-white/5 pt-3 ml-[60px]">
                                  <p className="text-xs text-white/40 mb-1">Suggested Answer</p>
                                  <p className="text-sm text-white/60 whitespace-pre-wrap">
                                    {q.suggestedAnswer}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Company Research Tab */}
          <TabsContent value="company">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    {selectedPrep.company} Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1">Company Overview</h4>
                    <p className="text-sm text-white/70">
                      {selectedPrep.companyResearch.overview || "No overview available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1">Culture</h4>
                    <p className="text-sm text-white/70">
                      {selectedPrep.companyResearch.culture || "No culture information available"}
                    </p>
                  </div>
                  {selectedPrep.companyResearch.recentNews.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/50 mb-1">Recent News</h4>
                      <ul className="space-y-1">
                        {selectedPrep.companyResearch.recentNews.map((news, i) => (
                          <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-blue-400">-</span> {news}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedPrep.companyResearch.competitors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/50 mb-1">Key Competitors</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrep.companyResearch.competitors.map((comp, i) => (
                          <Badge key={i}>{comp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Salary Insights - {selectedPrep.jobTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-white/50">Minimum</p>
                    <p className="text-2xl font-bold text-white">
                      {formatSalary(selectedPrep.salaryInsights.min)}
                    </p>
                  </div>
                  <div className="border border-emerald-500/30 rounded-lg p-4 text-center bg-emerald-500/5">
                    <p className="text-sm text-emerald-400">Median</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatSalary(selectedPrep.salaryInsights.median)}
                    </p>
                  </div>
                  <div className="border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-white/50">Maximum</p>
                    <p className="text-2xl font-bold text-white">
                      {formatSalary(selectedPrep.salaryInsights.max)}
                    </p>
                  </div>
                </div>
                {selectedPrep.salaryInsights.source && (
                  <p className="text-xs text-white/30 text-center">
                    Source: {selectedPrep.salaryInsights.source}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!selectedPrep && preps.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-16 w-16 text-white/20 mb-4" />
            <h3 className="text-white font-medium text-lg mb-2">No Interview Preps Yet</h3>
            <p className="text-white/50 text-center max-w-md">
              Select a job application above and generate AI-powered interview questions, company research, and salary insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
