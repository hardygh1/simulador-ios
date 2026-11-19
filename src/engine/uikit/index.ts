import type { Diagnostic, Program } from "../../types";

const lineOf = (source: string, search: string) => {
  const index = source.indexOf(search);
  return index < 0 ? 1 : source.slice(0, index).split("\n").length;
};

export const isUIKitSource = (source: string) => /\bimport\s+UIKit\b/.test(source) || /\bUIViewController\b/.test(source);

export function parseUIKit(source: string): Program {
  const diagnostics: Diagnostic[] = [];
  if (!/\bimport\s+UIKit\b/.test(source)) {
    diagnostics.push({ severity: "error", message: "Falta importar UIKit.", line: 1, column: 1, hint: "Agrega import UIKit al inicio del archivo." });
  }
  if (!/class\s+\w+\s*:\s*UIViewController/.test(source)) {
    diagnostics.push({ severity: "error", message: "Falta una clase que herede de UIViewController.", line: 1, column: 1, hint: "Ejemplo: class ViewController: UIViewController { ... }" });
  }
  if (!/override\s+func\s+viewDidLoad\s*\(/.test(source)) {
    diagnostics.push({ severity: "warning", message: "No encontré viewDidLoad().", line: lineOf(source, "class"), column: 1, hint: "Agrégalo para preparar la pantalla cuando se carga." });
  }
  const opening = (source.match(/\{/g) ?? []).length;
  const closing = (source.match(/\}/g) ?? []).length;
  if (opening !== closing) {
    diagnostics.push({ severity: "error", message: "Las llaves del archivo no están balanceadas.", line: source.split("\n").length, column: 1, hint: `Hay ${opening} llaves de apertura y ${closing} de cierre.` });
  }
  for (const match of source.matchAll(/@IBOutlet\s+weak\s+var\s+(\w+)\s*:\s*(\w+)!/g)) {
    if (!match[1] || !match[2]) diagnostics.push({ severity: "error", message: "IBOutlet incompleto.", line: lineOf(source, match[0]), column: 1 });
  }
  return { states: [], root: null, diagnostics };
}

export const parseSwiftSource = (source: string, swiftUIParser: (value: string) => Program) => isUIKitSource(source) ? parseUIKit(source) : swiftUIParser(source);
