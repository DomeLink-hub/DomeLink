import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Integrate real contact form API
    // await fetch('/api/contact', {
    //   method: 'POST',
    //   body: JSON.stringify(formData)
    // });

    toast.success("Message sent successfully. We'll be in touch soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Contact"
          title="Ready to discuss your future home?"
          subtitle="Share your vision with DomeLink and schedule a private consultation with a verified architect."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="small">
          <Container size="narrow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Info */}
              <div>
                <Reveal>
                  <div className="space-y-4">
                    <span className="dome-kicker">Contact</span>
                    <h1 className="text-display-lg dome-bracket">
                      Get in touch
                    </h1>
                  </div>
                  <p className="text-body-lg text-muted-foreground mb-12">
                    Have a question about DomeLink? We'd love to hear from you. 
                    Send us a message and we'll respond as soon as possible.
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="space-y-8">
                    <div>
                      <span className="text-caption text-muted-foreground block mb-2">
                        Email
                      </span>
                      <a 
                        href="mailto:hello@domelink.com" 
                        className="text-body link-underline"
                      >
                        hello@domelink.com
                      </a>
                    </div>
                    <div>
                      <span className="text-caption text-muted-foreground block mb-2">
                        Location
                      </span>
                      <p className="text-body">
                        San Francisco, California
                      </p>
                    </div>
                    <div>
                      <span className="text-caption text-muted-foreground block mb-2">
                        Social
                      </span>
                      <div className="flex gap-6">
                        <span className="text-body-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          Twitter
                        </span>
                        <span className="text-body-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          Instagram
                        </span>
                        <span className="text-body-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          LinkedIn
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Form */}
              <Reveal delay={0.2}>
                <form onSubmit={handleSubmit} className="dome-flow pt-6 space-y-6">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="dome-input"
                    />
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="dome-input"
                    />
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="dome-input"
                    />
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full dome-input rounded-2xl resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full dome-button justify-center disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              </Reveal>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Contact;
