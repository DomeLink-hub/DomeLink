import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Crown, MapPin, Sparkles, ShieldCheck, BriefcaseBusiness, BadgeCheck, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import { FileUpload } from "@/components/ui/FileUpload";
import { api, type ArchitectOnboardingPayload, type ArchitectOnboardingState } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getOnboardingDraftKey } from "@/lib/onboardingDraft";

const storageKey = "domelink_architect_onboarding_draft";

const expertiseOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "interiorDesign", label: "Interior Design" },
  { value: "luxuryVillas", label: "Luxury Villas" },
  { value: "sustainableArchitecture", label: "Sustainable Architecture" },
  { value: "vastuConsultation", label: "Vastu Consultation" },
  { value: "farmhouseDesign", label: "Farmhouse Design" },
  { value: "apartmentProjects", label: "Apartment Projects" },
] as const;

const styleOptions = [
  { value: "modern", label: "Modern" },
  { value: "minimalist", label: "Minimalist" },
  { value: "contemporary", label: "Contemporary" },
  { value: "traditional", label: "Traditional" },
  { value: "luxury", label: "Luxury" },
  { value: "industrial", label: "Industrial" },
  { value: "tropical", label: "Tropical" },
] as const;

const citySuggestions = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kochi", "Jaipur", "Gurgaon"];

const steps = [
  { id: 1, label: "Professional Information", description: "Tell DomeLink who you are and where you practice." },
  { id: 2, label: "Expertise Selection", description: "Choose the project types you actually lead." },
  { id: 3, label: "Design Styles", description: "Define the visual language clients should expect." },
  { id: 4, label: "Pricing & Consultation", description: "Set your fee structure and engagement range." },
  { id: 5, label: "Cities Served", description: "Map your operating geography for discovery." },
  { id: 6, label: "Availability", description: "Tell clients how they can work with you." },
  { id: 7, label: "Portfolio Upload", description: "Upload the visual proof that backs your reputation." },
  { id: 8, label: "Review & Submit", description: "Confirm everything before you unlock the dashboard." },
] as const;

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type FormState = ArchitectOnboardingPayload & {
  additionalCity: string;
};

const defaultForm: FormState = {
  firmName: "",
  coaRegistrationNumber: "",
  gstNumber: "",
  yearsOfExperience: undefined,
  experience: "",
  teamSize: undefined,
  city: "",
  state: "",
  serviceCities: [],
  expertise: [],
  workingStyles: [],
  consultationFee: 0,
  startingProjectBudget: undefined,
  maximumProjectBudget: undefined,
  onlineConsultation: true,
  offlineConsultation: false,
  siteVisitAvailable: false,
  profilePhoto: "",
  heroImage: "",
  portfolioImages: [],
  awards: [],
  certifications: [],
  about: "",
  additionalCity: "",
};

const inputClass = "dome-input";

const sectionCard = "dome-card border border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)]";

const isFilled = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  if (typeof value === "boolean") return value;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};

const ArchitectOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refresh, user } = useAuth();
  const userId = user?._id ?? user?.id ?? null;
  const draftKey = useMemo(() => (userId ? getOnboardingDraftKey("architect", userId) : null), [userId]);
  const [stepIndex, setStepIndex] = useState<StepIndex>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [onboardingState, setOnboardingState] = useState<ArchitectOnboardingState | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [savedState, draft] = await Promise.all([
          api.getArchitectOnboarding().catch(() => null),
          Promise.resolve(draftKey ? window.localStorage.getItem(draftKey) : null),
        ]);

        if (!active) return;

        if (savedState) {
          setOnboardingState(savedState);
          setForm((current) => ({
            ...current,
            ...(savedState.onboarding || {}),
            serviceCities: savedState.onboarding.serviceCities || [],
            expertise: savedState.onboarding.expertise || [],
            workingStyles: savedState.onboarding.workingStyles || [],
            portfolioImages: savedState.onboarding.portfolioImages || [],
            awards: savedState.onboarding.awards || [],
            certifications: savedState.onboarding.certifications || [],
          }));
        }

        if (draft) {
          try {
            const parsed = JSON.parse(draft) as Partial<FormState> & { stepIndex?: number };
            setStepIndex(Math.min(Math.max(Number(parsed.stepIndex ?? 0), 0), 7) as StepIndex);
            setForm((current) => ({
              ...current,
              ...parsed,
              serviceCities: Array.isArray(parsed.serviceCities) ? parsed.serviceCities : current.serviceCities,
              expertise: Array.isArray(parsed.expertise) ? parsed.expertise : current.expertise,
              workingStyles: Array.isArray(parsed.workingStyles) ? parsed.workingStyles : current.workingStyles,
              portfolioImages: Array.isArray(parsed.portfolioImages) ? parsed.portfolioImages : current.portfolioImages,
              awards: Array.isArray(parsed.awards) ? parsed.awards : current.awards,
              certifications: Array.isArray(parsed.certifications) ? parsed.certifications : current.certifications,
            }));
          } catch {
            if (draftKey) window.localStorage.removeItem(draftKey);
          }
        }

        setDraftLoaded(true);
      } catch {
        toast.error("Unable to load onboarding data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded || submitted) return;
    if (!draftKey) return;
    window.localStorage.setItem(draftKey, JSON.stringify({ stepIndex, ...form }));
  }, [draftKey, draftLoaded, form, stepIndex, submitted]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleValue = (key: "expertise" | "workingStyles", value: string) => {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      } as FormState;
    });
  };

  const toggleAvailability = (key: "onlineConsultation" | "offlineConsultation" | "siteVisitAvailable") => {
    setForm((current) => ({ ...current, [key]: !current[key] }));
  };

  const addServiceCity = () => {
    const city = form.additionalCity.trim();
    if (!city) return;
    setForm((current) => ({
      ...current,
      serviceCities: Array.from(new Set([...(current.serviceCities || []), city])),
      additionalCity: "",
    }));
  };

  const removeFromList = (key: "serviceCities" | "portfolioImages" | "awards" | "certifications", value: string) => {
    setForm((current) => ({
      ...current,
      [key]: (current[key] || []).filter((item) => item !== value),
    }) as FormState);
  };

  const validateStep = (index: number, checkAll = false) => {
    const nextErrors: Record<string, string> = checkAll ? {} : { ...errors };

    const validateZero = () => {
      delete nextErrors.firmName;
      delete nextErrors.city;
      delete nextErrors.experience;
      if (!form.firmName?.trim()) nextErrors.firmName = "Firm name is required.";
      if (!form.city?.trim()) nextErrors.city = "City is required.";
      if (!form.experience?.trim()) nextErrors.experience = "Experience is required.";
    };

    const validateOne = () => {
      delete nextErrors.expertise;
      if (form.expertise.length === 0) nextErrors.expertise = "Select at least one expertise.";
    };

    const validateTwo = () => {
      delete nextErrors.workingStyles;
      if (form.workingStyles.length === 0) nextErrors.workingStyles = "Select at least one style.";
    };

    const validateThree = () => {
      delete nextErrors.consultationFee;
      if (!form.consultationFee || form.consultationFee < 1) nextErrors.consultationFee = "Consultation fee is required.";
    };

    if (checkAll) {
      validateZero();
      validateOne();
      validateTwo();
      validateThree();
    } else {
      if (index === 0) validateZero();
      if (index === 1) validateOne();
      if (index === 2) validateTwo();
      if (index === 3) validateThree();
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveDraft = async (shouldComplete = false) => {
    if (shouldComplete) {
      if (!validateStep(stepIndex, true)) {
        toast.error("Please fill all required fields across all steps.");
        return;
      }
    } else {
      if (!validateStep(stepIndex)) return;
    }

    setSaving(true);
    try {
      const payload = {
        firmName: form.firmName || undefined,
        coaRegistrationNumber: form.coaRegistrationNumber || undefined,
        gstNumber: form.gstNumber || undefined,
        yearsOfExperience: form.yearsOfExperience,
        experience: form.experience || undefined,
        teamSize: form.teamSize,
        city: form.city || undefined,
        state: form.state || undefined,
        serviceCities: form.serviceCities?.length ? form.serviceCities : undefined,
        expertise: form.expertise?.length ? form.expertise : undefined,
        workingStyles: form.workingStyles?.length ? form.workingStyles : undefined,
        consultationFee: form.consultationFee || undefined,
        startingProjectBudget: form.startingProjectBudget,
        maximumProjectBudget: form.maximumProjectBudget,
        onlineConsultation: form.onlineConsultation,
        offlineConsultation: form.offlineConsultation,
        siteVisitAvailable: form.siteVisitAvailable,
        profilePhoto: form.profilePhoto || undefined,
        heroImage: form.heroImage || undefined,
        portfolioImages: form.portfolioImages?.length ? form.portfolioImages : undefined,
        awards: form.awards?.length ? form.awards : undefined,
        certifications: form.certifications?.length ? form.certifications : undefined,
        about: form.about || undefined,
      } satisfies Partial<ArchitectOnboardingPayload>;

      const result = shouldComplete ? await api.createArchitectOnboarding(payload as ArchitectOnboardingPayload) : await api.updateArchitectOnboarding(payload);
      setOnboardingState(result);
      await refresh();
      // Invalidate profile and the full architects list so /explore shows this architect immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
        queryClient.invalidateQueries({ queryKey: ["architects"] }),
      ]);
      if (shouldComplete) {
        setSubmitted(true);
        if (draftKey) window.localStorage.removeItem(draftKey);
        toast.success("Architect onboarding completed.");
        navigate("/architect/dashboard", { replace: true });
      } else {
        toast.success("Progress saved.");
      }
    } catch (error: any) {
      const issues = Array.isArray(error?.issues) ? error.issues : [];
      if (issues.length > 0) {
        const issueMap: Record<string, string> = {};
        for (const issue of issues) issueMap[issue.path || "form"] = issue.message;
        setErrors(issueMap);
      } else {
        toast.error(error?.message || "Unable to save architect onboarding.");
      }
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    if (!validateStep(stepIndex)) return;
    await saveDraft(false);
    setStepIndex((current) => Math.min(current + 1, 7) as StepIndex);
  };

  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0) as StepIndex);

  const completion = onboardingState?.profileCompletionPercentage ?? 0;

  const summaryItems = useMemo(() => [
    { label: "Firm", value: form.firmName || "Not set" },
    { label: "Experience", value: form.experience || "Not set" },
    { label: "Consultation Fee", value: form.consultationFee ? `₹${form.consultationFee.toLocaleString("en-IN")}` : "Not set" },
    { label: "Cities Served", value: form.serviceCities?.length ? `${form.serviceCities.length} cities` : "Not set" },
    { label: "Styles", value: form.workingStyles.length ? `${form.workingStyles.length} styles` : "Not set" },
    { label: "Availability", value: [form.onlineConsultation, form.offlineConsultation, form.siteVisitAvailable].filter(Boolean).length ? "Configured" : "Not set" },
  ], [form]);

  if (loading) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Header variant="transparent" />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(180deg,rgba(19,16,13,0.98),rgba(10,8,6,1))]" />
        <div className="absolute inset-0 -z-10 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <DomeHero
          kicker="Architect Onboarding"
          title={
            <>
              Build your <span className="text-primary">professional profile</span>
            </>
          }
          subtitle="Create a premium studio profile that powers discovery, recommendations, and client trust across DomeLink."
          imageUrl="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        <Section padding="small" className="pb-28">
          <Container>
            <Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
                <div className={sectionCard + " p-6 md:p-8"}>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <span className="dome-kicker">Step {currentStep.id} of 8</span>
                      <h2 className="text-display-sm mt-2">{currentStep.label}</h2>
                      <p className="text-body-sm text-muted-foreground mt-2">{currentStep.description}</p>
                    </div>
                    <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                      <span className="text-display-sm">{progress}%</span>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-white/8 overflow-hidden mb-8">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-300 to-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setStepIndex(index as StepIndex)}
                        className={`rounded-2xl border px-4 py-3 text-left transition-colors ${index === stepIndex ? "border-primary bg-primary/10" : "border-border/60 bg-background/40 hover:border-border"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-caption text-muted-foreground">0{step.id}</span>
                          {index < stepIndex ? <Check className="h-4 w-4 text-emerald-400" /> : null}
                        </div>
                        <div className="mt-1 text-body-sm font-medium">{step.label}</div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {stepIndex === 0 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-5"
                      >
                        <Grid cols={2} gap="default">
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Firm Name *</span>
                            <input value={form.firmName} onChange={(e) => setField("firmName", e.target.value)} className={inputClass} placeholder="Studio / Firm name" />
                            {errors.firmName && <p className="text-xs text-red-400">{errors.firmName}</p>}
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">City *</span>
                            <input value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} placeholder="Bangalore" />
                            {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">State</span>
                            <input value={form.state || ""} onChange={(e) => setField("state", e.target.value)} className={inputClass} placeholder="Karnataka" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Years of Experience</span>
                            <input type="number" min={0} value={form.yearsOfExperience ?? ""} onChange={(e) => setField("yearsOfExperience", e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="12" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">COA Registration No.</span>
                            <input value={form.coaRegistrationNumber || ""} onChange={(e) => setField("coaRegistrationNumber", e.target.value)} className={inputClass} placeholder="COA-123456" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">GST Number</span>
                            <input value={form.gstNumber || ""} onChange={(e) => setField("gstNumber", e.target.value)} className={inputClass} placeholder="29ABCDE1234F1Z5" />
                          </label>
                        </Grid>

                        <label className="space-y-2 block">
                          <span className="text-caption text-muted-foreground">Short Experience Statement *</span>
                          <textarea value={form.experience} onChange={(e) => setField("experience", e.target.value)} className={`${inputClass} min-h-[120px]`} placeholder="A concise professional summary for clients and search filters." />
                          {errors.experience && <p className="text-xs text-red-400">{errors.experience}</p>}
                        </label>

                        <label className="space-y-2 block">
                          <span className="text-caption text-muted-foreground">Team Size</span>
                          <input type="number" min={1} value={form.teamSize ?? ""} onChange={(e) => setField("teamSize", e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="8" />
                        </label>
                      </motion.div>
                    )}

                    {stepIndex === 1 && (
                      <motion.div key="step-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground"><BriefcaseBusiness className="h-4 w-4" /> Select one or more expertise areas</div>
                        <div className="flex flex-wrap gap-3">
                          {expertiseOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleValue("expertise", option.value)}
                              className={`rounded-full border px-4 py-2 text-sm transition-colors ${form.expertise.includes(option.value) ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background/40 hover:border-border"}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        {errors.expertise && <p className="text-xs text-red-400">{errors.expertise}</p>}
                      </motion.div>
                    )}

                    {stepIndex === 2 && (
                      <motion.div key="step-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground"><Sparkles className="h-4 w-4" /> Define your visual language</div>
                        <div className="flex flex-wrap gap-3">
                          {styleOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleValue("workingStyles", option.value)}
                              className={`rounded-full border px-4 py-2 text-sm transition-colors ${form.workingStyles.includes(option.value) ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background/40 hover:border-border"}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        {errors.workingStyles && <p className="text-xs text-red-400">{errors.workingStyles}</p>}
                      </motion.div>
                    )}

                    {stepIndex === 3 && (
                      <motion.div key="step-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                        <Grid cols={2} gap="default">
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Consultation Fee *</span>
                            <input type="number" min={1} value={form.consultationFee || ""} onChange={(e) => setField("consultationFee", Number(e.target.value) || 0)} className={inputClass} placeholder="2500" />
                            {errors.consultationFee && <p className="text-xs text-red-400">{errors.consultationFee}</p>}
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Starting Project Budget</span>
                            <input type="number" min={0} value={form.startingProjectBudget ?? ""} onChange={(e) => setField("startingProjectBudget", e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="500000" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Maximum Project Budget</span>
                            <input type="number" min={0} value={form.maximumProjectBudget ?? ""} onChange={(e) => setField("maximumProjectBudget", e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="50000000" />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">About / Fee Context</span>
                            <input value={form.about || ""} onChange={(e) => setField("about", e.target.value)} className={inputClass} placeholder="Transparent pricing and a high-touch client process." />
                          </label>
                        </Grid>
                      </motion.div>
                    )}

                    {stepIndex === 4 && (
                      <motion.div key="step-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground"><MapPin className="h-4 w-4" /> Cities you actively serve</div>
                        <div className="flex flex-wrap gap-2">
                          {(form.serviceCities || []).map((city) => (
                            <button key={city} type="button" onClick={() => removeFromList("serviceCities", city)} className="dome-chip bg-primary/10 text-primary border-primary/20">{city} <span className="ml-2">×</span></button>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <input value={form.additionalCity} onChange={(e) => setField("additionalCity", e.target.value)} className={inputClass} placeholder="Add a city" />
                          <button type="button" className="dome-button" onClick={addServiceCity}>Add City</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {citySuggestions.map((city) => (
                            <button key={city} type="button" onClick={() => setForm((current) => ({ ...current, serviceCities: Array.from(new Set([...(current.serviceCities || []), city])) }))} className="dome-chip hover:border-primary/50">
                              {city}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {stepIndex === 5 && (
                      <motion.div key="step-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center gap-2 text-caption text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Choose your availability</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { key: "onlineConsultation", title: "Online Consultation" },
                            { key: "offlineConsultation", title: "Offline Consultation" },
                            { key: "siteVisitAvailable", title: "Site Visit" },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => toggleAvailability(item.key as "onlineConsultation" | "offlineConsultation" | "siteVisitAvailable")}
                              className={`rounded-2xl border p-4 text-left transition-colors ${form[item.key as keyof FormState] ? "border-primary bg-primary/10" : "border-border/60 bg-background/40 hover:border-border"}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{item.title}</span>
                                {form[item.key as keyof FormState] ? <Check className="h-4 w-4 text-primary" /> : null}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {stepIndex === 6 && (
                      <motion.div key="step-7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <Grid cols={2} gap="default">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-caption text-muted-foreground"><Upload className="h-4 w-4" /> Profile photo</div>
                            <FileUpload scope="architect" accept="image/*" onUploadSuccess={(url) => setField("profilePhoto", url)} />
                            {form.profilePhoto && <img src={form.profilePhoto} alt="Profile preview" className="h-32 w-full rounded-2xl object-cover border border-border/40" />}
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-caption text-muted-foreground"><Upload className="h-4 w-4" /> Hero image</div>
                            <FileUpload scope="architect" accept="image/*" onUploadSuccess={(url) => setField("heroImage", url)} />
                            {form.heroImage && <img src={form.heroImage} alt="Hero preview" className="h-32 w-full rounded-2xl object-cover border border-border/40" />}
                          </div>
                        </Grid>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-caption text-muted-foreground"><Sparkles className="h-4 w-4" /> Portfolio images</div>
                          <FileUpload scope="portfolio" accept="image/*" onUploadSuccess={(url) => setField("portfolioImages", Array.from(new Set([...(form.portfolioImages || []), url])))} />
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(form.portfolioImages || []).map((image) => (
                              <button key={image} type="button" onClick={() => removeFromList("portfolioImages", image)} className="group relative overflow-hidden rounded-2xl border border-border/40">
                                <img src={image} alt="Portfolio" className="h-28 w-full object-cover" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">Remove</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Grid cols={2} gap="default">
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Awards</span>
                            <input
                              value={(form.awards || []).join(", ")}
                              onChange={(e) => setField("awards", e.target.value.split(",").map((value) => value.trim()).filter(Boolean))}
                              className={inputClass}
                              placeholder="AIA award, Luxury Living shortlist"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-caption text-muted-foreground">Certifications</span>
                            <input
                              value={(form.certifications || []).join(", ")}
                              onChange={(e) => setField("certifications", e.target.value.split(",").map((value) => value.trim()).filter(Boolean))}
                              className={inputClass}
                              placeholder="IGBC AP, RIBA membership"
                            />
                          </label>
                        </Grid>
                      </motion.div>
                    )}

                    {stepIndex === 7 && (
                      <motion.div key="step-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {summaryItems.map((item) => (
                            <div key={item.label} className="dome-panel p-4">
                              <div className="text-caption text-muted-foreground">{item.label}</div>
                              <div className="mt-1 text-body font-medium">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="dome-panel p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="dome-kicker">Profile Completion</span>
                            <span className="text-body-sm">{completion}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-primary" style={{ width: `${completion}%` }} />
                          </div>
                          <p className="text-body-sm text-muted-foreground">
                            Your profile will immediately feed Explore, recommendations, and Avora matching once submitted.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-border/50 pt-6">
                    <button type="button" onClick={goBack} className="dome-button-outline justify-center" disabled={stepIndex === 0 || saving}>
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => saveDraft(false)} className="dome-button-outline justify-center" disabled={saving}>
                        Save Progress
                      </button>
                      {stepIndex < 7 ? (
                        <button type="button" onClick={goNext} className="dome-button justify-center" disabled={saving}>
                          Continue <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="button" onClick={() => saveDraft(true)} className="dome-button justify-center" disabled={saving}>
                          {saving ? "Submitting..." : "Complete Onboarding"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 sticky top-28">
                  <div className={sectionCard + " p-6"}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Crown className="h-5 w-5" /></div>
                      <div>
                        <p className="text-caption text-muted-foreground">Profile completion</p>
                        <p className="text-display-sm">{completion}%</p>
                      </div>
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      Complete onboarding unlocks the Architect Dashboard, discovery visibility, and recommendation ranking.
                    </p>
                  </div>

                  <div className={sectionCard + " p-6"}>
                    <h3 className="text-body font-medium mb-4">What this powers</h3>
                    <div className="space-y-3 text-body-sm text-muted-foreground">
                      <p>• Explore and Find Architects filtering</p>
                      <p>• Avora matching and recommendations</p>
                      <p>• Public architect profile cards</p>
                      <p>• Profile completion indicators</p>
                    </div>
                  </div>

                  <div className={sectionCard + " p-6"}>
                    <h3 className="text-body font-medium mb-4">Trust essentials</h3>
                    <div className="space-y-3 text-body-sm">
                      <div className="flex items-center justify-between gap-3"><span>Firm name</span>{isFilled(form.firmName) ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground">Required</span>}</div>
                      <div className="flex items-center justify-between gap-3"><span>City</span>{isFilled(form.city) ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground">Required</span>}</div>
                      <div className="flex items-center justify-between gap-3"><span>Experience</span>{isFilled(form.experience) ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground">Required</span>}</div>
                      <div className="flex items-center justify-between gap-3"><span>Expertise</span>{form.expertise.length ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground">Required</span>}</div>
                      <div className="flex items-center justify-between gap-3"><span>Styles</span>{form.workingStyles.length ? <Check className="h-4 w-4 text-emerald-400" /> : <span className="text-muted-foreground">Required</span>}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectOnboarding;
