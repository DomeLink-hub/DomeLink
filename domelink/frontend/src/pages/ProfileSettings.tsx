import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const ProfileSettings = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: api.me,
  });

  const [name, setName] = useState(data?.user.name || "");
  const [avatar, setAvatar] = useState(data?.user.avatar || "");

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; avatar?: string; styleTags?: string[] }) => api.updateMe(payload),
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Account"
          title="Profile Settings"
          subtitle="Manage your profile details while preserving your DomeLink presence."
          imageUrl="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="small" className="pb-32">
          <Container size="narrow">
            <div className="dome-flow pt-6 space-y-6">
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Name</label>
                <input
                  className="dome-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground block mb-2">Avatar URL</label>
                <input
                  className="dome-input"
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                />
              </div>
              <button
                className="dome-button"
                onClick={() => updateMutation.mutate({ name, avatar })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ProfileSettings;
