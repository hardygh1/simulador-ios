import { describe, expect, it } from "vitest";
import { projectStarters, templates, templateById } from "../templates";
import { evaluateExpression } from "./interpreter";
import { parseExpressionSource, parseSwiftUI } from "./parser";
import { isUIKitSource, parseSwiftSource, parseUIKit } from "./uikit";

describe("SwiftLab UIKit engine", () => {
  it("reconoce un controlador UIKit", () => {
    expect(isUIKitSource(templateById("promedio").code)).toBe(true);
  });

  it("valida import UIKit y UIViewController", () => {
    const program = parseUIKit(templateById("hola-mundo").code);
    expect(program.diagnostics.filter((item) => item.severity === "error")).toHaveLength(0);
  });

  it("detecta cuando falta importar UIKit", () => {
    const program = parseUIKit("class ViewController: UIViewController {}");
    expect(program.diagnostics.some((item) => item.message.includes("Falta importar UIKit"))).toBe(true);
  });

  it("detecta llaves sin cerrar", () => {
    const program = parseUIKit("import UIKit\nclass ViewController: UIViewController {");
    expect(program.diagnostics.some((item) => item.message.includes("llaves"))).toBe(true);
  });

  it("usa el código de PromedioApp entregado en clase", () => {
    const code = templateById("promedio").code;
    expect(code).toContain("class PromedioViewController: UIViewController");
    expect(code).toContain("@IBOutlet weak var txtNombre: UITextField!");
    expect(code).toContain("@IBAction func btnCalcularPromedio");
    expect(code).toContain("lblResultado.textColor = .blue");
  });

  it("analiza todas las prácticas UIKit sin errores", () => {
    for (const template of templates) {
      const errors = parseUIKit(template.code).diagnostics.filter((item) => item.severity === "error");
      expect(errors, `${template.title}: ${errors.map((item) => item.message).join(" | ")}`).toHaveLength(0);
    }
  });

  it("analiza los nuevos proyectos Storyboard", () => {
    for (const starter of projectStarters) {
      const errors = parseUIKit(starter.code).diagnostics.filter((item) => item.severity === "error");
      expect(errors, `${starter.name}: ${errors.map((item) => item.message).join(" | ")}`).toHaveLength(0);
    }
  });

  it("mantiene el intérprete de expresiones Swift", () => {
    const expression = parseExpressionSource("(4 + 2) * 3 / 2");
    expect(evaluateExpression(expression, {})).toBe(9);
  });

  it("conserva compatibilidad con proyectos SwiftUI existentes", () => {
    const source = `import SwiftUI\nstruct ContentView: View {\n  var body: some View { VStack { Text("Hola") } }\n}`;
    const program = parseSwiftSource(source, parseSwiftUI);
    expect(program.root?.kind).toBe("stack");
  });
});
