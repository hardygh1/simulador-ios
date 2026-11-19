import { beforeEach, describe, expect, it } from "vitest";
import { useLabStore } from "./useLabStore";

describe("gestión de proyectos", () => {
  beforeEach(() => {
    useLabStore.setState({ customProjects: [], activeCustomProjectId: null, insertionRequest: null, canvasSelection: null, componentVisualStyles: {} });
  });

  it("crea y abre un proyecto SwiftUI local", () => {
    const id = useLabStore.getState().createProject("MiProyecto", "blank");
    const state = useLabStore.getState();
    expect(state.activeCustomProjectId).toBe(id);
    expect(state.customProjects).toHaveLength(1);
    expect(state.customProjects[0].name).toBe("MiProyecto");
    expect(state.code).toContain("struct ContentView: View");
  });

  it("publica una solicitud de inserción para la biblioteca SwiftUI", () => {
    useLabStore.getState().requestInsertion("Text(\"Hola\")");
    expect(useLabStore.getState().insertionRequest?.snippet).toBe("Text(\"Hola\")");
    useLabStore.getState().clearInsertionRequest();
    expect(useLabStore.getState().insertionRequest).toBeNull();
  });

  it("selecciona un componente y conserva sus propiedades visuales", () => {
    const selection = { id: "project-1:root-0", kind: "text", name: "Text" };
    useLabStore.getState().selectCanvasComponent(selection);
    useLabStore.getState().updateComponentVisualStyle(selection.id, { width: 180, foregroundColor: "#ff0000" });
    expect(useLabStore.getState().canvasSelection).toEqual(selection);
    expect(useLabStore.getState().componentVisualStyles[selection.id]).toMatchObject({ width: 180, foregroundColor: "#ff0000" });
    useLabStore.getState().resetComponentVisualStyle(selection.id);
    expect(useLabStore.getState().componentVisualStyles[selection.id]).toBeUndefined();
  });
});
