"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Database,
  Plus,
  Trash2,
  Loader2,
  Users,
  FileText,
  Building2,
  Search,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { scraperConfigSchema } from "@/lib/validators";
import { z } from "zod";

type ScraperConfigFormValues = z.input<typeof scraperConfigSchema>;

interface ScraperConfigItem {
  _id: string;
  name: string;
  type: string;
  keywords: string[];
  maxResults: number;
  isActive?: boolean;
  createdAt: string;
}

interface LeadItem {
  _id: string;
  type: string;
  data: Record<string, string>;
  sourceUrl?: string;
  createdAt: string;
}

export function ScraperClient() {
  const [activeTab, setActiveTab] = useState("configs");
  const [configs, setConfigs] = useState<ScraperConfigItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadTotal, setLeadTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  const fetchConfigs = useCallback(async () => {
    const res = await fetch("/api/scraper");
    if (res.ok) {
      const data = await res.json();
      setConfigs(data.configs);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams({ view: "leads" });
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/scraper?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
      setLeadTotal(data.total);
    }
  }, [typeFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchConfigs(), fetchLeads()]).then(() => setLoading(false));
  }, [fetchConfigs, fetchLeads]);

  const deleteConfig = async (id: string) => {
    await fetch(`/api/scraper?id=${id}`, { method: "DELETE" });
    toast.success("Config deleted");
    fetchConfigs();
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "profiles": return <Users className="h-4 w-4 text-blue-400" />;
      case "posts": return <FileText className="h-4 w-4 text-purple-400" />;
      case "companies": return <Building2 className="h-4 w-4 text-amber-400" />;
      default: return <Database className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Scraper</h2>
          <p className="text-white/50 mt-1">Scrape LinkedIn for leads and automate outreach</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />New Config
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configs">
            <Database className="h-4 w-4 mr-2" />Configurations
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />Leads ({leadTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-white/5" />)}
            </div>
          ) : configs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Database className="h-10 w-10 text-white/20" />
              <p className="text-white/40 text-sm mt-4">No scraper configs</p>
              <p className="text-white/25 text-xs mt-1">Create a configuration to start finding leads</p>
              <Button onClick={() => setAddOpen(true)} size="sm" className="mt-4">
                <Plus className="h-4 w-4" />Create Config
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {configs.map((config) => (
                <Card key={config._id} className="hover:border-white/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {typeIcon(config.type)}
                          <h3 className="font-semibold text-white">{config.name}</h3>
                          <Badge variant="info">{config.type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {config.keywords.map((kw) => (
                            <Badge key={kw} variant="default">{kw}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-white/30">Max {config.maxResults} results · Created {new Date(config.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteConfig(config._id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads">
          <div className="mb-4">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="profiles">Profiles</option>
              <option value="posts">Posts</option>
              <option value="companies">Companies</option>
            </Select>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-lg bg-white/5" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-white/20" />
              <p className="text-white/40 text-sm mt-4">No leads found</p>
              <p className="text-white/25 text-xs mt-1">Leads will appear once the extension scrapes LinkedIn</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <div
                  key={lead._id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-5 py-3"
                >
                  <div className="flex items-center gap-4">
                    {typeIcon(lead.type)}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {lead.data?.name || lead.data?.title || lead.data?.companyName || "Lead"}
                      </p>
                      <p className="text-xs text-white/40">
                        {lead.data?.headline || lead.data?.description || lead.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default">{lead.type}</Badge>
                    {lead.sourceUrl && (
                      <a
                        href={lead.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-white/60"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <span className="text-xs text-white/30">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddConfigDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={fetchConfigs} />
    </div>
  );
}

function AddConfigDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ScraperConfigFormValues>({
    resolver: zodResolver(scraperConfigSchema),
    defaultValues: {
      name: "",
      type: "posts",
      keywords: [],
      maxResults: 50,
    },
  });

  const addKeyword = () => {
    const trimmed = kwInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      const next = [...keywords, trimmed];
      setKeywords(next);
      setValue("keywords", next);
      setKwInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const next = keywords.filter((_, i) => i !== index);
    setKeywords(next);
    setValue("keywords", next);
  };

  const onSubmit = async (data: ScraperConfigFormValues) => {
    setSaving(true);
    const res = await fetch("/api/scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);

    if (res.ok) {
      toast.success("Config created");
      onOpenChange(false);
      reset();
      setKeywords([]);
      onSuccess();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create config");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Scraper Config</DialogTitle>
          <DialogDescription>Configure what to scrape from LinkedIn</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Config Name</Label>
            <Input placeholder="e.g., SaaS Founders in NYC" {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Scrape Type</Label>
            <Select {...register("type")}>
              <option value="posts">Posts</option>
              <option value="profiles">Profiles</option>
              <option value="companies">Companies</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((kw, i) => (
                <Badge key={i} variant="info" className="gap-1 cursor-pointer" onClick={() => removeKeyword(i)}>
                  {kw} ×
                </Badge>
              ))}
            </div>
            {errors.keywords && <p className="text-xs text-red-400">{errors.keywords.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Max Results</Label>
            <Input type="number" min={1} max={100} {...register("maxResults", { valueAsNumber: true })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create Config"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
