import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CanvasSelection, ComponentVisualStyle, Diagnostic, LabProject, Program, ProjectStarterId, Statement, SwiftValue } from "../types";
import { projectStarterById, templates, templateById } from "../templates";
import { parseSwiftUI } from "../engine/parser";
import { executeStatements, initializeProgram, type RuntimeState } from "../engine/interpreter";

type Theme = "dark" | "light";

interface LabStore {
  selectedTemplateId: string;
  activeCustomProjectId: string | null;
  customProjects: LabProject[];
  code: string;
  codeByTemplate: Record<string, string>;
  program: Program | null;
  runtimeState: RuntimeState;
  diagnostics: Diagnostic[];
  logs: string[];
  running: boolean;
  theme: Theme;
  completed: string[];
  insertionRequest: { id: number; snippet: string } | null;
  canvasSelection: CanvasSelection | null;
  componentVisualStyles: Record<string, ComponentVisualStyle>;
  selectTemplate: (id: string) => void;
  selectCustomProject: (id: string) => void;
  createProject: (name: string, starterId: ProjectStarterId) => string;
  setCode: (code: string) => void;
  run: () => void;
  stop: () => void;
  resetRuntime: () => void;
  restoreTemplate: () => void;
  save: () => void;
  setBinding: (name: string, value: SwiftValue) => void;
  executeAction: (statements: Statement[]) => void;
  toggleTheme: () => void;
  clearConsole: () => void;
  requestInsertion: (snippet: string) => void;
  clearInsertionRequest: () => void;
  selectCanvasComponent: (selection: CanvasSelection | null) => void;
  updateComponentVisualStyle: (id: string, style: Partial<ComponentVisualStyle>) => void;
  resetComponentVisualStyle: (id: string) => void;
}

const defaultTemplate = templateById("promedio");
const defaultProgram = parseSwiftUI(defaultTemplate.code);
const defaultRuntime = initializeProgram(defaultProgram).state;

const stamp = () => new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const runCode = (code: string) => {
  const program = parseSwiftUI(code);
  const hasErrors = program.diagnostics.some((diagnostic) => diagnostic.severity === "error");
  const initialized = hasErrors ? { state: {}, diagnostics: [] as Diagnostic[] } : initializeProgram(program);
  return { program, state: initialized.state, diagnostics: [...program.diagnostics, ...initialized.diagnostics], hasErrors };
};

export const useLabStore = create<LabStore>()(
  persist(
    (set, get) => ({
      selectedTemplateId: defaultTemplate.id,
      activeCustomProjectId: null,
      customProjects: [],
      code: defaultTemplate.code,
      codeByTemplate: {},
      program: defaultProgram,
      runtimeState: defaultRuntime,
      diagnostics: defaultProgram.diagnostics,
      logs: [`${stamp()}  SwiftLab listo. Edita el código o pulsa Ejecutar.`],
      running: true,
      theme: "dark",
      completed: [],
      insertionRequest: null,
      canvasSelection: null,
      componentVisualStyles: {},

      selectTemplate: (id) => {
        const template = templateById(id);
        const code = get().codeByTemplate[id] ?? template.code;
        const result = runCode(code);
        set({
          selectedTemplateId: id,
          activeCustomProjectId: null,
          code,
          program: result.program,
          runtimeState: result.state,
          diagnostics: result.diagnostics,
          running: !result.hasErrors,
          logs: [`${stamp()}  Abierto: ${template.title}.`, result.hasErrors ? "La plantilla contiene errores pendientes." : "Vista compilada por el simulador educativo."],
          canvasSelection: null
        });
      },

      selectCustomProject: (id) => {
        const project = get().customProjects.find((item) => item.id === id);
        if (!project) return;
        const result = runCode(project.code);
        set({
          activeCustomProjectId: id,
          code: project.code,
          program: result.program,
          runtimeState: result.state,
          diagnostics: result.diagnostics,
          running: !result.hasErrors,
          logs: [`${stamp()}  Proyecto abierto: ${project.name}.`, result.hasErrors ? "El proyecto contiene errores pendientes." : "ContentView.swift compilado por el simulador."],
          canvasSelection: null
        });
      },

      createProject: (name, starterId) => {
        const starter = projectStarterById(starterId);
        const id = `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        const project: LabProject = { id, name: name.trim(), code: starter.code, starterId, createdAt: now, updatedAt: now };
        const result = runCode(project.code);
        set((state) => ({
          customProjects: [...state.customProjects, project],
          activeCustomProjectId: id,
          code: project.code,
          program: result.program,
          runtimeState: result.state,
          diagnostics: result.diagnostics,
          running: !result.hasErrors,
          logs: [`${stamp()}  Proyecto ${project.name} creado.`, "ContentView.swift está listo para editar."],
          canvasSelection: null
        }));
        return id;
      },

      setCode: (code) => set((state) => ({
        code,
        codeByTemplate: state.activeCustomProjectId ? state.codeByTemplate : { ...state.codeByTemplate, [state.selectedTemplateId]: code },
        customProjects: state.activeCustomProjectId
          ? state.customProjects.map((project) => project.id === state.activeCustomProjectId ? { ...project, code, updatedAt: new Date().toISOString() } : project)
          : state.customProjects
      })),

      run: () => {
        const { code, selectedTemplateId, activeCustomProjectId, completed } = get();
        const result = runCode(code);
        const template = templateById(selectedTemplateId);
        const nextCompleted = activeCustomProjectId || result.hasErrors || completed.includes(selectedTemplateId) ? completed : [...completed, selectedTemplateId];
        set({
          program: result.program,
          runtimeState: result.state,
          diagnostics: result.diagnostics,
          running: !result.hasErrors,
          completed: nextCompleted,
          logs: result.hasErrors
            ? [`${stamp()}  Ejecución detenida: ${result.diagnostics.filter((item) => item.severity === "error").length} error(es).`, "Revisa la línea indicada; la consola incluye una explicación educativa."]
            : [`${stamp()}  ${activeCustomProjectId ? "Proyecto" : template.title} ejecutado correctamente.`, `Estados inicializados: ${Object.keys(result.state).length}.`]
        });
      },

      stop: () => set({ running: false, logs: [`${stamp()}  Simulación detenida por el usuario.`] }),

      resetRuntime: () => {
        const program = get().program;
        if (!program) return;
        const initialized = initializeProgram(program);
        set({ runtimeState: initialized.state, running: true, logs: [`${stamp()}  Estado reiniciado.`] });
      },

      restoreTemplate: () => {
        const activeProjectId = get().activeCustomProjectId;
        if (activeProjectId) return;
        const template = templateById(get().selectedTemplateId);
        const result = runCode(template.code);
        set((state) => ({
          code: template.code,
          codeByTemplate: { ...state.codeByTemplate, [template.id]: template.code },
          program: result.program,
          runtimeState: result.state,
          diagnostics: result.diagnostics,
          running: !result.hasErrors,
          logs: [`${stamp()}  Código original restaurado.`]
        }));
      },

      save: () => {
        const { code, selectedTemplateId, activeCustomProjectId } = get();
        set((state) => ({
          codeByTemplate: activeCustomProjectId ? state.codeByTemplate : { ...state.codeByTemplate, [selectedTemplateId]: code },
          customProjects: activeCustomProjectId
            ? state.customProjects.map((project) => project.id === activeCustomProjectId ? { ...project, code, updatedAt: new Date().toISOString() } : project)
            : state.customProjects,
          logs: [`${stamp()}  ${activeCustomProjectId ? "Proyecto" : "Ejercicio"} guardado en este navegador.`]
        }));
      },

      setBinding: (name, value) => set((state) => ({ runtimeState: { ...state.runtimeState, [name]: value } })),

      executeAction: (statements) => {
        const result = executeStatements(statements, get().runtimeState);
        set((state) => ({
          runtimeState: result.state,
          diagnostics: [...state.diagnostics.filter((item) => item.severity !== "error"), ...result.diagnostics],
          logs: result.diagnostics.length ? [`${stamp()}  La acción terminó con observaciones.`] : [`${stamp()}  Acción del botón ejecutada.`]
        }));
      },

      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      clearConsole: () => set({ logs: [] }),
      requestInsertion: (snippet) => set({ insertionRequest: { id: Date.now(), snippet } }),
      clearInsertionRequest: () => set({ insertionRequest: null }),
      selectCanvasComponent: (canvasSelection) => set({ canvasSelection }),
      updateComponentVisualStyle: (id, style) => set((state) => ({
        componentVisualStyles: {
          ...state.componentVisualStyles,
          [id]: { ...state.componentVisualStyles[id], ...style }
        }
      })),
      resetComponentVisualStyle: (id) => set((state) => {
        const componentVisualStyles = { ...state.componentVisualStyles };
        delete componentVisualStyles[id];
        return { componentVisualStyles };
      })
    }),
    {
      name: "swiftlab-web-storage",
      partialize: (state) => ({
        codeByTemplate: state.codeByTemplate,
        customProjects: state.customProjects,
        componentVisualStyles: state.componentVisualStyles,
        theme: state.theme,
        completed: state.completed
      })
    }
  )
);

export const supportedSyntax = [
  "@State con String, Int, Double y Bool",
  "VStack, HStack, ZStack, Text y Spacer",
  "TextField, SecureField, Toggle y Button",
  "Image(systemName:) con símbolos frecuentes",
  "if / else, variables locales y asignaciones",
  "+, −, ×, ÷, %, comparaciones y operadores lógicos",
  "Double(texto) ?? 0, Int(texto) y String(format:)"
];

export const templateCount = templates.length;
