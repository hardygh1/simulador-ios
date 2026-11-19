import { BatteryMedium, Moon, RotateCcw, Signal, Sun, Wifi } from "lucide-react";
import { SwiftUIRenderer } from "../../engine/renderer/SwiftUIRenderer";
import { useLabStore } from "../../store/useLabStore";

export function IPhoneSimulator() {
  const program = useLabStore((state) => state.program);
  const runtimeState = useLabStore((state) => state.runtimeState);
  const running = useLabStore((state) => state.running);
  const setBinding = useLabStore((state) => state.setBinding);
  const executeAction = useLabStore((state) => state.executeAction);
  const resetRuntime = useLabStore((state) => state.resetRuntime);
  const theme = useLabStore((state) => state.theme);
  const toggleTheme = useLabStore((state) => state.toggleTheme);
  const selectedTemplateId = useLabStore((state) => state.selectedTemplateId);
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const canvasSelection = useLabStore((state) => state.canvasSelection);
  const componentVisualStyles = useLabStore((state) => state.componentVisualStyles);
  const selectCanvasComponent = useLabStore((state) => state.selectCanvasComponent);
  const scope = activeCustomProjectId ?? `template-${selectedTemplateId}`;

  return (
    <section className="simulator-pane" aria-label="Simulador de iPhone">
      <div className="simulator-toolbar">
        <div>
          <strong>iPhone 16</strong>
          <span>Vista simulada · no ejecuta iOS real</span>
        </div>
        <div className="simulator-actions">
          <button type="button" onClick={resetRuntime} title="Reiniciar estado"><RotateCcw size={16} /></button>
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            aria-pressed={theme === "light"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <div className="device-stage">
        <div className={`iphone ${theme === "dark" ? "iphone-dark" : "iphone-light"}`}>
          <div className="iphone-screen">
            <div className="dynamic-island" />
            <div className="status-bar">
              <span>9:41</span>
              <span className="status-icons"><Signal size={13} fill="currentColor" /><Wifi size={14} /><BatteryMedium size={17} /></span>
            </div>
            <main className="ios-app-screen" onClick={(event) => { if (event.target === event.currentTarget) selectCanvasComponent(null); }}>
              {running && program?.root ? (
                <SwiftUIRenderer
                  root={program.root}
                  state={runtimeState}
                  onBindingChange={setBinding}
                  onAction={executeAction}
                  scope={scope}
                  selectedId={canvasSelection?.id ?? null}
                  visualStyles={componentVisualStyles}
                  onSelect={selectCanvasComponent}
                />
              ) : (
                <div className="simulator-empty">
                  <span className="empty-stop">■</span>
                  <strong>{program?.diagnostics.some((item) => item.severity === "error") ? "Corrige el código" : "Simulación detenida"}</strong>
                  <p>Pulsa Ejecutar para volver a construir la vista.</p>
                </div>
              )}
            </main>
            <div className="home-indicator" />
          </div>
        </div>
      </div>
    </section>
  );
}
