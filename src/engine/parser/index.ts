import { lexSwift, type Token } from "../lexer";
import type { Diagnostic, Expression, Modifier, Program, StateDeclaration, Statement, UINode } from "../../types";

const supportedNodes = new Set(["VStack", "HStack", "ZStack", "Text", "TextField", "SecureField", "Button", "Toggle", "Image", "Spacer"]);
const unsupportedFeatures: Record<string, string> = {
  List: "List todavía no está disponible. Practica primero con VStack.",
  NavigationStack: "NavigationStack se incorporará en una fase posterior.",
  NavigationView: "La navegación todavía no forma parte de este subconjunto.",
  ForEach: "ForEach todavía no está disponible. Escribe elementos explícitos para esta práctica.",
  while: "Los bucles no se ejecutan todavía para proteger el simulador de ciclos infinitos.",
  repeat: "repeat-while todavía no está disponible en esta fase.",
  for: "Los bucles for todavía no están disponibles en esta fase.",
  switch: "switch todavía no está disponible. Usa if / else por ahora.",
  UIViewController: "Este laboratorio ejecuta SwiftUI educativo. El código UIKit se conserva como material de referencia.",
  IBOutlet: "IBOutlet pertenece a UIKit y Storyboard; usa @State y TextField en el simulador.",
  IBAction: "IBAction pertenece a UIKit y Storyboard; usa Button en el simulador."
};

const binaryPrecedence: Record<string, number> = {
  "??": 1,
  "||": 2,
  "&&": 3,
  "==": 4,
  "!=": 4,
  "<": 5,
  "<=": 5,
  ">": 5,
  ">=": 5,
  "+": 6,
  "-": 6,
  "*": 7,
  "/": 7,
  "%": 7
};

export class SwiftUIParser {
  private readonly tokens: Token[];
  private position = 0;
  private readonly diagnostics: Diagnostic[] = [];

  constructor(source: string) {
    this.tokens = lexSwift(source);
  }

  parse(): Program {
    this.reportUnsupportedFeatures();
    const states = this.collectStateDeclarations();
    const root = this.parseBodyRoot();

    if (!root && !this.diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
      this.diagnostics.push({
        severity: "error",
        message: "No encontré una vista raíz compatible dentro de body.",
        line: 1,
        column: 1,
        hint: "Usa VStack, HStack o ZStack como vista principal."
      });
    }

    return { states, root, diagnostics: this.uniqueDiagnostics() };
  }

  parseStandaloneExpression(): Expression {
    this.position = 0;
    return this.parseExpression();
  }

  private reportUnsupportedFeatures() {
    for (const token of this.tokens) {
      const message = unsupportedFeatures[token.value];
      if (!message) continue;
      this.diagnostics.push({
        severity: "error",
        message,
        line: token.line,
        column: token.column,
        hint: "Consulta la pestaña Sintaxis para ver lo que sí admite SwiftLab."
      });
    }
  }

  private collectStateDeclarations(): StateDeclaration[] {
    const declarations: StateDeclaration[] = [];
    const previous = this.position;

    for (let index = 0; index < this.tokens.length - 2; index += 1) {
      if (this.tokens[index].value !== "@" || this.tokens[index + 1].value !== "State") continue;
      this.position = index + 2;
      this.skipNewlines();
      if (this.current().value === "private") this.advance();
      if (!["var", "let"].includes(this.current().value)) {
        this.addError(this.current(), "Después de @State se esperaba var.");
        continue;
      }
      this.advance();
      const name = this.current();
      if (name.kind !== "identifier") {
        this.addError(name, "La variable @State necesita un nombre válido.");
        continue;
      }
      this.advance();
      let type: string | undefined;
      if (this.match(":")) {
        const typeParts: string[] = [];
        while (!this.atEnd() && this.current().value !== "=" && this.current().kind !== "newline") {
          typeParts.push(this.advance().value);
        }
        type = typeParts.join("");
      }
      if (!this.match("=")) {
        this.addError(this.current(), `@State ${name.value} necesita un valor inicial.`);
        continue;
      }
      const initialValue = this.parseExpression();
      declarations.push({ name: name.value, type, initialValue });
      index = Math.max(index, this.position - 1);
    }

    this.position = previous;
    return declarations;
  }

  private parseBodyRoot(): UINode | null {
    const bodyIndex = this.tokens.findIndex((token) => token.value === "body");
    if (bodyIndex < 0) {
      this.diagnostics.push({
        severity: "error",
        message: "Falta la propiedad body de la vista.",
        line: 1,
        column: 1,
        hint: "Agrega: var body: some View { ... }"
      });
      return null;
    }

    this.position = bodyIndex + 1;
    while (!this.atEnd() && this.current().value !== "{") this.advance();
    if (!this.match("{")) {
      this.addError(this.current(), "No encontré el bloque de body.");
      return null;
    }
    this.skipNewlines();
    return this.parseNode();
  }

  private parseNode(): UINode | null {
    this.skipNewlines();
    const token = this.current();

    if (token.value === "if") return this.parseConditional();
    if (token.kind !== "identifier") {
      this.addError(token, `Se esperaba una vista SwiftUI y se encontró “${token.value || "fin del archivo"}”.`);
      this.recoverNode();
      return null;
    }
    if (!supportedNodes.has(token.value)) {
      this.addError(token, `La vista ${token.value} no está soportada todavía.`);
      this.recoverNode();
      return null;
    }

    const name = this.advance().value;
    switch (name) {
      case "VStack":
      case "HStack":
      case "ZStack":
        return this.parseStack(name);
      case "Text":
        return this.parseText();
      case "TextField":
      case "SecureField":
        return this.parseTextField(name === "SecureField");
      case "Button":
        return this.parseButton();
      case "Toggle":
        return this.parseToggle();
      case "Image":
        return this.parseImage();
      case "Spacer":
        return this.parseSpacer();
      default:
        return null;
    }
  }

  private parseStack(name: "VStack" | "HStack" | "ZStack"): UINode {
    if (this.current().value === "(") this.skipBalanced("(", ")");
    const children: UINode[] = [];
    if (!this.match("{")) {
      this.addError(this.current(), `${name} necesita un bloque entre llaves.`);
    } else {
      while (!this.atEnd() && this.current().value !== "}") {
        this.skipNewlines();
        if (this.current().value === "}") break;
        const node = this.parseNode();
        if (node) children.push(node);
        this.skipNewlines();
      }
      this.expect("}", `Falta cerrar ${name} con }.`);
    }
    const axis = name === "VStack" ? "vertical" : name === "HStack" ? "horizontal" : "depth";
    return { kind: "stack", axis, children, modifiers: this.parseModifiers() };
  }

  private parseText(): UINode {
    this.expect("(", "Text necesita paréntesis.");
    const value = this.parseExpression();
    this.expect(")", "Falta ) al final de Text.");
    return { kind: "text", value, modifiers: this.parseModifiers() };
  }

  private parseTextField(secure: boolean): UINode {
    this.expect("(", `${secure ? "SecureField" : "TextField"} necesita paréntesis.`);
    const label = this.parseExpression();
    this.expect(",", "Falta separar el texto y el binding con una coma.");
    if (this.current().value === "text") this.advance();
    this.match(":");
    this.expect("$", "El campo necesita un binding como $nombre.");
    const binding = this.current().kind === "identifier" ? this.advance().value : "";
    if (!binding) this.addError(this.current(), "El binding del campo no es válido.");
    this.expect(")", "Falta ) al final del campo.");
    return { kind: "textField", secure, label, binding, modifiers: this.parseModifiers() };
  }

  private parseButton(): UINode {
    this.expect("(", "Button necesita un título entre paréntesis.");
    const label = this.parseExpression();
    this.expect(")", "Falta ) después del título del botón.");
    const action = this.parseStatementBlock("Button necesita un bloque de acciones entre llaves.");
    return { kind: "button", label, action, modifiers: this.parseModifiers() };
  }

  private parseToggle(): UINode {
    this.expect("(", "Toggle necesita paréntesis.");
    const label = this.parseExpression();
    this.expect(",", "Falta la coma antes de isOn.");
    if (this.current().value === "isOn") this.advance();
    this.match(":");
    this.expect("$", "Toggle necesita un binding booleano como $activo.");
    const binding = this.current().kind === "identifier" ? this.advance().value : "";
    this.expect(")", "Falta ) al final de Toggle.");
    return { kind: "toggle", label, binding, modifiers: this.parseModifiers() };
  }

  private parseImage(): UINode {
    this.expect("(", "Image necesita paréntesis.");
    if (this.current().value === "systemName") this.advance();
    this.match(":");
    const systemName = this.parseExpression();
    this.expect(")", "Falta ) al final de Image.");
    return { kind: "image", systemName, modifiers: this.parseModifiers() };
  }

  private parseSpacer(): UINode {
    if (this.match("(")) this.expect(")", "Spacer no recibe argumentos en esta versión.");
    return { kind: "spacer", modifiers: this.parseModifiers() };
  }

  private parseConditional(): UINode {
    this.expect("if", "Se esperaba if.");
    const condition = this.parseExpression();
    const then = this.parseNodeBlock("El if necesita una vista entre llaves.");
    this.skipNewlines();
    let otherwise: UINode[] = [];
    if (this.match("else")) otherwise = this.parseNodeBlock("else necesita una vista entre llaves.");
    return { kind: "conditional", condition, then, otherwise, modifiers: [] };
  }

  private parseNodeBlock(message: string): UINode[] {
    const nodes: UINode[] = [];
    if (!this.match("{")) {
      this.addError(this.current(), message);
      return nodes;
    }
    while (!this.atEnd() && this.current().value !== "}") {
      this.skipNewlines();
      if (this.current().value === "}") break;
      const node = this.parseNode();
      if (node) nodes.push(node);
    }
    this.expect("}", "Falta cerrar el bloque con }.");
    return nodes;
  }

  private parseModifiers(): Modifier[] {
    const modifiers: Modifier[] = [];
    while (true) {
      this.skipNewlines();
      if (!this.match(".")) break;
      const name = this.current().kind === "identifier" ? this.advance().value : "";
      if (!name) {
        this.addError(this.current(), "Se esperaba el nombre de un modificador.");
        break;
      }
      const args: Expression[] = [];
      if (this.match("(")) {
        while (!this.atEnd() && this.current().value !== ")") {
          if (this.current().kind === "identifier" && this.peek().value === ":") {
            this.advance();
            this.advance();
          }
          args.push(this.parseExpression());
          if (!this.match(",")) break;
        }
        this.expect(")", `Falta ) en .${name}.`);
      }
      modifiers.push({ name, args });
    }
    return modifiers;
  }

  private parseStatementBlock(message: string): Statement[] {
    const statements: Statement[] = [];
    if (!this.match("{")) {
      this.addError(this.current(), message);
      return statements;
    }
    while (!this.atEnd() && this.current().value !== "}") {
      this.skipSeparators();
      if (this.current().value === "}") break;
      const statement = this.parseStatement();
      if (statement) statements.push(statement);
      else this.recoverStatement();
      this.skipSeparators();
    }
    this.expect("}", "Falta cerrar el bloque de acciones con }.");
    return statements;
  }

  private parseStatement(): Statement | null {
    if (this.match("if")) {
      const condition = this.parseExpression();
      const then = this.parseStatementBlock("El if necesita un bloque entre llaves.");
      this.skipNewlines();
      let otherwise: Statement[] = [];
      if (this.match("else")) otherwise = this.parseStatementBlock("else necesita un bloque entre llaves.");
      return { kind: "if", condition, then, otherwise };
    }

    if (this.current().value === "let" || this.current().value === "var") {
      this.advance();
      const name = this.current();
      if (name.kind !== "identifier") {
        this.addError(name, "La variable local necesita un nombre.");
        return null;
      }
      this.advance();
      if (this.match(":")) {
        while (!this.atEnd() && this.current().value !== "=" && this.current().kind !== "newline") this.advance();
      }
      this.expect("=", `Falta = al declarar ${name.value}.`);
      return { kind: "declare", name: name.value, value: this.parseExpression() };
    }

    const name = this.current();
    if (name.kind === "identifier" && ["=", "+=", "-=", "*=", "/="].includes(this.peek().value)) {
      this.advance();
      const operator = this.advance().value;
      return { kind: "assign", name: name.value, operator, value: this.parseExpression() };
    }

    this.addError(this.current(), `La instrucción “${this.current().value}” no está soportada dentro de Button.`);
    return null;
  }

  private parseExpression(minPrecedence = 0): Expression {
    this.skipInlineNewlines();
    let left = this.parsePrefix();

    while (true) {
      const token = this.current();
      const precedence = binaryPrecedence[token.value];
      if (precedence === undefined || precedence < minPrecedence) break;
      this.advance();
      const right = this.parseExpression(precedence + 1);
      left = { kind: "binary", operator: token.value, left, right };
    }
    return left;
  }

  private parsePrefix(): Expression {
    const token = this.current();
    if (token.value === "!" || token.value === "-") {
      this.advance();
      return { kind: "unary", operator: token.value, operand: this.parseExpression(8) };
    }
    if (this.match("(")) {
      const expression = this.parseExpression();
      this.expect(")", "Falta cerrar la expresión con ).");
      return expression;
    }
    if (token.kind === "number") {
      this.advance();
      return { kind: "literal", value: Number(token.value) };
    }
    if (token.kind === "string") {
      this.advance();
      return { kind: "literal", value: token.value };
    }
    if (token.value === "true" || token.value === "false") {
      this.advance();
      return { kind: "literal", value: token.value === "true" };
    }
    if (token.value === "nil") {
      this.advance();
      return { kind: "literal", value: null };
    }
    if (token.value === ".") {
      this.advance();
      const member = this.advance();
      return { kind: "literal", value: `.${member.value}` };
    }
    if (token.kind === "identifier") {
      const name = this.advance().value;
      if (this.match("(")) {
        const args: Expression[] = [];
        const labels: Array<string | null> = [];
        while (!this.atEnd() && this.current().value !== ")") {
          let label: string | null = null;
          if (this.current().kind === "identifier" && this.peek().value === ":") {
            label = this.advance().value;
            this.advance();
          }
          labels.push(label);
          args.push(this.parseExpression());
          if (!this.match(",")) break;
        }
        this.expect(")", `Falta ) al llamar ${name}.`);
        return { kind: "call", callee: name, args, labels };
      }
      return { kind: "identifier", name };
    }

    this.addError(token, `No pude interpretar la expresión cerca de “${token.value || "fin del archivo"}”.`);
    if (!this.atEnd()) this.advance();
    return { kind: "literal", value: null };
  }

  private skipBalanced(open: string, close: string) {
    if (!this.match(open)) return;
    let depth = 1;
    while (!this.atEnd() && depth > 0) {
      const value = this.advance().value;
      if (value === open) depth += 1;
      if (value === close) depth -= 1;
    }
  }

  private recoverNode() {
    while (!this.atEnd() && this.current().kind !== "newline" && this.current().value !== "}") this.advance();
  }

  private recoverStatement() {
    while (!this.atEnd() && this.current().kind !== "newline" && this.current().value !== ";" && this.current().value !== "}") this.advance();
  }

  private skipNewlines() {
    while (this.current().kind === "newline") this.advance();
  }

  private skipInlineNewlines() {
    while (this.current().kind === "newline") this.advance();
  }

  private skipSeparators() {
    while (this.current().kind === "newline" || this.current().value === ";") this.advance();
  }

  private expect(value: string, message: string) {
    if (this.match(value)) return true;
    this.addError(this.current(), message);
    return false;
  }

  private match(value: string) {
    if (this.current().value !== value) return false;
    this.advance();
    return true;
  }

  private current() {
    return this.tokens[this.position] ?? this.tokens[this.tokens.length - 1];
  }

  private peek(offset = 1) {
    return this.tokens[this.position + offset] ?? this.tokens[this.tokens.length - 1];
  }

  private advance() {
    const token = this.current();
    if (!this.atEnd()) this.position += 1;
    return token;
  }

  private atEnd() {
    return this.current().kind === "eof";
  }

  private addError(token: Token, message: string) {
    this.diagnostics.push({ severity: "error", message, line: token.line, column: token.column });
  }

  private uniqueDiagnostics() {
    const seen = new Set<string>();
    return this.diagnostics.filter((diagnostic) => {
      const key = `${diagnostic.line}:${diagnostic.column}:${diagnostic.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const parseSwiftUI = (source: string) => new SwiftUIParser(source).parse();
export const parseExpressionSource = (source: string) => new SwiftUIParser(source).parseStandaloneExpression();
