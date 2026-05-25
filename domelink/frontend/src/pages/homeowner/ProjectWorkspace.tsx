import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, FileText, CheckCircle2, Clock, Upload, Activity, CalendarDays } from "lucide-react";
import { api, type Project } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ProjectWorkspace() {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [healthInsight, setHealthInsight] = useState<{healthTag: string, singleLineSummary: string} | null>(null);
  
  useEffect(() => {
    if (id) {
      api.getProjectDetails(id).then(data => {
         setProject(data);
         if (data) api.getProjectHealthInsight(data).then(setHealthInsight).catch(console.error);
      }).catch(() => {
        toast({ title: "Error", description: "Failed to load project workspace", variant: "destructive" });
      });
    }
  }, [id, toast]);

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>;
  }

  const architect = project.consultation?.architect;
  const hasOverdueMilestone = Boolean(project.milestones?.some((milestone) => milestone.dueDate && new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"));
  const showWarning = hasOverdueMilestone || healthInsight?.healthTag === "Delayed" || healthInsight?.healthTag === "At Risk";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        {/* Header Setup */}
        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8">
          <motion.div variants={itemAnim}>
            <Link to="/homeowner/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl lg:text-6xl font-light tracking-tight">{project.title}</h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">{project.description}</p>
          </motion.div>
          
          <motion.div variants={itemAnim} className="flex items-center gap-6 p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={architect?.avatar} />
              <AvatarFallback>{architect?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-medium">{architect?.name}</h3>
              <p className="text-muted-foreground text-sm">Lead Architect</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {project.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
          </motion.div>

          {showWarning && (
            <motion.div variants={itemAnim} className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 text-sm text-amber-900 dark:text-amber-100">
              <div className="font-medium">Project needs attention</div>
              <div className="mt-1 text-muted-foreground">
                {healthInsight?.singleLineSummary || "One or more milestones are overdue or the project is moving slower than expected."}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress & Milestones */}
              <motion.div variants={itemAnim}>
                <Card className="bg-card/30 backdrop-blur-md border-border/40 overflow-hidden">
                  <div className="p-6 border-b border-border/40 bg-gradient-to-r from-card to-card/10">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <CardTitle className="text-2xl font-light">Project Timeline</CardTitle>
                        <CardDescription>Track the milestones of your architecture journey</CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-light text-primary">{project.progress}%</span>
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/20">
                      {project.milestones?.length ? project.milestones.map((m) => (
                        <div key={m.id} className="p-6 flex items-start gap-4 group hover:bg-card/40 transition-colors">
                          <div className={`mt-1 rounded-full p-1 bg-${m.status === 'completed' ? 'primary/20 text-primary' : 'muted text-muted-foreground'}`}>
                            {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium">{m.title}</h4>
                            {m.description && <p className="text-muted-foreground mt-1 text-sm">{m.description}</p>}
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                              {m.status.replace("_", " ")}
                            </span>
                            {m.dueDate && (
                              <span className="text-xs flex items-center text-muted-foreground">
                                <CalendarDays className="w-3 h-3 mr-1" /> {new Date(m.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-muted-foreground">No milestones defined yet.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
               <motion.div variants={itemAnim}>
                <Card className="bg-card/30 backdrop-blur border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" /> Shared Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="text-sm tracking-wide text-muted-foreground/80 font-light italic mb-4">
                       Awaiting new file uploads from your architect.
                     </div>
                     <Button variant="outline" className="w-full justify-start text-muted-foreground">
                       <Upload className="w-4 h-4 mr-2" /> Upload References
                     </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemAnim}>
                <Card className="bg-primary/5 backdrop-blur border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" /> AI Project Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {healthInsight ? (
                        <>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${healthInsight.healthTag === "Delayed" ? "bg-red-500/20 text-red-600" : "bg-primary/20 text-primary"}`}>
                            {healthInsight.healthTag}
                          </div>
                          <p className="text-sm font-medium">{healthInsight.singleLineSummary}</p>
                        </>
                     ) : (
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                     )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemAnim}>
                <Card className="bg-card/30 backdrop-blur border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" /> Key Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">Estimated Budget</p>
                      <p className="font-medium text-lg">₹{(project.estimatedBudget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">Timeline</p>
                      <p className="font-medium">{project.estimatedTime || "Not set"}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
