import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
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

  const { data: billing = { payments: [], subscriptions: [], featuredPlacements: [], uploads: [] } } = useQuery({
    queryKey: queryKeys.adminBilling(),
    queryFn: api.getAdminBilling,
  });

  const { data: webhooks = { items: [], total: 0, page: 1, limit: 25 } } = useQuery({
    queryKey: ["admin","webhooks"],
    queryFn: () => api.getWebhooks(1, 25),
  });

  const replayWebhook = useMutation({
    mutationFn: (id: string) => api.replayWebhook(id),
    onSuccess: async () => {
      toast.success("Webhook replayed.");
    },
    onError: () => toast.error("Failed to replay webhook."),
  });

  const [replaysById, setReplaysById] = useState<Record<string, any[] | undefined>>({});
  const [replaysLoading, setReplaysLoading] = useState<Record<string, boolean>>({});

  const fetchReplays = async (webhookId: string) => {
    if (replaysById[webhookId]) {
      // toggle off
      setReplaysById((s) => ({ ...s, [webhookId]: undefined }));
      return;
    }
    setReplaysLoading((s) => ({ ...s, [webhookId]: true }));
    try {
      const items = await api.getWebhookReplays(webhookId);
      setReplaysById((s) => ({ ...s, [webhookId]: items }));
    } catch (e) {
      toast.error("Failed to load replay history.");
    } finally {
      setReplaysLoading((s) => ({ ...s, [webhookId]: false }));
    }
  };

  const moderateUpload = useMutation({
    mutationFn: ({ assetId, isApproved }: { assetId: string; isApproved: boolean }) => api.moderateUpload(assetId, isApproved),
    onSuccess: async () => {
      toast.success("Upload moderation updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminBilling() });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ placementId, isActive }: { placementId: string; isActive: boolean }) => api.manageFeaturedPlacement(placementId, isActive),
    onSuccess: async () => {
      toast.success("Featured placement updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminBilling() });
    },
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
            {/* Platform Health Row */}
            <Reveal>
              <div className="mb-8">
                <span className="dome-kicker mb-4">Platform Health</span>
                <Grid cols={4} gap="default">
                  <div className="dome-card p-6">
                    <p className="text-caption text-muted-foreground mb-2">Pending Verifications</p>
                    <p className="text-display-sm">{architects.filter((a) => a.moderationStatus === "pending").length}</p>
                  </div>
                  <div className="dome-card p-6">
                    <p className="text-caption text-muted-foreground mb-2">Flagged Uploads</p>
                    <p className="text-display-sm">{billing.uploads.filter((u: any) => !u.isApproved).length}</p>
                  </div>
                  <div className="dome-card p-6">
                    <p className="text-caption text-muted-foreground mb-2">Active Consultations</p>
                    <p className="text-display-sm">{overview?.activeConsultations ?? 0}</p>
                  </div>
                  <div className="dome-card p-6">
                    <p className="text-caption text-muted-foreground mb-2">Conversion Rate</p>
                    <p className="text-display-sm">
                      {overview?.totalConsultations
                        ? `${Math.round(((overview.activeConsultations ?? 0) / overview.totalConsultations) * 100)}%`
                        : "—"}
                    </p>
                  </div>
                </Grid>
              </div>
            </Reveal>

            {/* Overview stats */}
            <Reveal>
              <div className="mb-8">
                <span className="dome-kicker mb-4">Overview</span>
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
                    <p className="text-caption text-muted-foreground mb-2">Total Architects</p>
                    <p className="text-display-sm">{overview?.totalArchitects ?? 0}</p>
                  </div>
                </Grid>
              </div>
            </Reveal>

            {/* Verification Queue */}
            {architects.filter((a) => a.moderationStatus === "pending").length > 0 && (
              <Reveal>
                <div className="mt-8 dome-card p-6 border-l-4 border-amber-400">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="dome-kicker">Verification Queue</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300">
                      ● {architects.filter((a) => a.moderationStatus === "pending").length} pending
                    </span>
                  </div>
                  <div className="space-y-3">
                    {architects
                      .filter((a) => a.moderationStatus === "pending")
                      .map((architect) => (
                        <div key={architect._id} className="dome-panel p-4 flex flex-wrap items-center justify-between gap-4 border-l-2 border-amber-300">
                          <div>
                            <p className="text-body font-medium">{architect.name}</p>
                            <p className="text-body-sm text-muted-foreground">{architect.specialty} • {architect.location}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300">
                              ● pending
                            </span>
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
                </div>
              </Reveal>
            )}

            <div className="mt-10 dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="dome-kicker mb-2">Users</span>
                  <h3 className="text-display-sm">User Management</h3>
                </div>
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
              <div className="mb-4">
                <span className="dome-kicker mb-2">Architects</span>
                <h3 className="text-display-sm">Architect Moderation</h3>
              </div>
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
                  <div key={architect._id} className={`dome-panel p-4 flex flex-wrap items-center justify-between gap-4 ${architect.moderationStatus === "pending" ? "border-l-2 border-amber-300" : ""}`}>
                    <div>
                      <p className="text-body font-medium">{architect.name}</p>
                      <p className="text-body-sm text-muted-foreground">{architect.specialty} • {architect.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`dome-chip ${architect.moderationStatus === "pending" ? "bg-amber-50 border-amber-200 text-amber-800" : ""}`}>
                        {architect.moderationStatus === "pending" && "● "}{architect.moderationStatus}
                      </span>
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

            <div className="mt-10 dome-card p-6">
              <div className="mb-4">
                <span className="dome-kicker mb-2">Billing</span>
                <h3 className="text-display-sm">Billing & Upload Moderation</h3>
              </div>
              <div className="mb-4">
                <h4 className="text-body font-medium">Recent Uploads</h4>
                <div className="space-y-3 mt-2">
                  {billing.uploads.length === 0 && <div className="text-body-sm text-muted-foreground">No recent uploads.</div>}
                  {billing.uploads.slice(0, 10).map((u: any) => (
                    <div key={u.id} className="dome-panel p-3 flex items-center justify-between gap-4">
                      <div>
                        <a href={u.url} className="link-underline font-medium" target="_blank" rel="noreferrer">{u.name}</a>
                        <div className="text-body-sm text-muted-foreground">{u.mimeType} • {(u.size/1024).toFixed(0)} KB</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`dome-chip ${u.isApproved ? 'bg-green-100' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>{u.isApproved ? 'approved' : 'pending'}</span>
                        <button className="dome-button" onClick={() => moderateUpload.mutate({ assetId: u.id, isApproved: true })}>Approve</button>
                        <button className="dome-button-outline" onClick={() => moderateUpload.mutate({ assetId: u.id, isApproved: false })}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-body font-medium">Featured Placements</h4>
                <div className="space-y-3 mt-2">
                  {billing.featuredPlacements.length === 0 && <div className="text-body-sm text-muted-foreground">No featured placements.</div>}
                  {billing.featuredPlacements.slice(0,10).map((fp: any) => (
                    <div key={fp.id} className="dome-panel p-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">Placement #{fp.id}</div>
                        <div className="text-body-sm text-muted-foreground">Architect: {fp.architectId} • Type: {fp.placementType}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`dome-chip ${fp.isActive ? 'bg-green-100' : 'bg-gray-50'}`}>{fp.isActive ? 'active' : 'inactive'}</span>
                        <button className="dome-button" onClick={() => toggleFeatured.mutate({ placementId: fp.id, isActive: !fp.isActive })}>{fp.isActive ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 dome-card p-6">
              <div className="mb-4">
                <span className="dome-kicker mb-2">Webhooks</span>
                <h3 className="text-display-sm">Incoming Webhooks</h3>
              </div>
              <div className="space-y-3">
                {webhooks.items.length === 0 && <div className="text-body-sm text-muted-foreground">No webhook events recorded.</div>}
                {webhooks.items.slice(0, 10).map((w: any) => (
                  <div key={w.id} className="dome-panel p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{w.event}</div>
                        <div className="text-body-sm text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`dome-chip ${w.processed ? 'bg-green-100' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>{w.processed ? 'processed' : 'pending'}</span>
                        <button className="dome-button" onClick={() => replayWebhook.mutate(w.id)}>Replay</button>
                        <button className="dome-button-outline" onClick={() => fetchReplays(w.id)}>
                          {replaysLoading[w.id] ? "Loading..." : replaysById[w.id] ? "Hide history" : "Show history"}
                        </button>
                      </div>
                    </div>
                    {replaysById[w.id] && (
                      <div className="mt-3 space-y-2">
                        {replaysById[w.id].length === 0 && <div className="text-body-sm text-muted-foreground">No replays recorded.</div>}
                        {replaysById[w.id].map((r: any) => (
                          <div key={r.id} className="dome-panel p-2 flex items-center justify-between">
                            <div>
                              <div className="font-medium">Replay by {r.adminId}</div>
                              <div className="text-body-sm text-muted-foreground">{new Date(r.replayedAt).toLocaleString()}</div>
                            </div>
                            <div className="text-body-sm text-muted-foreground">{r.notes?.error ? `Error: ${r.notes.error}` : r.notes?.success ? 'Success' : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Grid cols={3} gap="default">
              <Link to="/admin/analytics" className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                <span className="dome-kicker mb-2">Analytics</span>
                <h3 className="text-display-sm mb-2">Analytics</h3>
                <p className="text-body-sm text-muted-foreground">View engagement, conversion, and event trends.</p>
              </Link>
              <div className="dome-card p-6">
                <span className="dome-kicker mb-2">Users</span>
                <h3 className="text-display-sm mb-2">Users</h3>
                <p className="text-body-sm text-muted-foreground">Manage activation and suspensions in the user table above.</p>
              </div>
              <div className="dome-card p-6">
                <span className="dome-kicker mb-2">Architects</span>
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
