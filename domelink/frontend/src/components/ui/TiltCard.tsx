import { useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard = ({ children, className }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !ref.current) return;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) * 7 - 3.5) * -1;
    const rotateY = (x / rect.width) * 7 - 3.5;
    ref.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;

    if (glareRef.current) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.2), rgba(255,255,255,0) 45%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`relative overflow-hidden transition-transform duration-300 [transform-style:preserve-3d] ${className || ""}`}
      >
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
