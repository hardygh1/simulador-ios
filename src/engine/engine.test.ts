import { describe, expect, it } from "vitest";
import type { UINode } from "../types";
import { projectStarters, templates, templateById } from "../templates";
import { evaluateExpression, executeStatements, initializeProgram } from "./interpreter";
import { parseExpressionSource, parseSwiftUI } from "./parser";

const findNode = <K extends UINode["kind"]>(root: UINode | null, kind: K): Extract<UINode, { kind: K }> | null => {
  if (!root) return null;
  if (root.kind === kind) return root as Extract<UINode, { kind: K }>;
  if (root.kind === "stack") {
    for (const child of root.children) {
      const found = findNode(child, kind);
      if (found) return found;
    }
  }
  if (root.kind === "conditional") {
    for (const child of [...root.then, ...root.otherwise]) {
      const found = findNode(child, kind);
      if (found) return found;
    }
  }
  return null;
};

describe("SwiftLab engine", () => {
  it("declara e inicializa variables @State", () => {
    const program = parseSwiftUI(templateById("contador").code);
    const runtime = initializeProgram(program);
    expect(program.states.map((item) => item.name)).toContain("contador");
    expect(runtime.state.contador).toBe(0);
  });

  it("evalúa operaciones matemáticas con precedencia", () => {
    const expression = parseExpressionSource("(4 + 2) * 3 / 2");
    expect(evaluateExpression(expression, {})).toBe(9);
  });

  it("construye un AST con VStack y Text", () => {
    const program = parseSwiftUI(templateById("hola-mundo").code);
    expect(program.diagnostics.filter((item) => item.severity === "error")).toHaveLength(0);
    expect(program.root?.kind).toBe("stack");
    expect(findNode(program.root, "text")).not.toBeNull();
  });

  it("conserva el binding de TextField", () => {
    const program = parseSwiftUI(templateById("calculadora").code);
    const field = findNode(program.root, "textField");
    expect(field?.binding).toBe("numeroA");
  });

  it("ejecuta acciones Button y actualiza @State", () => {
    const program = parseSwiftUI(templateById("contador").code);
    const button = findNode(program.root, "button");
    expect(button).not.toBeNull();
    const result = executeStatements(button!.action, { contador: 5 });
    expect(result.state.contador).toBe(4);
  });

  it("calcula el promedio de tres notas", () => {
    const program = parseSwiftUI(templateById("promedio").code);
    const button = findNode(program.root, "button");
    const result = executeStatements(button!.action, {
      nota1: "16",
      nota2: "14",
      nota3: "18",
      promedio: 0,
      mensaje: ""
    });
    expect(result.state.promedio).toBe(16);
    expect(result.state.mensaje).toBe("Aprobado");
  });

  it("rechaza notas fuera del rango 0 a 20", () => {
    const program = parseSwiftUI(templateById("promedio").code);
    const button = findNode(program.root, "button");
    const result = executeStatements(button!.action, {
      nota1: "21",
      nota2: "14",
      nota3: "18",
      promedio: 0,
      mensaje: ""
    });
    expect(result.state.promedio).toBe(0);
    expect(result.state.mensaje).toContain("entre 0 y 20");
  });

  it("explica características no soportadas", () => {
    const source = `import SwiftUI
struct ContentView: View {
  var body: some View {
    List { Text("Pendiente") }
  }
}`;
    const program = parseSwiftUI(source);
    expect(program.diagnostics.some((item) => item.message.includes("List todavía no está disponible"))).toBe(true);
  });

  it("analiza todas las plantillas precargadas sin errores", () => {
    for (const template of templates) {
      const errors = parseSwiftUI(template.code).diagnostics.filter((item) => item.severity === "error");
      expect(errors, `${template.title}: ${errors.map((item) => item.message).join(" | ")}`).toHaveLength(0);
    }
  });

  it("analiza las plantillas de nuevos proyectos", () => {
    for (const starter of projectStarters) {
      const errors = parseSwiftUI(starter.code).diagnostics.filter((item) => item.severity === "error");
      expect(errors, `${starter.name}: ${errors.map((item) => item.message).join(" | ")}`).toHaveLength(0);
    }
  });
});
