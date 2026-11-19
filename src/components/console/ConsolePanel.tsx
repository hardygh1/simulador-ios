import { useState } from "react";
import { Bug, ChevronDown, CircleAlert, Info, ListChecks, Trash2 } from "lucide-react";
import { supportedSyntax, useLabStore } from "../../store/useLabStore";

type ConsoleTab = "console" | "problems" | "syntax";

export function ConsolePanel() {
  const [tab, setTab] = useState<ConsoleTab>("console");
  const [collapsed, setCollapsed] = useState(false);
  const logs = useLabStore((state) => state.logs);
  const diagnostics = useLabStore((state) => state.diagnostics);
  const clearConsole = useLabStore((state) => state.clearConsole);
  const errorCount = diagnostics.filter((item) => item.severity === "error").length;

  return (
    <section className={`console-panel ${collapsed ? "collapsed" : ""}`} aria-label="Consola y problemas">
      <div className="console-tabs">
        <button className={tab === "console" ? "active" : ""} onClick={() => setTab("console")} type="button"><Bug size={14} /> Consola</button>
        <button className={tab === "problems" ? "active" : ""} onClick={() => setTab("problems")} type="button"><CircleAlert size={14} /> Problemas {errorCount > 0 && <span>{errorCount}</span>}</button>
        <button className={tab === "syntax" ? "active" : ""} onClick={() => setTab("syntax")} type="button"><ListChecks size={14} /> Sintaxis</button>
        <div className="console-spacer" />
        <button type="button" title="Limpiar consola" onClick={clearConsole}><Trash2 size={14} /></button>
        <button type="button" title={collapsed ? "Expandir" : "Contraer"} onClick={() => setCollapsed((value) => !value)}><ChevronDown className={collapsed ? "rotate" : ""} size={15} /></button>
      </div>

      {!collapsed && (
        <div className="console-content">
          {tab === "console" && (
            <div className="log-lines">
              {logs.length === 0 ? <p className="muted-line">La consola está vacía.</p> : logs.map((log, index) => <p key={`${log}-${index}`}><span>›</span>{log}</p>)}
            </div>
          )}
          {tab === "problems" && (
            <div className="problem-list">
              {diagnostics.length === 0 ? (
                <p className="success-line"><span>✓</span> Sin problemas. El subconjunto pudo analizar el código.</p>
              ) : diagnostics.map((diagnostic, index) => (
                <article key={`${diagnostic.message}-${index}`} className={`problem ${diagnostic.severity}`}>
                  <CircleAlert size={15} />
                  <div><strong>Línea {diagnostic.line}, columna {diagnostic.column}</strong><p>{diagnostic.message}</p>{diagnostic.hint && <small>{diagnostic.hint}</small>}</div>
                </article>
              ))}
            </div>
          )}
          {tab === "syntax" && (
            <div className="syntax-grid">
              {supportedSyntax.map((item) => <div key={item}><Info size={14} /><span>{item}</span></div>)}
              <p>SwiftLab interpreta un subconjunto educativo. No compila Swift completo ni reemplaza Xcode.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
