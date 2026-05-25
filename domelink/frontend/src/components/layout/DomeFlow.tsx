import { cn } from "@/lib/utils";

interface DomeFlowItem {
  title: string;
  description: string;
  meta?: string;
}

interface DomeFlowProps {
  items: DomeFlowItem[];
  className?: string;
}

const DomeFlow = ({ items, className }: DomeFlowProps) => {
  return (
    <div className={cn("dome-flow", className)}>
      <div className="dome-flow-items">
        {items.map((item) => (
          <div key={item.title} className="dome-flow-item">
            <span className="dome-node" />
            <div>
              {item.meta && (
                <span className="text-caption text-muted-foreground block mb-2">{item.meta}</span>
              )}
              <h3 className="text-display-sm mb-2">{item.title}</h3>
              <p className="text-body text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomeFlow;
