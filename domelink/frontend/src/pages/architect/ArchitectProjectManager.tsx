import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, CheckCircle2, CircleDashed, Upload, LayoutPanelLeft } from "lucide-react";
import { api, type Project } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ArchitectProjectManager() {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [healthInsight, setHealthInsight] = useState<{ healthTag: string; singleLineSummary: string } | null>(null);
  
  // Basic states for new milestone form
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [mt, setMt] = useState("");
  const [md, setMd] = useState("");

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = () => {
    if (!id) return;

    api.getProjectDetails(id)
      .then((data) => {
        setProject(data);
        return api.getProjectHealthInsight(data);
      })
      .then(setHealthInsight)
      .catch(() => {
        toast({ title: "Error", description: "Failed to load project workspace", variant: "destructive" });
      });
  };

  const handleAddMilestone = async () => {
    if (!id || !mt) return;
    try {
      await api.createMilestone(id, { title: mt, description: md });
      setMt(""); setMd(""); setIsAddingMilestone(false);
      loadProject();
      toast({ title: "Milestone Created", description: "Successfully added to the timeline." });
    } catch {
      toast({ title: "Error", description: "Failed to create milestone.", variant: "destructive" });
    }
  };

  const handleCompleteMilestone = async (mId: string) => {
    try {
      await api.updateMilestoneStatus(mId, "completed");
      loadProject();
      toast({ title: "Milestone Updated", description: "Marked as completed." });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  if (!project) return <div className="text-center p-20">Loading workspace...</div>;
  const client = project.consultation?.user;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <Link to="/architect/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Return to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-light tracking-tight">{project.title}</h1>
            <p className="text-xl text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
          </div>
          <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
             <Avatar>
               <AvatarImage src={client?.avatar} />
               <AvatarFallback>{client?.name?.charAt(0)}</AvatarFallback>
             </Avatar>
             <div>
               <p className="text-sm text-muted-foreground uppercase tracking-widest text-[10px]">Client</p>
               <p className="font-medium">{client?.name}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {healthInsight && (
                <Card className={`border ${healthInsight.healthTag === "Delayed" || healthInsight.healthTag === "At Risk" ? "border-amber-500/30 bg-amber-500/8" : "border-primary/20 bg-primary/5"}`}>
                  <CardContent className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-caption uppercase tracking-[0.2em] text-muted-foreground">Project Health</div>
                      <p className="mt-2 text-body font-medium">{healthInsight.singleLineSummary}</p>
                    </div>
                    <span className="dome-chip">{healthInsight.healthTag}</span>
                  </CardContent>
                </Card>
              )}

              {/* Milestone Manager */}
              <Card className="bg-card w-full border-border/40 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                     <CardTitle className="text-2xl font-light">Milestone Manager</CardTitle>
                     <CardDescription>Plan and execute the project phases.</CardDescription>
                   </div>
                   <Button variant="outline" size="sm" onClick={() => setIsAddingMilestone(!isAddingMilestone)}>
                     <Plus className="w-4 h-4 mr-2" /> New Milestone
                   </Button>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {isAddingMilestone && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                        <div className="p-4 bg-muted/30 rounded-xl space-y-4 border border-border/50">
                           <Input placeholder="Milestone Title (e.g., Concept Design)" value={mt} onChange={(e) => setMt(e.target.value)} className="bg-background" />
                           <Textarea placeholder="Description of deliverables" value={md} onChange={(e) => setMd(e.target.value)} className="bg-background" />
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" onClick={() => setIsAddingMilestone(false)}>Cancel</Button>
                             <Button onClick={handleAddMilestone}>Save Milestone</Button>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    {project.milestones?.map((m) => (
                       <div key={m.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/30 hover:border-border transition-colors">
                          <button disabled={m.status === 'completed'} onClick={() => handleCompleteMilestone(m.id)} className={`mt-0.5 rounded-full p-1 transition-colors ${m.status === 'completed' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}>
                            {m.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <CircleDashed className="w-6 h-6" />}
                          </button>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium">{m.title}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{m.description}</p>
                          </div>
                       </div>
                    ))}
                    {project.milestones?.length === 0 && (
                      <p className="text-center text-muted-foreground py-8 italic font-light">Your canvas is blank. Start by creating the first project milestone.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
           </div>

           <div className="space-y-8">
              <Card className="bg-card w-full border-border/40 shadow-sm">
                 <CardHeader>
                   <CardTitle className="text-lg font-medium flex items-center">
                     <LayoutPanelLeft className="w-5 h-5 mr-2 text-primary" /> Workspace Files
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full mb-4">
                     <Upload className="w-4 h-4 mr-2" /> Upload Deliverable
                   </Button>
                   <p className="text-xs text-muted-foreground text-center">No files uploaded yet.</p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
