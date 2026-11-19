import { useEffect, useMemo, useState } from "react";
import { AppWindow, Box, CheckCircle2, ChevronDown, ChevronRight, FileCode2, FlaskConical, Folder, FolderOpen, Images, Package, Plus, Search } from "lucide-react";
import { challenges, templates } from "../../templates";
import { useLabStore } from "../../store/useLabStore";
import { NewProjectDialog } from "./NewProjectDialog";

type ExplorerTab = "plantillas" | "retos";

export function ProjectExplorer() {
  const [tab, setTab] = useState<ExplorerTab>("plantillas");
  const [query, setQuery] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const selectedTemplateId = useLabStore((state) => state.selectedTemplateId);
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const customProjects = useLabStore((state) => state.customProjects);
  const selectTemplate = useLabStore((state) => state.selectTemplate);
  const selectCustomProject = useLabStore((state) => state.selectCustomProject);
  const completed = useLabStore((state) => state.completed);

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return templates;
    return templates.filter((item) => `${item.title} ${item.topic}`.toLocaleLowerCase("es").includes(normalized));
  }, [query]);

  const filteredChallenges = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return challenges;
    return challenges.filter((item) => `${item.title} ${item.focus}`.toLocaleLowerCase("es").includes(normalized));
  }, [query]);

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return customProjects;
    return customProjects.filter((project) => project.name.toLocaleLowerCase("es").includes(normalized));
  }, [customProjects, query]);

  useEffect(() => {
    if (!activeCustomProjectId) return;
    setExpandedProjects((current) => new Set(current).add(activeCustomProjectId));
  }, [activeCustomProjectId]);

  const toggleProject = (id: string) => {
    setExpandedProjects((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="project-explorer" aria-label="Explorador del laboratorio">
      <div className="explorer-heading">
        <div>
          <span className="eyebrow">CURSO IOS</span>
          <h2>Mi laboratorio</h2>
        </div>
        <button className="new-project-button" type="button" onClick={() => setShowNewProject(true)} title="Crear un proyecto SwiftUI">
          <Plus size={15} /> Nuevo
        </button>
      </div>

      <div className="explorer-tabs" role="tablist">
        <button className={tab === "plantillas" ? "active" : ""} onClick={() => setTab("plantillas")} type="button" role="tab">Archivos</button>
        <button className={tab === "retos" ? "active" : ""} onClick={() => setTab("retos")} type="button" role="tab">Retos</button>
      </div>

      <label className="search-box">
        <Search size={14} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar práctica" />
      </label>

      {tab === "plantillas" ? (
        <div className="explorer-list">
          <div className="group-label"><ChevronDown size={14} /> MIS PROYECTOS <span>{customProjects.length}</span></div>
          {filteredProjects.length === 0 ? (
            <button type="button" className="empty-projects" onClick={() => setShowNewProject(true)}>
              <Plus size={16} /><span><strong>Crear mi primer proyecto</strong><small>Empieza con ContentView.swift</small></span>
            </button>
          ) : filteredProjects.map((project) => {
            const active = project.id === activeCustomProjectId;
            const expanded = active || expandedProjects.has(project.id);
            return (
              <div className="project-tree" key={project.id}>
                <button
                  className={`template-row project-row ${active ? "active" : ""}`}
                  onClick={() => { selectCustomProject(project.id); toggleProject(project.id); }}
                  type="button"
                  aria-expanded={expanded}
                >
                  {expanded ? <ChevronDown className="tree-chevron" size={13} /> : <ChevronRight className="tree-chevron" size={13} />}
                  <AppWindow size={16} />
                  <span className="template-copy"><strong>{project.name}</strong><small>iOS App · SwiftUI</small></span>
                </button>
                {expanded && (
                  <div className="project-file-tree">
                    <div className="tree-node folder-node"><ChevronDown size={12} /><Folder size={14} /><span>{project.name}</span></div>
                    <div className="tree-node file-node depth-2"><FileCode2 size={14} /><span>{project.name}App.swift</span></div>
                    <button type="button" className={`tree-node file-node depth-2 ${active ? "active-file" : ""}`} onClick={() => selectCustomProject(project.id)}><FileCode2 size={14} /><span>ContentView.swift</span></button>
                    <div className="tree-node file-node depth-2"><Images size={14} /><span>Assets.xcassets</span></div>
                    <div className="tree-node folder-node depth-2"><ChevronRight size={12} /><Folder size={14} /><span>Preview Content</span></div>
                    <div className="tree-node folder-node"><ChevronRight size={12} /><Package size={14} /><span>Products</span></div>
                    <div className="tree-node file-node depth-2 muted-product"><Box size={14} /><span>{project.name}.app</span></div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="group-label course-group"><ChevronDown size={14} /> PRÁCTICAS DEL CURSO <span>{completed.length}/{templates.length}</span></div>
          {filteredTemplates.map((template) => {
            const active = !activeCustomProjectId && template.id === selectedTemplateId;
            const done = completed.includes(template.id);
            return (
              <button key={template.id} className={`template-row ${active ? "active" : ""}`} onClick={() => selectTemplate(template.id)} type="button">
                <FileCode2 size={16} />
                <span className="template-copy">
                  <strong>{template.title}</strong>
                  <small>{template.topic}</small>
                </span>
                {done && <CheckCircle2 className="done-icon" size={15} />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="challenge-list">
          <p className="challenge-intro">Retos tomados de tus guías y laboratorios. Abre una plantilla parecida y adáptala.</p>
          {filteredChallenges.map((challenge) => (
            <article key={challenge.id} className="challenge-item">
              <FlaskConical size={16} />
              <div>
                <strong>{challenge.title}</strong>
                <small>{challenge.focus}</small>
                <p>{challenge.prompt}</p>
              </div>
            </article>
          ))}
        </div>
      )}
      {showNewProject && <NewProjectDialog onClose={() => setShowNewProject(false)} />}
    </aside>
  );
}
