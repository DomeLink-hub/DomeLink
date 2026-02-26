import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section, Grid } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { api, type AdminArchitect, type AdminUser } from "@/lib/api";
import { useState } from "react";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: overview } = useQuery({
    queryKey: queryKeys.adminOverview(),
    queryFn: api.getAdminOverview,
  });
  const { data: users = [] } = useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: api.getAdminUsers,
  });
  const { data: architects = [] } = useQuery({
    queryKey: queryKeys.adminArchitects(),
    queryFn: api.getAdminArchitects,
  });

  // Search and pagination state
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 12;
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );
  const pagedUsers = filteredUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize);

  const [archSearch, setArchSearch] = useState("");
  const [archPage, setArchPage] = useState(1);
  const archPageSize = 12;
  const filteredArchitects = architects.filter(
    (a) =>
      a.name.toLowerCase().includes(archSearch.toLowerCase()) ||
      a.specialty.toLowerCase().includes(archSearch.toLowerCase()) ||
      a.location.toLowerCase().includes(archSearch.toLowerCase())
  );
  const pagedArchitects = filteredArchitects.slice((archPage - 1) * archPageSize, archPage * archPageSize);

  const updateUserStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminUser["status"] }) =>
      api.updateAdminUserStatus(userId, status),
    onSuccess: async () => {
      toast.success("User status updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update user status.");
    },
  });

  const updateArchitect = useMutation({
    mutationFn: ({
      architectId,
      moderationStatus,
      isVerified,
    }: {
      architectId: string;
      moderationStatus: AdminArchitect["moderationStatus"];
      isVerified: boolean;
    }) => api.updateAdminArchitectModeration(architectId, { moderationStatus, isVerified }),
    onSuccess: async () => {
      toast.success("Architect moderation updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminArchitects() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update architect.");
    },
  });

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Admin"
          title="Platform Control Center"
          subtitle="Manage users, review marketplace health, and inspect platform-wide activity."
          imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        <Section padding="small" className="pb-32">
          <Container>
            <Grid cols={4} gap="default">
              <div className="dome-card p-6">
                <p className="text-caption text-muted-foreground mb-2">Total Users</p>
                <p className="text-display-sm">{overview?.totalUsers ?? 0}</p>
              </div>
              <div className="dome-card p-6">
                <p className="text-caption text-muted-foreground mb-2">Suspended Users</p>
                <p className="text-display-sm">{overview?.suspendedUsers ?? 0}</p>
              </div>
              <div className="dome-card p-6">
                <p className="text-caption text-muted-foreground mb-2">Verified Architects</p>
                <p className="text-display-sm">{overview?.verifiedArchitects ?? 0}</p>
              </div>
              <div className="dome-card p-6">
                <p className="text-caption text-muted-foreground mb-2">Active Consultations</p>
                <p className="text-display-sm">{overview?.activeConsultations ?? 0}</p>
              </div>
            </Grid>

            <div className="mt-10 dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-display-sm">User Management</h3>
                <Link to="/admin/analytics" className="text-caption link-underline">
                  Open analytics
                </Link>
              </div>
              <AdminSearchBar
                placeholder="Search users by name, email, or role"
                onSearch={val => {
                  setUserSearch(val);
                  setUserPage(1);
                }}
              />
              <div className="space-y-3">
                {pagedUsers.length === 0 && (
                  <div className="text-body-sm text-muted-foreground px-2 py-4">No users found.</div>
                )}
                {pagedUsers.map((user) => (
                  <div key={user._id} className="dome-panel p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-body font-medium">{user.name}</p>
                      <p className="text-body-sm text-muted-foreground">{user.email} • {user.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="dome-chip">{user.status}</span>
                      {user.role !== "admin" && (
                        <button
                          onClick={() =>
                            updateUserStatus.mutate({
                              userId: user._id,
                              status: user.status === "active" ? "suspended" : "active",
                            })
                          }
                          disabled={updateUserStatus.isPending}
                          className="dome-button-outline"
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <AdminTablePagination
                page={userPage}
                pageSize={userPageSize}
                total={filteredUsers.length}
                onPageChange={setUserPage}
              />
            </div>

            <div className="mt-10 dome-card p-6">
              <h3 className="text-display-sm mb-4">Architect Moderation</h3>
              <AdminSearchBar
                placeholder="Search architects by name, specialty, or location"
                onSearch={val => {
                  setArchSearch(val);
                  setArchPage(1);
                }}
              />
              <div className="space-y-3">
                {pagedArchitects.length === 0 && (
                  <div className="text-body-sm text-muted-foreground px-2 py-4">No architects found.</div>
                )}
                {pagedArchitects.map((architect) => (
                  <div key={architect._id} className="dome-panel p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-body font-medium">{architect.name}</p>
                      <p className="text-body-sm text-muted-foreground">{architect.specialty} • {architect.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="dome-chip">{architect.moderationStatus}</span>
                      <span className="dome-chip">{architect.isVerified ? "verified" : "unverified"}</span>
                      <button
                        onClick={() =>
                          updateArchitect.mutate({
                            architectId: architect._id,
                            moderationStatus: "approved",
                            isVerified: true,
                          })
                        }
                        disabled={updateArchitect.isPending}
                        className="dome-button"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateArchitect.mutate({
                            architectId: architect._id,
                            moderationStatus: "rejected",
                            isVerified: false,
                          })
                        }
                        disabled={updateArchitect.isPending}
                        className="dome-button-outline"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <AdminTablePagination
                page={archPage}
                pageSize={archPageSize}
                total={filteredArchitects.length}
                onPageChange={setArchPage}
              />
            </div>

            <Grid cols={3} gap="default">
              <Link to="/admin/analytics" className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                <h3 className="text-display-sm mb-2">Analytics</h3>
                <p className="text-body-sm text-muted-foreground">View engagement, conversion, and event trends.</p>
              </Link>
              <div className="dome-card p-6">
                <h3 className="text-display-sm mb-2">Users</h3>
                <p className="text-body-sm text-muted-foreground">Manage activation and suspensions in the user table above.</p>
              </div>
              <div className="dome-card p-6">
                <h3 className="text-display-sm mb-2">Architects</h3>
                <p className="text-body-sm text-muted-foreground">Approve or reject architect verification requests.</p>
              </div>
            </Grid>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default AdminDashboard;
