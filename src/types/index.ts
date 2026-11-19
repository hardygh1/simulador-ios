export type SwiftValue = string | number | boolean | null;

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  line: number;
  column: number;
  hint?: string;
}

export type Expression =
  | { kind: "literal"; value: SwiftValue }
  | { kind: "identifier"; name: string }
  | { kind: "unary"; operator: string; operand: Expression }
  | { kind: "binary"; operator: string; left: Expression; right: Expression }
  | { kind: "call"; callee: string; args: Expression[]; labels: Array<string | null> };

export type Statement =
  | { kind: "declare"; name: string; value: Expression }
  | { kind: "assign"; name: string; operator: string; value: Expression }
  | { kind: "if"; condition: Expression; then: Statement[]; otherwise: Statement[] };

export interface Modifier {
  name: string;
  args: Expression[];
}

export type UINode =
  | { kind: "stack"; axis: "vertical" | "horizontal" | "depth"; children: UINode[]; modifiers: Modifier[] }
  | { kind: "text"; value: Expression; modifiers: Modifier[] }
  | { kind: "textField"; secure: boolean; label: Expression; binding: string; modifiers: Modifier[] }
  | { kind: "button"; label: Expression; action: Statement[]; modifiers: Modifier[] }
  | { kind: "toggle"; label: Expression; binding: string; modifiers: Modifier[] }
  | { kind: "image"; systemName: Expression; modifiers: Modifier[] }
  | { kind: "spacer"; modifiers: Modifier[] }
  | { kind: "conditional"; condition: Expression; then: UINode[]; otherwise: UINode[]; modifiers: Modifier[] };

export interface StateDeclaration {
  name: string;
  type?: string;
  initialValue: Expression;
}

export interface Program {
  states: StateDeclaration[];
  root: UINode | null;
  diagnostics: Diagnostic[];
}

export interface ExerciseTemplate {
  id: string;
  title: string;
  level: "Inicial" | "Intermedio";
  topic: string;
  description: string;
  expected: string;
  code: string;
  source?: string;
  framework?: "uikit" | "swiftui";
  fileName?: string;
}

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  focus: string;
}

export type ProjectStarterId = "blank" | "counter" | "average";

export interface LabProject {
  id: string;
  name: string;
  code: string;
  starterId: ProjectStarterId;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasSelection {
  id: string;
  kind: string;
  name: string;
}

export interface ComponentVisualStyle {
  width?: number;
  height?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  padding?: number;
  cornerRadius?: number;
  fontSize?: number;
}
