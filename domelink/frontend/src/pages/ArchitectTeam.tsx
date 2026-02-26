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

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    author: "Elena Vasquez",
    content: "Client meeting for Casa del Mar rescheduled to Friday 3pm. Please update your calendars.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    author: "Carlos Mendez",
    content: "Completed the initial sketches for the Barcelona project. Ready for review.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    author: "Maria Santos",
    content: "Budget approval received for the Girona renovation. We can proceed with phase 2.",
    timestamp: "2 days ago",
  },
];

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
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      author: "Elena Vasquez",
      content: newNote,
      timestamp: "Just now",
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note shared with team");
  };

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

        {/* Shared Notes */}
        <Section padding="small" className="pb-32">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Shared Notes</h2>
            </Reveal>

            {/* Add Note */}
            <Reveal delay={0.1}>
              <div className="dome-panel p-6 mb-8">
                <textarea
                  placeholder="Share an update with your team..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full dome-input rounded-2xl resize-none mb-4"
                />
                <div className="flex justify-end">
                  <motion.button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="dome-button disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Share Note
                  </motion.button>
                </div>
              </div>
            </Reveal>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note, index) => (
                <Reveal key={note.id} delay={0.1 + index * 0.05}>
                  <div className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-body font-medium">{note.author}</span>
                      <span className="text-caption text-muted-foreground">{note.timestamp}</span>
                    </div>
                    <p className="text-body text-muted-foreground">{note.content}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectTeam;
