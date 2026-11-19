import { useMemo, useState } from "react";
import { AppWindow, Check, FileCode2, X } from "lucide-react";
import { projectStarters } from "../../templates";
import type { ProjectStarterId } from "../../types";
import { useLabStore } from "../../store/useLabStore";

interface NewProjectDialogProps {
  onClose: () => void;
}

export function NewProjectDialog({ onClose }: NewProjectDialogProps) {
  const [name, setName] = useState("MiApp");
  const [starterId, setStarterId] = useState<ProjectStarterId>("blank");
  const customProjects = useLabStore((state) => state.customProjects);
  const createProject = useLabStore((state) => state.createProject);
  const normalizedName = name.trim();
  const duplicate = useMemo(
    () => customProjects.some((project) => project.name.toLocaleLowerCase("es") === normalizedName.toLocaleLowerCase("es")),
    [customProjects, normalizedName]
  );
  const valid = normalizedName.length > 0 && !duplicate;

  const submit = () => {
    if (!valid) return;
    createProject(normalizedName, starterId);
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="new-project-dialog" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
        <header>
          <div className="dialog-app-icon"><AppWindow size={22} /></div>
          <div>
            <span className="eyebrow">NUEVO PROYECTO</span>
            <h2 id="new-project-title">Configura tu aplicación</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </header>

        <div className="project-form">
          <label>
            <span>Nombre del producto</span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} />
            {duplicate && <small className="field-error">Ya existe un proyecto con ese nombre.</small>}
          </label>
          <div className="project-settings-row">
            <label><span>Interfaz</span><input value="SwiftUI" disabled /></label>
            <label><span>Lenguaje</span><input value="Swift" disabled /></label>
            <label><span>Persistencia</span><input value="Local" disabled /></label>
          </div>

          <fieldset>
            <legend>Plantilla inicial</legend>
            <div className="starter-grid">
              {projectStarters.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  className={starterId === starter.id ? "selected" : ""}
                  onClick={() => setStarterId(starter.id)}
                >
                  <FileCode2 size={21} />
                  <strong>{starter.name}</strong>
                  <span>{starter.description}</span>
                  {starterId === starter.id && <Check className="starter-check" size={15} />}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <footer>
          <p>El proyecto se guardará en este navegador y se abrirá con <strong>ContentView.swift</strong>.</p>
          <div><button type="button" className="dialog-secondary" onClick={onClose}>Cancelar</button><button type="button" className="dialog-primary" disabled={!valid} onClick={submit}>Crear proyecto</button></div>
        </footer>
      </section>
    </div>
  );
}
