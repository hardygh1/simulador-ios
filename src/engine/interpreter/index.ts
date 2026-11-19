import type { Diagnostic, Expression, Program, Statement, SwiftValue } from "../../types";
import { parseExpressionSource } from "../parser";

export type RuntimeState = Record<string, SwiftValue>;

export interface ExecutionResult {
  state: RuntimeState;
  diagnostics: Diagnostic[];
}

const numeric = (value: SwiftValue): number => {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : 0;
};

const truthy = (value: SwiftValue): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  return false;
};

const display = (value: SwiftValue): string => {
  if (value === null) return "";
  if (typeof value === "number" && Number.isFinite(value)) return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(8)));
  return String(value);
};

export function evaluateExpression(expression: Expression, scope: RuntimeState): SwiftValue {
  switch (expression.kind) {
    case "literal":
      return typeof expression.value === "string" ? interpolateString(expression.value, scope) : expression.value;
    case "identifier":
      return scope[expression.name] ?? null;
    case "unary": {
      const value = evaluateExpression(expression.operand, scope);
      return expression.operator === "!" ? !truthy(value) : -numeric(value);
    }
    case "binary": {
      if (expression.operator === "&&") return truthy(evaluateExpression(expression.left, scope)) && truthy(evaluateExpression(expression.right, scope));
      if (expression.operator === "||") return truthy(evaluateExpression(expression.left, scope)) || truthy(evaluateExpression(expression.right, scope));
      const left = evaluateExpression(expression.left, scope);
      if (expression.operator === "??" && left !== null) return left;
      const right = evaluateExpression(expression.right, scope);
      switch (expression.operator) {
        case "??": return right;
        case "+": return typeof left === "string" || typeof right === "string" ? display(left) + display(right) : numeric(left) + numeric(right);
        case "-": return numeric(left) - numeric(right);
        case "*": return numeric(left) * numeric(right);
        case "/": return numeric(right) === 0 ? 0 : numeric(left) / numeric(right);
        case "%": return numeric(right) === 0 ? 0 : numeric(left) % numeric(right);
        case "==": return left === right || (typeof left === "number" && numeric(left) === numeric(right));
        case "!=": return !(left === right || (typeof left === "number" && numeric(left) === numeric(right)));
        case "<": return numeric(left) < numeric(right);
        case "<=": return numeric(left) <= numeric(right);
        case ">": return numeric(left) > numeric(right);
        case ">=": return numeric(left) >= numeric(right);
        default: return null;
      }
    }
    case "call": {
      const args = expression.args.map((argument) => evaluateExpression(argument, scope));
      if (expression.callee === "Double") {
        const value = Number(args[0]);
        return Number.isFinite(value) ? value : null;
      }
      if (expression.callee === "Int") {
        const value = Number(args[0]);
        return Number.isFinite(value) ? Math.trunc(value) : null;
      }
      if (expression.callee === "Bool") return truthy(args[0]);
      if (expression.callee === "abs") return Math.abs(numeric(args[0]));
      if (expression.callee === "min") return Math.min(...args.map(numeric));
      if (expression.callee === "max") return Math.max(...args.map(numeric));
      if (expression.callee === "String") {
        const formatIndex = expression.labels.findIndex((label) => label === "format");
        if (formatIndex >= 0) {
          const format = display(args[formatIndex]);
          const value = args[formatIndex + 1] ?? args[1] ?? 0;
          const decimalsMatch = format.match(/%\.([0-9]+)f/);
          return decimalsMatch ? numeric(value).toFixed(Number(decimalsMatch[1])) : display(value);
        }
        return display(args[0]);
      }
      return null;
    }
  }
}

function interpolateString(template: string, scope: RuntimeState): string {
  let result = "";
  let index = 0;
  while (index < template.length) {
    if (template[index] !== "\\" || template[index + 1] !== "(") {
      result += template[index];
      index += 1;
      continue;
    }

    let cursor = index + 2;
    let depth = 1;
    let inString = false;
    while (cursor < template.length && depth > 0) {
      const char = template[cursor];
      const previous = template[cursor - 1];
      if (char === '"' && previous !== "\\") inString = !inString;
      if (!inString && char === "(") depth += 1;
      if (!inString && char === ")") depth -= 1;
      cursor += 1;
    }

    if (depth !== 0) {
      result += template.slice(index);
      break;
    }
    const expressionSource = template.slice(index + 2, cursor - 1);
    try {
      const expression = parseExpressionSource(expressionSource);
      result += display(evaluateExpression(expression, scope));
    } catch {
      result += `\\(${expressionSource})`;
    }
    index = cursor;
  }
  return result;
}

export function initializeProgram(program: Program): ExecutionResult {
  const state: RuntimeState = {};
  const diagnostics: Diagnostic[] = [];
  for (const declaration of program.states) {
    try {
      state[declaration.name] = evaluateExpression(declaration.initialValue, state);
    } catch {
      diagnostics.push({
        severity: "error",
        message: `No se pudo inicializar @State ${declaration.name}.`,
        line: 1,
        column: 1
      });
    }
  }
  return { state, diagnostics };
}

export function executeStatements(statements: Statement[], currentState: RuntimeState): ExecutionResult {
  const scope: RuntimeState = { ...currentState };
  const stateNames = new Set(Object.keys(currentState));
  const diagnostics: Diagnostic[] = [];
  let steps = 0;

  const execute = (items: Statement[]) => {
    for (const statement of items) {
      steps += 1;
      if (steps > 500) {
        diagnostics.push({
          severity: "error",
          message: "La acción superó el límite seguro de 500 instrucciones.",
          line: 1,
          column: 1,
          hint: "Simplifica la acción del botón."
        });
        return;
      }
      if (statement.kind === "declare") {
        scope[statement.name] = evaluateExpression(statement.value, scope);
        continue;
      }
      if (statement.kind === "assign") {
        const next = evaluateExpression(statement.value, scope);
        const previous = scope[statement.name] ?? 0;
        if (statement.operator === "=") scope[statement.name] = next;
        if (statement.operator === "+=") scope[statement.name] = typeof previous === "string" || typeof next === "string" ? display(previous) + display(next) : numeric(previous) + numeric(next);
        if (statement.operator === "-=") scope[statement.name] = numeric(previous) - numeric(next);
        if (statement.operator === "*=") scope[statement.name] = numeric(previous) * numeric(next);
        if (statement.operator === "/=") scope[statement.name] = numeric(next) === 0 ? 0 : numeric(previous) / numeric(next);
        continue;
      }
      if (statement.kind === "if") {
        execute(truthy(evaluateExpression(statement.condition, scope)) ? statement.then : statement.otherwise);
      }
    }
  };

  try {
    execute(statements);
  } catch {
    diagnostics.push({
      severity: "error",
      message: "La acción no pudo completarse con los valores actuales.",
      line: 1,
      column: 1
    });
  }

  const state: RuntimeState = {};
  for (const name of stateNames) state[name] = scope[name] ?? null;
  return { state, diagnostics };
}

export const valueAsText = display;
export const valueAsBoolean = truthy;
