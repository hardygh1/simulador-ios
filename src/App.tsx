import { useState } from "react";
import { CircleStop, Code2, Moon, PanelBottom, PanelLeft, PanelRight, Play, RotateCcw, Save, Smartphone, Sparkles, Sun } from "lucide-react";
import { ProjectExplorer } from "./components/projects/ProjectExplorer";
import { ConsolePanel } from "./components/console/ConsolePanel";
import { UtilityPanel } from "./components/utility/UtilityPanel";
import { EditorCanvasWorkspace } from "./components/workspace/EditorCanvasWorkspace";
import { templateById } from "./templates";
import { useLabStore } from "./store/useLabStore";

export default function App() {
  const selectedTemplateId = useLabStore((state) => state.selectedTemplateId);
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const customProjects = useLabStore((state) => state.customProjects);
  const run = useLabStore((state) => state.run);
  const stop = useLabStore((state) => state.stop);
  const resetRuntime = useLabStore((state) => state.resetRuntime);
  const save = useLabStore((state) => state.save);
  const running = useLabStore((state) => state.running);
  const theme = useLabStore((state) => state.theme);
  const toggleTheme = useLabStore((state) => state.toggleTheme);
  const diagnostics = useLabStore((state) => state.diagnostics);
  const template = templateById(selectedTemplateId);
  const activeProject = customProjects.find((project) => project.id === activeCustomProjectId);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showDebug, setShowDebug] = useState(true);
  const [showUtility, setShowUtility] = useState(true);
  const errorCount = diagnostics.filter((item) => item.severity === "error").length;
  const title = activeProject?.name ?? template.title;
  const activeFileName = activeProject ? "ViewController.swift" : template.fileName ?? "ViewController.swift";

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="app-toolbar">
        <div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div>
        <div className="brand-lockup">
          <div className="brand-mark"><Code2 size={18} /></div>
          <div><strong>SwiftLab</strong><span>Web</span></div>
        </div>
        <div className="xcode-run-controls">
          <button type="button" onClick={run} title="Ejecutar"><Play size={16} fill="currentColor" /></button>
          <button type="button" onClick={stop} title="Detener"><CircleStop size={16} /></button>
        </div>
        <div className="scheme-selector"><strong>{title}</strong><span>›</span><Smartphone size={14} /><span>iPhone 16</span></div>
        <div className={`xcode-build-status ${errorCount ? "failed" : running ? "running" : "idle"}`}>
          <i /> <span>{errorCount ? `Build Failed · ${errorCount} error${errorCount === 1 ? "" : "es"}` : running ? "Build Succeeded" : "Stopped"}</span>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="theme-button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
            aria-pressed={theme === "light"}
            title={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "Claro" : "Oscuro"}
          </button>
          <button type="button" onClick={resetRuntime}><RotateCcw size={15} /> Reiniciar</button>
          <button type="button" onClick={save}><Save size={15} /> Guardar</button>
          <span className="panel-toggle-group">
            <button type="button" className={showNavigator ? "active" : ""} onClick={() => setShowNavigator((value) => !value)} title="Mostrar u ocultar navegador" aria-pressed={showNavigator}><PanelLeft size={16} /></button>
            <button type="button" className={showDebug ? "active" : ""} onClick={() => setShowDebug((value) => !value)} title="Mostrar u ocultar depuración" aria-pressed={showDebug}><PanelBottom size={16} /></button>
            <button type="button" className={showUtility ? "active" : ""} onClick={() => setShowUtility((value) => !value)} title="Mostrar u ocultar utilidades" aria-pressed={showUtility}><PanelRight size={16} /></button>
          </span>
        </div>
      </header>

      <div className={`workspace-grid ${!showNavigator ? "navigator-hidden" : ""} ${!showUtility ? "utility-hidden" : ""}`}>
        {showNavigator && <ProjectExplorer />}
        <main className="coding-workspace">
          <section className="exercise-brief">
            <div className="brief-icon"><Sparkles size={17} /></div>
            <div className="brief-main">
              <span>{activeProject ? "PROYECTO UIKIT + STORYBOARD" : `${template.level} · ${template.topic}`}</span>
              <h1>{title}</h1>
              <p>{activeProject ? `Proyecto local · Main.storyboard · ${activeFileName}` : template.description}</p>
            </div>
            <div className="expected-result"><span>{activeProject ? "SIMULADOR" : "RESULTADO ESPERADO"}</span><p>{activeProject ? "Conecta las vistas del Storyboard y ejecuta el controlador." : template.expected}</p><small>{activeProject ? "UIKit · Storyboard · Swift" : template.source}</small></div>
          </section>
          <div className="editor-simulator-grid">
            <EditorCanvasWorkspace />
          </div>
          {showDebug && <ConsolePanel />}
        </main>
        {showUtility && <UtilityPanel />}
      </div>
    </div>
  );
}
