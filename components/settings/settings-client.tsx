"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Key,
  Sliders,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Star,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ApiKeyInfo {
  provider: string;
  isValid: boolean;
  maskedKey: string;
}

interface AutomationSettings {
  timezone: string;
  language: string;
  notificationPrefs: { email: boolean; inApp: boolean; extension: boolean };
  dailyLimits: { applies: number; posts: number; scrapes: number };
}

export function SettingsClient() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [addKeyOpen, setAddKeyOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [keysRes, settingsRes] = await Promise.all([
      fetch("/api/settings/api-keys"),
      fetch("/api/settings/automation"),
    ]);
    if (keysRes.ok) {
      const data = await keysRes.json();
      setApiKeys(data.keys);
    }
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setSettings(data.settings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-white/50 mt-1">Manage your account, API keys, and automation preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="ai-keys"><Key className="h-4 w-4 mr-2" />AI Keys</TabsTrigger>
          <TabsTrigger value="automation"><Sliders className="h-4 w-4 mr-2" />Automation</TabsTrigger>
          <TabsTrigger value="resume"><FileText className="h-4 w-4 mr-2" />Resume</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab session={session} updateSession={updateSession} />
        </TabsContent>
        <TabsContent value="ai-keys">
          <AIKeysTab apiKeys={apiKeys} loading={loading} addKeyOpen={addKeyOpen} setAddKeyOpen={setAddKeyOpen} onRefresh={fetchData} />
        </TabsContent>
        <TabsContent value="automation">
          <AutomationTab settings={settings} />
        </TabsContent>
        <TabsContent value="resume">
          <ResumeTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────
function ProfileTab({ session, updateSession }: { session: ReturnType<typeof useSession>["data"]; updateSession: ReturnType<typeof useSession>["update"] }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: session?.user?.name || "" },
  });

  const onSubmit = async (data: { name: string }) => {
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name }),
    });
    if (res.ok) {
      toast.success("Profile updated");
      updateSession({ name: data.name });
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your name and profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session?.user?.email || ""} disabled />
              <p className="text-xs text-white/30">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <PasswordChangeCard />
    </div>
  );
}

function PasswordChangeCard() {
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = async (data: { currentPassword: string; newPassword: string }) => {
    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Password updated");
      reset();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to update password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input id="currentPassword" type={showPwd ? "text" : "password"} {...register("currentPassword")} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type={showPwd ? "text" : "password"} {...register("newPassword")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── AI Keys Tab ────────────────────────────────
const providers = [
  { value: "gemini", label: "Google Gemini", description: "Free tier available — 15 RPM" },
  { value: "groq", label: "Groq", description: "Free tier — 30 RPM, very fast inference" },
  { value: "openai", label: "OpenAI", description: "GPT-4o-mini — affordable and powerful" },
  { value: "anthropic", label: "Anthropic", description: "Claude — coming soon" },
];

function AIKeysTab({
  apiKeys,
  loading,
  addKeyOpen,
  setAddKeyOpen,
  onRefresh,
}: {
  apiKeys: ApiKeyInfo[];
  loading: boolean;
  addKeyOpen: boolean;
  setAddKeyOpen: (open: boolean) => void;
  onRefresh: () => void;
}) {
  const [addingKey, setAddingKey] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { provider: "gemini", apiKey: "" },
  });

  const onAdd = async (data: { provider: string; apiKey: string }) => {
    setAddingKey(true);
    const res = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setAddingKey(false);

    if (res.ok) {
      toast.success(result.message);
      setAddKeyOpen(false);
      reset();
      onRefresh();
    } else {
      toast.error(result.error || "Failed to save key");
    }
  };

  const onDelete = async (provider: string) => {
    setDeletingProvider(provider);
    await fetch(`/api/settings/api-keys?provider=${provider}`, { method: "DELETE" });
    toast.success("API key removed");
    setDeletingProvider(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI API Keys</CardTitle>
              <CardDescription>Manage your BYOK (Bring Your Own Key) API keys. All keys are encrypted with AES-256-GCM.</CardDescription>
            </div>
            <Button onClick={() => setAddKeyOpen(true)} size="sm">
              <Plus className="h-4 w-4" />Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 rounded-lg bg-white/5" />)}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No API keys configured</p>
              <p className="text-white/25 text-xs mt-1">Add your free Gemini or Groq key to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => {
                const providerInfo = providers.find((p) => p.value === key.provider);
                return (
                  <div key={key.provider} className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {key.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{providerInfo?.label || key.provider}</p>
                        <p className="text-xs text-white/40 font-mono">{key.maskedKey}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(key.provider)}
                      disabled={deletingProvider === key.provider}
                    >
                      {deletingProvider === key.provider ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-400" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addKeyOpen} onOpenChange={setAddKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
            <DialogDescription>Your key will be encrypted with AES-256-GCM before storage.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select {...register("provider")} onChange={(e) => setValue("provider", e.target.value)}>
                {providers.filter((p) => p.value !== "anthropic").map((p) => (
                  <option key={p.value} value={p.value}>{p.label} — {p.description}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Paste your API key" {...register("apiKey")} autoComplete="off" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddKeyOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addingKey}>
                {addingKey ? <><Loader2 className="h-4 w-4 animate-spin" />Validating...</> : "Save & Validate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Automation Tab ─────────────────────────────
function AutomationTab({ settings }: { settings: AutomationSettings | null }) {
  const [saving, setSaving] = useState(false);
  const [limits, setLimits] = useState({
    applies: settings?.dailyLimits?.applies ?? 15,
    posts: settings?.dailyLimits?.posts ?? 2,
    scrapes: settings?.dailyLimits?.scrapes ?? 50,
  });
  const [notifs, setNotifs] = useState({
    email: settings?.notificationPrefs?.email ?? true,
    inApp: settings?.notificationPrefs?.inApp ?? true,
    extension: settings?.notificationPrefs?.extension ?? true,
  });

  useEffect(() => {
    if (settings) {
      setLimits(settings.dailyLimits);
      setNotifs(settings.notificationPrefs);
    }
  }, [settings]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/settings/automation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyLimits: limits, notificationPrefs: notifs }),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error("Failed to save");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Action Limits</CardTitle>
          <CardDescription>Set safe limits to avoid LinkedIn detection. Conservative defaults recommended.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          {[
            { key: "applies" as const, label: "Job Applications / Day", max: 50 },
            { key: "posts" as const, label: "Posts / Day", max: 10 },
            { key: "scrapes" as const, label: "Scrapes / Day", max: 200 },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{item.label}</Label>
                <span className="text-sm font-mono text-white/60">{limits[item.key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={item.max}
                value={limits[item.key]}
                onChange={(e) => setLimits({ ...limits, [item.key]: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how you want to be notified about automation events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          {[
            { key: "email" as const, label: "Email Notifications" },
            { key: "inApp" as const, label: "In-App Notifications" },
            { key: "extension" as const, label: "Extension Notifications" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <Label>{item.label}</Label>
              <Switch
                checked={notifs[item.key]}
                onCheckedChange={(checked) => setNotifs({ ...notifs, [item.key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Settings"}
      </Button>
    </div>
  );
}

// ─── Resume Tab ─────────────────────────────────

interface ResumeItem {
  _id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  contactInfo?: { name?: string; email?: string; phone?: string };
  skills?: string[];
  experience?: { company?: string; title?: string }[];
}

function ResumeTab() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [parseOpen, setParseOpen] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [rawText, setRawText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [expandedResume, setExpandedResume] = useState<string | null>(null);
  const [resumeDetail, setResumeDetail] = useState<Record<string, unknown> | null>(null);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/resume");
    if (res.ok) {
      const data = await res.json();
      setResumes(data.resumes || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const parseResume = async () => {
    if (!rawText.trim()) {
      toast.error("Please paste your resume text");
      return;
    }
    if (!resumeName.trim()) {
      toast.error("Please enter a name for this resume");
      return;
    }

    setParsing(true);
    const res = await fetch("/api/resume?action=parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, name: resumeName }),
    });
    setParsing(false);

    if (res.ok) {
      toast.success("Resume parsed and saved successfully");
      setParseOpen(false);
      setRawText("");
      setResumeName("");
      fetchResumes();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to parse resume");
    }
  };

  const deleteResume = async (id: string) => {
    const res = await fetch(`/api/resume?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Resume deleted");
      fetchResumes();
    } else {
      toast.error("Failed to delete resume");
    }
  };

  const setDefault = async (id: string) => {
    const res = await fetch(`/api/resume?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      toast.success("Default resume updated");
      fetchResumes();
    }
  };

  const viewDetail = async (id: string) => {
    if (expandedResume === id) {
      setExpandedResume(null);
      setResumeDetail(null);
      return;
    }
    const res = await fetch(`/api/resume`);
    if (res.ok) {
      const data = await res.json();
      const found = (data.resumes || []).find((r: ResumeItem) => r._id === id);
      setResumeDetail(found);
      setExpandedResume(id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>
                Upload and manage resumes. The AI will parse them into structured data for auto-applying.
              </CardDescription>
            </div>
            <Button onClick={() => setParseOpen(true)} size="sm">
              <Plus className="h-4 w-4" />Add Resume
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-white/5" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No resumes yet</p>
              <p className="text-white/25 text-xs mt-1">
                Paste your resume text to let AI parse it into structured data
              </p>
              <Button onClick={() => setParseOpen(true)} size="sm" className="mt-4">
                <Upload className="h-4 w-4" />Upload Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume._id}>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                    <button
                      onClick={() => viewDetail(resume._id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{resume.name}</p>
                          {resume.isDefault && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <Star className="h-2.5 w-2.5" />Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40">
                          {resume.contactInfo?.email || "No email"} ·{" "}
                          {resume.skills?.length || 0} skills ·{" "}
                          {resume.experience?.length || 0} positions ·{" "}
                          Added {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      {!resume.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDefault(resume._id)}
                          title="Set as default"
                        >
                          <Star className="h-4 w-4 text-white/30" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteResume(resume._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded resume detail */}
                  {expandedResume === resume._id && resumeDetail && (
                    <div className="ml-4 mt-1 mb-3 rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
                      {resumeDetail.summary ? (
                        <div>
                          <p className="text-xs font-medium text-white/60 mb-1">Summary</p>
                          <p className="text-xs text-white/50">{String(resumeDetail.summary)}</p>
                        </div>
                      ) : null}
                      {Array.isArray(resumeDetail.skills) &&
                        (resumeDetail.skills as string[]).length > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-white/60 mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {(resumeDetail.skills as string[]).map((s: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {Array.isArray(resumeDetail.experience) &&
                        (resumeDetail.experience as { company?: string; title?: string; startDate?: string; endDate?: string }[]).length > 0 ? (
                        <div>
                          <p className="text-xs font-medium text-white/60 mb-1">Experience</p>
                          <div className="space-y-1">
                            {(resumeDetail.experience as { company?: string; title?: string; startDate?: string; endDate?: string }[]).map(
                              (exp: { company?: string; title?: string; startDate?: string; endDate?: string }, i: number) => (
                                <p key={i} className="text-xs text-white/50">
                                  <span className="text-white/70">{exp.title}</span> at {exp.company}
                                  {exp.startDate && ` (${exp.startDate} - ${exp.endDate || "Present"})`}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parse Resume Dialog */}
      <Dialog open={parseOpen} onOpenChange={setParseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Sparkles className="h-5 w-5 inline-block mr-2 text-blue-400" />
              Add Resume (AI Parse)
            </DialogTitle>
            <DialogDescription>
              Paste your resume text below. AI will automatically extract contact info, experience, education, skills, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resume Name</Label>
              <Input
                placeholder="e.g., Software Engineer Resume, General Resume"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Resume Text</Label>
              <Textarea
                placeholder="Copy and paste your complete resume text here. The AI will structure it automatically..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
              />
              <p className="text-xs text-white/30">
                Tip: Copy text directly from your PDF or document for best results
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setParseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={parseResume} disabled={parsing || !rawText.trim() || !resumeName.trim()}>
              {parsing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Security Tab ───────────────────────────────
function SecurityTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Encryption</CardTitle>
          <CardDescription>How your data is protected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "API Key Encryption", value: "AES-256-GCM with per-key salt + IV" },
            { label: "Password Hashing", value: "bcrypt with 12 salt rounds" },
            { label: "Session Security", value: "JWT with HTTP-only cookies" },
            { label: "Rate Limiting", value: "5 attempts/min on auth endpoints" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <span className="text-sm text-white/70">{item.label}</span>
              <span className="text-xs font-mono text-emerald-400">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Your data belongs to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-white/40">
            LinkedBoost stores your data in MongoDB Atlas with encryption at rest.
            We never sell your data, track your browsing, or share information with third parties.
          </p>
          <Separator />
          <div className="flex gap-3">
            <Button variant="outline" size="sm">Export My Data</Button>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
