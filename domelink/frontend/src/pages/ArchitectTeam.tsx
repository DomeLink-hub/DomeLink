import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

interface TeamMemberView {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: "online" | "offline" | "away";
}

const ArchitectTeam = () => {
  const queryClient = useQueryClient();
  const { data: myArchitect } = useQuery({
    queryKey: ["architect-me"],
    queryFn: api.getMyArchitect,
  });
  const { data: persistedTeam = [] } = useQuery({
    queryKey: queryKeys.team(myArchitect?._id || ""),
    queryFn: () => api.getTeam(myArchitect!._id),
    enabled: Boolean(myArchitect?._id),
  });
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["team-invites", myArchitect?._id || ""],
    queryFn: () => api.getTeamInvites(myArchitect!._id),
    enabled: Boolean(myArchitect?._id),
  });

  const [team, setTeam] = useState<TeamMemberView[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const inviteTeamMutation = useMutation({
    mutationFn: (payload: { architectId: string; email: string; role: string }) => api.inviteTeamMember(payload),
    onSuccess: () => {
      if (myArchitect?._id) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.team(myArchitect._id) });
        void queryClient.invalidateQueries({ queryKey: ["team-invites", myArchitect._id] });
      }
    },
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;

    if (!myArchitect?._id) {
      toast.error("Architect profile not found");
      return;
    }

    inviteTeamMutation.mutate({
      architectId: myArchitect._id,
      email: inviteEmail,
      role: "Collaborator",
    });

    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setShowInvite(false);
  };

  useEffect(() => {
    if (persistedTeam.length > 0) {
      setTeam(
        persistedTeam.map((member) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          avatar:
            member.avatar ||
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
          status: member.status,
        })),
      );
    }
  }, [persistedTeam]);

  const getStatusColor = (status: TeamMemberView["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Team Collaboration"
          title="Your Team"
          subtitle="Coordinate projects, share updates, and manage your studio workspace."
          imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="none" className="-mt-16">
          <Container>
            <div className="flex justify-end">
              <motion.button
                onClick={() => setShowInvite(true)}
                className="dome-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Invite Collaborator
              </motion.button>
            </div>
          </Container>
        </Section>

        {/* Invite Modal */}
        {showInvite && (
          <Section padding="none" className="pb-8">
            <Container>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dome-panel p-8"
              >
                <h3 className="text-display-sm mb-4">Invite Collaborator</h3>
                <p className="text-body text-muted-foreground mb-6">
                  Enter the email address of the person you'd like to invite to your team.
                </p>
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="colleague@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 dome-input"
                  />
                  <motion.button
                    onClick={handleInvite}
                    className="dome-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Invite
                  </motion.button>
                  <motion.button
                    onClick={() => setShowInvite(false)}
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

        <Section padding="small">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Team Overview</h3>
                  <span className="text-caption text-muted-foreground">Live data</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Active members</p>
                    <p className="text-display-sm mt-2">{team.length}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Pending invites</p>
                    <p className="text-display-sm mt-2">{pendingInvites.length}</p>
                  </div>
                </div>
                {team.length === 0 && pendingInvites.length === 0 && (
                  <div className="mt-6 text-center py-4">
                    <p className="text-body-sm text-muted-foreground">No team members yet. Invite a collaborator to get started.</p>
                  </div>
                )}
              </div>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Online Status</h3>
                  <span className="text-caption text-muted-foreground">Now</span>
                </div>
                {team.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                    <span className="text-muted-foreground text-xl">◇</span>
                    <p className="text-body-sm text-muted-foreground">Invite team members to see their status here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {team.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium truncate">{member.name}</p>
                          <p className="text-caption text-muted-foreground">{member.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        {/* Team Members */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Team Members</h2>
            </Reveal>

            <Grid cols={3} gap="default">
              {team.map((member, index) => (
                <Reveal key={member.id} delay={index * 0.1}>
                  <div className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background ${getStatusColor(
                            member.status
                          )}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-body font-medium">{member.name}</h3>
                        <p className="text-body-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-body-sm text-muted-foreground">{member.email}</p>
                  </div>
                </Reveal>
              ))}
            </Grid>
          </Container>
        </Section>

        <Section padding="small" className="pt-0">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Pending Invitations</h2>
            </Reveal>
            {pendingInvites.length === 0 ? (
              <div className="dome-panel p-6 text-body-sm text-muted-foreground">No pending invites right now.</div>
            ) : (
              <div className="dome-panel overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-border text-caption text-muted-foreground">
                  <span>Email</span>
                  <span>Role</span>
                  <span>Expires</span>
                </div>
                <div className="divide-y divide-border">
                  {pendingInvites.map((invite) => (
                    <div key={invite._id} className="grid grid-cols-3 gap-4 px-6 py-4 text-body-sm">
                      <span>{invite.email}</span>
                      <span>{invite.role}</span>
                      <span className="text-muted-foreground">{new Date(invite.expiresAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </Section>

        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectTeam;
