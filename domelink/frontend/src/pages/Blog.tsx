
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type BlogPost } from "@/lib/api";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getBlogPosts()
      .then(setPosts)
      .catch(() => setError("Failed to load blog posts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-spin text-pink-500">📝</span> Blog
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {posts.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No blog posts yet. Explore architecture stories and tips soon!</div>}
            {posts.length === 0 && !loading && <div>No blog posts found.</div>}
            {posts.map((p) => (
              <div key={p._id} className="dome-card p-4">
                <h2 className="font-semibold text-lg mb-2">{p.title}</h2>
                <p>{p.content}</p>
                <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
