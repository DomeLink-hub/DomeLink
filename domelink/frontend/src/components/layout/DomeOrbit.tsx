interface DomeOrbitNode {
  label: string;
  position: { top: string; left: string };
}

interface DomeOrbitProps {
  centerTitle: string;
  centerSubtitle?: string;
  nodes: DomeOrbitNode[];
}

const DomeOrbit = ({ centerTitle, centerSubtitle, nodes }: DomeOrbitProps) => {
  return (
    <div className="dome-orbit">
      <div className="dome-orbit-ring" />
      <div className="text-center max-w-xs">
        <h3 className="text-display-sm">{centerTitle}</h3>
        {centerSubtitle && (
          <p className="text-body-sm text-muted-foreground mt-2">{centerSubtitle}</p>
        )}
      </div>
      {nodes.map((node) => (
        <div
          key={node.label}
          className="dome-orbit-node"
          style={{ top: node.position.top, left: node.position.left }}
        >
          <span className="dome-node mr-2" />
          {node.label}
        </div>
      ))}
    </div>
  );
};

export default DomeOrbit;
