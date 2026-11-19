import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ArrowLeftRight, Code2, Columns2, Rows2, Smartphone } from "lucide-react";
import { CodeEditor } from "../editor/CodeEditor";
import { IPhoneSimulator } from "../simulator/IPhoneSimulator";

type Orientation = "horizontal" | "vertical";

export function EditorCanvasWorkspace() {
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [canvasFirst, setCanvasFirst] = useState(false);
  const [split, setSplit] = useState(55);
  const frameRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  const resize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current || !frameRef.current) return;
    const bounds = frameRef.current.getBoundingClientRect();
    const raw = orientation === "horizontal"
      ? ((event.clientX - bounds.left) / bounds.width) * 100
      : ((event.clientY - bounds.top) / bounds.height) * 100;
    setSplit(Math.min(75, Math.max(25, raw)));
  };

  const beginResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    resizingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishResize = () => {
    resizingRef.current = false;
  };

  const codePane = <div className="dock-pane code-dock"><CodeEditor /></div>;
  const canvasPane = <div className="dock-pane canvas-dock"><IPhoneSimulator /></div>;
  const panes: ReactNode[] = canvasFirst ? [canvasPane, codePane] : [codePane, canvasPane];
  const layoutStyle = { "--dock-split": `${split}%` } as CSSProperties;

  return (
    <section className="editor-canvas-workspace" aria-label="Área de código y Canvas">
      <div className="canvas-layout-toolbar">
        <div><Code2 size={14} /><span>Código</span><span className="layout-plus">+</span><Smartphone size={14} /><span>Canvas</span></div>
        <div className="canvas-layout-actions" aria-label="Distribución de ventanas">
          <button type="button" className={orientation === "horizontal" ? "active" : ""} onClick={() => setOrientation("horizontal")} title="Ventanas lado a lado"><Columns2 size={15} /></button>
          <button type="button" className={orientation === "vertical" ? "active" : ""} onClick={() => setOrientation("vertical")} title="Ventanas una sobre otra"><Rows2 size={15} /></button>
          <button type="button" onClick={() => setCanvasFirst((value) => !value)} title="Intercambiar Código y Canvas"><ArrowLeftRight size={15} /><span>Intercambiar</span></button>
        </div>
      </div>
      <div ref={frameRef} className={`dock-frame ${orientation}`} style={layoutStyle} onPointerMove={resize} onPointerUp={finishResize} onPointerCancel={finishResize}>
        {panes[0]}
        <div className="dock-resizer" role="separator" aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"} onPointerDown={beginResize}><i /></div>
        {panes[1]}
      </div>
    </section>
  );
}
