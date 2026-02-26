interface DomeTimelineItem {
  title: string;
  description: string;
  meta?: string;
}

interface DomeTimelineProps {
  items: DomeTimelineItem[];
}

const DomeTimeline = ({ items }: DomeTimelineProps) => {
  return (
    <div className="dome-timeline">
      {items.map((item) => (
        <div key={item.title} className="dome-timeline-item">
          {item.meta && (
            <span className="text-caption text-muted-foreground block mb-2">{item.meta}</span>
          )}
          <h3 className="text-display-sm mb-3">{item.title}</h3>
          <p className="text-body text-muted-foreground max-w-2xl">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default DomeTimeline;
