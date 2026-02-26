import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";

export default function PortfolioBuilder() {
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: "", images: [], description: "", location: "", year: "", area: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleAddProject = async () => {
    setLoading(true);
    setError("");
    try {
      const newProject = await api.createPortfolio(form);
      setProjects([...projects, newProject]);
      setForm({ title: "", images: [], description: "", location: "", year: "", area: "" });
    } catch (e) {
      setError("Failed to add project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-2xl font-bold mb-4">Portfolio Builder</h1>
          <div className="mb-8">
            <input
              type="text"
              className="dome-input w-full mb-2"
              placeholder="Project Title"
              value={form.title}
              onChange={e => handleChange("title", e.target.value)}
            />
            <input
              type="text"
              className="dome-input w-full mb-2"
              placeholder="Image URLs (comma separated)"
              value={form.images.join(", ")}
              onChange={e => handleChange("images", e.target.value.split(",").map((s: string) => s.trim()))}
            />
            <textarea
              className="dome-input w-full mb-2"
              placeholder="Description"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
            />
            <input
              type="text"
              className="dome-input w-full mb-2"
              placeholder="Location"
              value={form.location}
              onChange={e => handleChange("location", e.target.value)}
            />
            <input
              type="text"
              className="dome-input w-full mb-2"
              placeholder="Year"
              value={form.year}
              onChange={e => handleChange("year", e.target.value)}
            />
            <input
              type="text"
              className="dome-input w-full mb-2"
              placeholder="Area (sq ft)"
              value={form.area}
              onChange={e => handleChange("area", e.target.value)}
            />
            <button
              className="dome-button px-8 py-2"
              onClick={handleAddProject}
              disabled={loading}
              type="button"
            >
              {loading ? "Adding..." : "Add Project"}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
          <h2 className="text-xl font-semibold mb-4">Your Portfolio Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div key={idx} className="dome-card p-4">
                <div className="aspect-[4/3] mb-2 rounded-xl overflow-hidden">
                  {project.images && project.images[0] && (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="font-semibold mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{project.location} • {project.year} • {project.area} sq ft</p>
                <p className="text-sm mb-2">{project.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
