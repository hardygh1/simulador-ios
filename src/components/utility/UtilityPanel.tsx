import { useEffect, useMemo, useState } from "react";
import { Braces, Component, FileCode2, Info, MousePointer2, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { swiftUIComponents } from "../editor/swiftUIComponents";
import { useLabStore } from "../../store/useLabStore";
import type { ComponentVisualStyle } from "../../types";

type UtilityTab = "inspector" | "library";

export function UtilityPanel() {
  const [tab, setTab] = useState<UtilityTab>("inspector");
  const [query, setQuery] = useState("");
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const customProjects = useLabStore((state) => state.customProjects);
  const requestInsertion = useLabStore((state) => state.requestInsertion);
  const selection = useLabStore((state) => state.canvasSelection);
  const visualStyles = useLabStore((state) => state.componentVisualStyles);
  const updateVisualStyle = useLabStore((state) => state.updateComponentVisualStyle);
  const resetVisualStyle = useLabStore((state) => state.resetComponentVisualStyle);
  const project = customProjects.find((item) => item.id === activeCustomProjectId);
  const style = selection ? visualStyles[selection.id] ?? {} : {};

  useEffect(() => {
    if (selection) setTab("inspector");
  }, [selection]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return swiftUIComponents.filter((item) => !normalized || `${item.name} ${item.category} ${item.description}`.toLocaleLowerCase("es").includes(normalized));
  }, [query]);

  const updateNumber = (property: keyof ComponentVisualStyle, value: string) => {
    if (!selection) return;
    updateVisualStyle(selection.id, { [property]: value === "" ? undefined : Math.max(0, Number(value)) });
  };

  const updateColor = (property: "foregroundColor" | "backgroundColor", value: string) => {
    if (selection) updateVisualStyle(selection.id, { [property]: value });
  };

  return (
    <aside className="utility-panel" aria-label="Inspector y Biblioteca de Xcode">
      <div className="utility-tabs" role="tablist">
        <button type="button" className={tab === "inspector" ? "active" : ""} onClick={() => setTab("inspector")}><SlidersHorizontal size={14} /> Inspector</button>
        <button type="button" className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}><Component size={14} /> Biblioteca</button>
      </div>

      {tab === "inspector" && (
        <div className="inspector-content">
          <div className="utility-title"><SlidersHorizontal size={16} /><div><strong>{selection ? `Inspector de ${selection.name}` : "Inspector"}</strong><span>{selection ? "Cambios visuales en vivo" : "Archivo y selección del Storyboard"}</span></div></div>

          {selection ? (
            <>
              <section className="selection-summary">
                <div className="selected-component-badge"><MousePointer2 size={16} /><span><strong>{selection.name}</strong><small>{selection.kind} · seleccionado en la vista</small></span></div>
                <button type="button" className="reset-properties" onClick={() => resetVisualStyle(selection.id)}><RotateCcw size={13} /> Restablecer</button>
              </section>
              <section>
                <h3>Tamaño</h3>
                <div className="property-pair">
                  <label><span>Ancho</span><input type="number" min="0" placeholder="Auto" value={style.width ?? ""} onChange={(event) => updateNumber("width", event.target.value)} /></label>
                  <label><span>Alto</span><input type="number" min="0" placeholder="Auto" value={style.height ?? ""} onChange={(event) => updateNumber("height", event.target.value)} /></label>
                </div>
              </section>
              <section>
                <h3>Texto y relleno</h3>
                <label><span>Tamaño fuente</span><input type="number" min="8" max="72" placeholder="Storyboard" value={style.fontSize ?? ""} onChange={(event) => updateNumber("fontSize", event.target.value)} /></label>
                <label className="color-property"><span>Color</span><input type="color" value={style.foregroundColor ?? "#0a84ff"} onChange={(event) => updateColor("foregroundColor", event.target.value)} /><input value={style.foregroundColor ?? ""} placeholder="Sin cambio" onChange={(event) => updateColor("foregroundColor", event.target.value)} /></label>
                <label className="color-property"><span>Fondo</span><input type="color" value={style.backgroundColor ?? "#ffffff"} onChange={(event) => updateColor("backgroundColor", event.target.value)} /><input value={style.backgroundColor ?? ""} placeholder="Sin cambio" onChange={(event) => updateColor("backgroundColor", event.target.value)} /></label>
              </section>
              <section>
                <h3>Disposición</h3>
                <label><span>Padding</span><input type="number" min="0" max="80" placeholder="Storyboard" value={style.padding ?? ""} onChange={(event) => updateNumber("padding", event.target.value)} /></label>
                <label><span>Radio esquina</span><input type="number" min="0" max="80" placeholder="Storyboard" value={style.cornerRadius ?? ""} onChange={(event) => updateNumber("cornerRadius", event.target.value)} /></label>
              </section>
              <section className="quick-help"><p><Info size={14} /><span>La selección azul identifica la vista activa. Los cambios se guardan localmente con el proyecto.</span></p></section>
            </>
          ) : (
            <>
              <section className="canvas-selection-help"><MousePointer2 size={20} /><strong>Selecciona un control de la vista</strong><p>Haz clic en un UILabel, UIButton, UITextField o UISwitch para editar sus propiedades.</p></section>
              <section>
                <h3>Identidad y tipo</h3>
                <label><span>Nombre</span><input value="ViewController.swift" readOnly /></label>
                <label><span>Tipo</span><input value="Swift Source" readOnly /></label>
                <label><span>Ubicación</span><input value="Relative to Group" readOnly /></label>
              </section>
              <section>
                <h3>Target Membership</h3>
                <label className="inspector-check"><input type="checkbox" checked readOnly /><span>{project?.name ?? "SwiftLab"}</span></label>
              </section>
              <section className="quick-help">
                <h3>Ayuda rápida</h3>
                <p><FileCode2 size={14} /> <span><strong>UIViewController</strong> controla la pantalla diseñada en Main.storyboard.</span></p>
                <p><Info size={14} /> Conecta componentes mediante IBOutlet e IBAction.</p>
              </section>
            </>
          )}
        </div>
      )}

      {tab === "library" && (
        <div className="library-content">
          <div className="utility-title"><Component size={16} /><div><strong>Biblioteca UIKit</strong><span>Inserta conexiones y acciones en el cursor</span></div></div>
          <label className="library-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar vistas" /></label>
          <div className="library-list">
            {(["Diseño", "Controles", "Contenido", "Modificadores"] as const).map((category) => {
              const items = filtered.filter((item) => item.category === category);
              if (!items.length) return null;
              return (
                <section key={category}>
                  <h3>{category === "Modificadores" ? "Propiedades" : category}</h3>
                  {items.map((item) => (
                    <button key={item.id} type="button" onClick={() => requestInsertion(item.snippet)}>
                      <span className="library-icon">{item.category === "Modificadores" ? <Braces size={15} /> : <Component size={15} />}</span>
                      <span><strong>{item.name}</strong><small>{item.description}</small></span>
                    </button>
                  ))}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
