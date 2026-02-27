import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";
import ProjectBrief3D from "@/components/3d/ProjectBrief3D";

type StepKey =
  | "projectName"
  | "projectType"
  | "plotSize"
  | "budget"
  | "location"
  | "stylePreferences"
  | "timeline"
  | "requirements"
  | "inspirationImages";

type Step = { label: string; key: StepKey; options?: string[] };

const steps: Step[] = [
  { label: "Project Name", key: "projectName" },
  { label: "Project Type", key: "projectType", options: ["residential", "commercial", "interior", "landscape"] },
  { label: "Plot Size (sq ft)", key: "plotSize" },
  { label: "Budget (USD)", key: "budget" },
  { label: "Location", key: "location" },
  { label: "Style Preferences", key: "stylePreferences" },
  { label: "Timeline", key: "timeline" },
  { label: "Requirements", key: "requirements" },
  { label: "Inspiration Images", key: "inspirationImages" },
];

export default function ProjectBriefWizard() {
  type ProjectBriefForm = {
    projectName: string;
    projectType: "residential" | "commercial" | "interior" | "landscape" | "";
    plotSize: string;
    budget: string;
    location: string;
    stylePreferences: string[];
    timeline: string;
    requirements: string;
    inspirationImages: string[];
    status?: "draft" | "submitted" | "in_progress" | "completed";
  };
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectBriefForm>({
    projectName: "",
    projectType: "",
    plotSize: "",
    budget: "",
    location: "",
    stylePreferences: [],
    timeline: "",
    requirements: "",
    inspirationImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = <K extends keyof ProjectBriefForm>(key: K, value: ProjectBriefForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setError("");
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (
        !form.projectName ||
        !form.projectType ||
        !form.plotSize ||
        !form.budget ||
        !form.location ||
        !form.timeline ||
        !form.requirements
      ) {
        setError("Please complete all required fields.");
        setLoading(false);
        return;
      }
      await api.createProjectBrief({
        projectName: form.projectName,
        projectType: form.projectType,
        plotSize: form.plotSize,
        budget: form.budget,
        location: form.location,
        stylePreferences: form.stylePreferences,
        timeline: form.timeline,
        requirements: form.requirements,
        inspirationImages: form.inspirationImages,
        status: "submitted",
      });
      navigate("/homeowner/dashboard?brief=done");
    } catch (e) {
      setError("Failed to submit project brief. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const current = steps[step];

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-2xl font-bold mb-4">Project Brief Wizard</h1>
          <div className="mb-6">Step {step + 1} of {steps.length}: <span className="font-semibold">{current.label}</span></div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-8">
            {/* 3D Visualization Preview on summary step */}
            {step === steps.length - 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">3D Plot Visualization</h2>
                <ProjectBrief3D plotSize={form.plotSize} style={(form.stylePreferences && form.stylePreferences[0]) || "modern"} />
              </div>
            )}
            {current.key === "projectName" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.projectName}
                onChange={e => handleChange("projectName", e.target.value)}
                placeholder="e.g. Modern Family Home"
              />
            )}
            {current.key === "projectType" && (
              <select
                className="dome-input w-full"
                value={form.projectType || ""}
                onChange={e => handleChange("projectType", e.target.value as ProjectBriefForm["projectType"])}
              >
                <option value="">Select type</option>
                {(current.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {current.key === "plotSize" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.plotSize || ""}
                onChange={e => handleChange("plotSize", e.target.value)}
              />
            )}
            {current.key === "budget" && (
              <input
                type="number"
                className="dome-input w-full"
                value={form.budget || ""}
                onChange={e => handleChange("budget", e.target.value)}
                min={0}
              />
            )}
            {current.key === "location" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.location || ""}
                onChange={e => handleChange("location", e.target.value)}
              />
            )}
            {current.key === "stylePreferences" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.stylePreferences.join(", ")}
                onChange={e => handleChange("stylePreferences", e.target.value.split(",").map((s: string) => s.trim()))}
                placeholder="e.g. modern, minimalist"
              />
            )}
            {current.key === "timeline" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.timeline || ""}
                onChange={e => handleChange("timeline", e.target.value)}
                placeholder="e.g. 6 months"
              />
            )}
            {current.key === "requirements" && (
              <textarea
                className="dome-input w-full"
                value={form.requirements || ""}
                onChange={e => handleChange("requirements", e.target.value)}
                rows={4}
                placeholder="Describe your requirements"
              />
            )}
            {current.key === "inspirationImages" && (
              <input
                type="text"
                className="dome-input w-full"
                value={form.inspirationImages.join(", ")}
                onChange={e => handleChange("inspirationImages", e.target.value.split(",").map((s: string) => s.trim()))}
                placeholder="Paste image URLs, comma separated"
              />
            )}
          </div>
          <div className="flex gap-4">
            <button
              className="dome-button px-8 py-2"
              onClick={handleBack}
              disabled={step === 0 || loading}
              type="button"
            >
              Back
            </button>
            <button
              className="dome-button px-8 py-2"
              onClick={handleNext}
              disabled={loading}
              type="button"
            >
              {step < steps.length - 1 ? "Next" : loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
