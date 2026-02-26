
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type File } from "@/lib/api";

export default function Files() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getFiles()
      .then(setFiles)
      .catch(() => setError("Failed to load files."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-pulse text-purple-500">📁</span> Files
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {files.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No files uploaded yet. Share your project files here!</div>}
            {files.length === 0 && !loading && <div>No files found.</div>}
            {files.map((f) => (
              <div key={f._id} className="dome-card p-4 flex items-center gap-4">
                <a href={f.url} className="font-semibold underline" download>{f.filename}</a>
                <span className="dome-chip">{f.type}</span>
                <span className="text-xs text-muted-foreground">{(f.size/1024).toFixed(0)} KB</span>
                <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
