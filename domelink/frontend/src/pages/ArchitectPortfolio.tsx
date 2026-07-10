import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api, type PortfolioProject } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import StudioScene from "@/components/3d/StudioScene";

interface Project {
  id: string;
  title: string;
  location: string;
  year: string;
  area: string;
  image: string;
  description: string;
}

const ArchitectPortfolio = () => {
  const queryClient = useQueryClient();
  const { data: myArchitect } = useQuery({
    queryKey: ["architect-me"],
    queryFn: api.getMyArchitect,
  });
  const { data: portfolioData = [] } = useQuery({
    queryKey: queryKeys.portfolio(myArchitect?._id || ""),
    queryFn: () => api.getPortfolio(myArchitect!._id),
    enabled: Boolean(myArchitect?._id),
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({});

  useEffect(() => {
    if (portfolioData.length > 0) {
      setProjects(
        portfolioData.map((project) => ({
          id: project._id,
          title: project.title,
          location: project.location || "",
          year: project.year || "",
          area: project.area || "",
          image: project.images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
          description: project.description,
        })),
      );
    }
  }, [portfolioData]);

  const createProjectMutation = useMutation({
    mutationFn: (payload: Omit<PortfolioProject, "_id">) => api.createPortfolio(payload),
    onSuccess: () => {
      if (myArchitect?._id) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(myArchitect._id) });
      }
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PortfolioProject> }) =>
      api.updatePortfolio(id, payload),
    onSuccess: () => {
      if (myArchitect?._id) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(myArchitect._id) });
      }
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.deletePortfolio(id),
    onSuccess: () => {
      if (myArchitect?._id) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(myArchitect._id) });
      }
    },
  });

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
  };

  const handleSave = (id: string) => {
    const project = projects.find((item) => item.id === id);
    if (!project) return;

    updateProjectMutation.mutate({
      id,
      payload: {
        title: project.title,
        description: project.description,
        location: project.location,
        year: project.year,
        area: project.area,
        images: [project.image],
      },
    });
    toast.success("Project updated successfully");
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!newProject.title) return;
    
    if (!myArchitect?._id) {
      toast.error("Architect profile not found.");
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title || "",
      location: newProject.location || "",
      year: newProject.year || new Date().getFullYear().toString(),
      area: newProject.area || "",
      image: newProject.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      description: newProject.description || "",
    };
    
    createProjectMutation.mutate({
      architectId: myArchitect._id,
      title: project.title,
      images: [project.image],
      description: project.description,
      location: project.location,
      year: project.year,
      area: project.area,
    });

    setProjects([project, ...projects]);
    setNewProject({});
    setIsAdding(false);
    toast.success("Project added to portfolio");
  };

  const handleDelete = (id: string) => {
    deleteProjectMutation.mutate(id);
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Project removed from portfolio");
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Portfolio Management"
          title="Your Projects"
          subtitle="Curate your work in a gallery-ready format for premium clients."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="none" className="-mt-16">
          <Container>
            <div className="flex justify-end">
              <motion.button
                onClick={() => setIsAdding(true)}
                className="dome-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add Project
              </motion.button>
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Portfolio Lab</h3>
                  <span className="text-caption text-muted-foreground">3D gallery</span>
                </div>
                <StudioScene className="h-64 w-full" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Published</p>
                    <p className="text-display-sm mt-2">{projects.length}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Total projects</p>
                    <p className="text-display-sm mt-2">{projects.length}</p>
                  </div>
                </div>
              </div>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Portfolio</h3>
                  <span className="text-caption text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
                </div>
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border border-border/40 flex items-center justify-center">
                      <span className="text-muted-foreground text-xl">◇</span>
                    </div>
                    <p className="text-body text-muted-foreground">You haven't added any portfolio projects yet</p>
                    <p className="text-body-sm text-muted-foreground">Add your first one to showcase your work</p>
                    <motion.button
                      onClick={() => setIsAdding(true)}
                      className="dome-button mt-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add first project
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/40">
                        <img src={project.image} alt={project.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium truncate">{project.title}</p>
                          <p className="text-caption text-muted-foreground truncate">{project.location} · {project.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        {/* Add Project Form */}
        {isAdding && (
          <Section padding="none" className="pb-12">
            <Container>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dome-panel p-8"
              >
                <h3 className="text-display-sm mb-6">New Project</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={newProject.title || ""}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="dome-input"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newProject.location || ""}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    className="dome-input"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newProject.year || ""}
                    onChange={(e) => setNewProject({ ...newProject, year: e.target.value })}
                    className="dome-input"
                  />
                  <input
                    type="text"
                    placeholder="Area (e.g., 420 m²)"
                    value={newProject.area || ""}
                    onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                    className="dome-input"
                  />
                </div>
                <textarea
                  placeholder="Project description"
                  value={newProject.description || ""}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="w-full dome-input rounded-2xl resize-none mb-6"
                />
                <div className="flex gap-4">
                  <motion.button
                    onClick={handleAdd}
                    className="dome-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Project
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsAdding(false);
                      setNewProject({});
                    }}
                    className="dome-button-outline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </Container>
          </Section>
        )}

        {/* Projects */}
        <Section padding="small" className="pb-32">
          <Container>
            <StaggerContainer className="space-y-8">
              {projects.map((project) => (
                <StaggerItem key={project.id}>
                  <div className="dome-card overflow-hidden hover:border-foreground transition-colors duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                      {/* Image */}
                      <div className="aspect-[4/3] lg:aspect-auto">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="lg:col-span-2 p-8">
                        {editingId === project.id ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => {
                                const updated = projects.map((p) =>
                                  p.id === project.id ? { ...p, title: e.target.value } : p
                                );
                                setProjects(updated);
                              }}
                              className="dome-input"
                            />
                            <div className="grid grid-cols-3 gap-4">
                              <input
                                type="text"
                                value={project.location}
                                onChange={(e) => {
                                  const updated = projects.map((p) =>
                                    p.id === project.id ? { ...p, location: e.target.value } : p
                                  );
                                  setProjects(updated);
                                }}
                                className="dome-input"
                              />
                              <input
                                type="text"
                                value={project.year}
                                onChange={(e) => {
                                  const updated = projects.map((p) =>
                                    p.id === project.id ? { ...p, year: e.target.value } : p
                                  );
                                  setProjects(updated);
                                }}
                                className="dome-input"
                              />
                              <input
                                type="text"
                                value={project.area}
                                onChange={(e) => {
                                  const updated = projects.map((p) =>
                                    p.id === project.id ? { ...p, area: e.target.value } : p
                                  );
                                  setProjects(updated);
                                }}
                                className="dome-input"
                              />
                            </div>
                            <textarea
                              value={project.description}
                              onChange={(e) => {
                                const updated = projects.map((p) =>
                                  p.id === project.id ? { ...p, description: e.target.value } : p
                                );
                                setProjects(updated);
                              }}
                              rows={2}
                              className="w-full dome-input rounded-2xl resize-none"
                            />
                            <div className="flex gap-3">
                              <motion.button
                                onClick={() => handleSave(project.id)}
                                className="dome-button"
                                whileTap={{ scale: 0.98 }}
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={() => setEditingId(null)}
                                className="dome-button-outline"
                                whileTap={{ scale: 0.98 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-display-sm">{project.title}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(project)}
                                  className="text-caption text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(project.id)}
                                  className="text-caption text-destructive hover:text-destructive/80 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="flex gap-6 text-body-sm text-muted-foreground mb-4">
                              <span>{project.location}</span>
                              <span>{project.year}</span>
                              <span>{project.area}</span>
                            </div>
                            <p className="text-body text-muted-foreground">
                              {project.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectPortfolio;
