import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import DomeHero from "@/components/layout/DomeHero";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProfileSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    specialty: "",
    startingPrice: "",
    experience: "",
    teamSize: "",
    about: ""
  });

  // Pre-fill the form with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
        specialty: user.specialty || "",
        startingPrice: user.startingPrice?.toString() || "",
        experience: user.experience || "",
        teamSize: user.teamSize?.toString() || "",
        about: user.about || ""
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateProfile(data), // Make sure this exists in your api.ts!
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      toast.error("Failed to update profile.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <DomeHero
          kicker="Settings"
          title="Profile Settings"
          subtitle="Update your personal details and public profile."
          align="left"
          className="pt-20 pb-10"
        />

        <Section padding="small">
          <Container size="narrow">
            <form onSubmit={handleSubmit} className="space-y-6 bg-background/50 p-8 rounded-2xl border border-border/40">
              
              {/* Universal Fields */}
              <div className="space-y-4">
                <h3 className="text-display-xs">Basic Info</h3>
                <div>
                  <label className="text-caption text-muted-foreground block mb-2">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Architect Specific Fields */}
              {user.role === "ARCHITECT" && (
                <div className="space-y-4 pt-6 border-t border-border/40">
                  <h3 className="text-display-xs">Public Architect Profile</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Location</label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. New York, NY"
                        className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Specialty</label>
                      <input
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        placeholder="e.g. Modern Residential"
                        className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Starting Price ($)</label>
                      <input
                        name="startingPrice"
                        type="number"
                        value={formData.startingPrice}
                        onChange={handleChange}
                        placeholder="50000"
                        className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-muted-foreground block mb-2">Team Size</label>
                      <input
                        name="teamSize"
                        type="number"
                        value={formData.teamSize}
                        onChange={handleChange}
                        placeholder="5"
                        className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">About Your Studio</label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="dome-button w-full justify-center"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>

            </form>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
};

export default ProfileSettings;