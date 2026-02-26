import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import { api, type ProjectBrief } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

type BriefFormState = {
  projectName: string;
  projectType: ProjectBrief["projectType"];
  plotSize: string;
  budget: string;
  location: string;
  stylePreferencesText: string;
  timeline: string;
  requirements: string;
  inspirationImagesText: string;
};

const emptyState: BriefFormState = {
  projectName: "",
  projectType: "residential",
  plotSize: "",
  budget: "",
  location: "",
  stylePreferencesText: "",
  timeline: "",
  requirements: "",
  inspirationImagesText: "",
};

const briefStatusLabel: Record<ProjectBrief["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_progress: "In Progress",
  completed: "Completed",
};

const HomeownerProjectBrief = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BriefFormState>(emptyState);
  const [activeBriefId, setActiveBriefId] = useState<string | null>(null);

  const { data: briefs = [] } = useQuery({
    queryKey: queryKeys.projectBriefs(),
    queryFn: api.getMyProjectBriefs,
  });

  const latestDraft = useMemo(
    () => briefs.find((brief) => brief.status === "draft") ?? briefs[0],
    [briefs],
  );

  useEffect(() => {
    if (!latestDraft) return;
    setActiveBriefId(latestDraft._id);
    setForm({
      projectName: latestDraft.projectName,
      projectType: latestDraft.projectType,
      plotSize: latestDraft.plotSize,
      budget: latestDraft.budget,
      location: latestDraft.location,
      stylePreferencesText: latestDraft.stylePreferences.join(", "),
      timeline: latestDraft.timeline,
      requirements: latestDraft.requirements,
      inspirationImagesText: latestDraft.inspirationImages.join("\n"),
    });
  }, [latestDraft]);

  const saveMutation = useMutation({
    mutationFn: (status: ProjectBrief["status"]) => {
      const payload = {
        projectName: form.projectName,
        projectType: form.projectType,
        plotSize: form.plotSize,
        budget: form.budget,
        location: form.location,
        stylePreferences: form.stylePreferencesText
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        timeline: form.timeline,
        requirements: form.requirements,
        inspirationImages: form.inspirationImagesText
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        status,
      };

      if (activeBriefId) {
        return api.updateProjectBrief(activeBriefId, payload);
      }
      return api.createProjectBrief(payload);
    },
    onSuccess: async () => {
      toast.success("Project brief saved successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectBriefs() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save project brief.");
    },
  });

  return (
    <PageTransition>
      <Header />
      <main>
        <Section className="pt-32" padding="small">
          <Container>
            <Reveal>
              <div className="mb-10">
                <span className="text-caption text-muted-foreground">Homeowner Workspace</span>
                <h1 className="text-display-lg mt-3">Project Brief Builder</h1>
                <p className="text-body text-muted-foreground mt-3 max-w-3xl">
                  Create a detailed brief so architects can align proposals to your project goals, budget, and timeline.
                </p>
              </div>
            </Reveal>

            <Grid cols={2} gap="default">
              <Reveal>
                <div className="dome-card p-6 md:p-8 space-y-5">
                  <h2 className="text-display-sm">Brief Details</h2>

                  <Input label="Project Name" value={form.projectName} onChange={(value) => setForm((prev) => ({ ...prev, projectName: value }))} />

                  <div>
                    <label className="text-caption text-muted-foreground">Project Type</label>
                    <select
                      value={form.projectType}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, projectType: event.target.value as ProjectBrief["projectType"] }))
                      }
                      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-body"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="interior">Interior</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <Input label="Plot Size" value={form.plotSize} onChange={(value) => setForm((prev) => ({ ...prev, plotSize: value }))} />
                  <Input label="Budget" value={form.budget} onChange={(value) => setForm((prev) => ({ ...prev, budget: value }))} />
                  <Input label="Location" value={form.location} onChange={(value) => setForm((prev) => ({ ...prev, location: value }))} />
                  <Input label="Timeline" value={form.timeline} onChange={(value) => setForm((prev) => ({ ...prev, timeline: value }))} />

                  <TextArea
                    label="Style Preferences"
                    hint="Comma-separated (e.g. Minimal, Contemporary, Tropical)"
                    value={form.stylePreferencesText}
                    onChange={(value) => setForm((prev) => ({ ...prev, stylePreferencesText: value }))}
                  />

                  <TextArea
                    label="Requirements"
                    value={form.requirements}
                    onChange={(value) => setForm((prev) => ({ ...prev, requirements: value }))}
                  />

                  <TextArea
                    label="Inspiration Images"
                    hint="One image URL per line"
                    value={form.inspirationImagesText}
                    onChange={(value) => setForm((prev) => ({ ...prev, inspirationImagesText: value }))}
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => saveMutation.mutate("draft")}
                      disabled={saveMutation.isPending}
                      className="px-5 py-3 rounded-full border border-border text-caption hover:border-foreground transition-colors disabled:opacity-60"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => saveMutation.mutate("submitted")}
                      disabled={saveMutation.isPending}
                      className="px-6 py-3 rounded-full bg-foreground text-background text-caption hover:bg-foreground/90 transition-colors disabled:opacity-60"
                    >
                      Submit Brief
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="dome-card p-6 md:p-8 h-full">
                  <h2 className="text-display-sm mb-6">Recent Briefs</h2>
                  <div className="space-y-4 max-h-[680px] overflow-auto pr-2">
                    {briefs.length === 0 ? (
                      <div className="dome-panel p-8 text-center">
                        <p className="text-body text-muted-foreground">No project briefs yet.</p>
                      </div>
                    ) : (
                      briefs.map((brief) => (
                        <button
                          key={brief._id}
                          onClick={() => {
                            setActiveBriefId(brief._id);
                            setForm({
                              projectName: brief.projectName,
                              projectType: brief.projectType,
                              plotSize: brief.plotSize,
                              budget: brief.budget,
                              location: brief.location,
                              stylePreferencesText: brief.stylePreferences.join(", "),
                              timeline: brief.timeline,
                              requirements: brief.requirements,
                              inspirationImagesText: brief.inspirationImages.join("\n"),
                            });
                          }}
                          className="w-full text-left dome-panel p-5 hover:border-foreground transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-body font-medium">{brief.projectName}</h3>
                            <span className="dome-chip">{briefStatusLabel[brief.status]}</span>
                          </div>
                          <p className="text-body-sm text-muted-foreground mt-2">
                            {brief.projectType} • {brief.location}
                          </p>
                          <p className="text-caption text-muted-foreground mt-3">
                            Updated {new Date(brief.updatedAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const Input = ({ label, value, onChange }: InputProps) => (
  <div>
    <label className="text-caption text-muted-foreground">{label}</label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-body"
    />
  </div>
);

type TextAreaProps = InputProps & {
  hint?: string;
};

const TextArea = ({ label, hint, value, onChange }: TextAreaProps) => (
  <div>
    <label className="text-caption text-muted-foreground">{label}</label>
    {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 text-body"
    />
  </div>
);

export default HomeownerProjectBrief;
