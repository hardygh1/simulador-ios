import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  CheckCircle2,
  Code2,
  Flame,
  Leaf,
  LockKeyhole,
  ShoppingBag,
  Utensils,
  Wifi
} from "lucide-react";
import type { CanvasSelection, ComponentVisualStyle, Modifier, Statement, SwiftValue, UINode } from "../../types";
import { evaluateExpression, valueAsBoolean, valueAsText, type RuntimeState } from "../interpreter";

interface SwiftUIRendererProps {
  root: UINode;
  state: RuntimeState;
  onBindingChange: (name: string, value: SwiftValue) => void;
  onAction: (statements: Statement[]) => void;
  scope: string;
  selectedId: string | null;
  visualStyles: Record<string, ComponentVisualStyle>;
  onSelect: (selection: CanvasSelection) => void;
}

const colorMap: Record<string, string> = {
  ".orange": "#ff7a18",
  ".blue": "#0a84ff",
  ".red": "#ff453a",
  ".green": "#30d158",
  ".gray": "#8e8e93",
  ".black": "#111114",
  ".white": "#ffffff",
  ".purple": "#bf5af2"
};

function modifierStyle(modifiers: Modifier[], state: RuntimeState): CSSProperties {
  const style: CSSProperties = {};
  for (const modifier of modifiers) {
    const values = modifier.args.map((argument) => evaluateExpression(argument, state));
    if (modifier.name === "padding") style.padding = values[0] == null ? 12 : Number(values[0]);
    if (modifier.name === "cornerRadius") style.borderRadius = Number(values[0] ?? 10);
    if (modifier.name === "foregroundColor") style.color = colorMap[String(values[0])] ?? String(values[0] ?? "inherit");
    if (modifier.name === "background") {
      const raw = String(values[0] ?? ".gray");
      style.background = raw === ".gray" ? "rgba(142, 142, 147, 0.14)" : colorMap[raw] ?? raw;
    }
    if (modifier.name === "font") {
      const font = String(values[0] ?? ".body");
      if (font === ".largeTitle") Object.assign(style, { fontSize: 34, fontWeight: 760, letterSpacing: "-0.035em" });
      if (font === ".title") Object.assign(style, { fontSize: 26, fontWeight: 720, letterSpacing: "-0.025em" });
      if (font === ".title2") Object.assign(style, { fontSize: 21, fontWeight: 650 });
      if (font === ".headline") Object.assign(style, { fontSize: 17, fontWeight: 650 });
      if (font === ".caption") Object.assign(style, { fontSize: 13 });
    }
    if (modifier.name === "frame") {
      const numericValues = values.filter((value) => typeof value === "number") as number[];
      if (numericValues[0]) style.width = numericValues[0];
      if (numericValues[1]) style.height = numericValues[1];
      if (values.some((value) => value === ".infinity")) style.width = "100%";
    }
  }
  return style;
}

function visualStyle(style?: ComponentVisualStyle): CSSProperties {
  if (!style) return {};
  return {
    width: style.width ? style.width : undefined,
    height: style.height ? style.height : undefined,
    color: style.foregroundColor,
    background: style.backgroundColor,
    padding: style.padding,
    borderRadius: style.cornerRadius,
    fontSize: style.fontSize
  };
}

const nodeName = (node: UINode) => {
  if (node.kind === "stack") return node.axis === "vertical" ? "VStack" : node.axis === "horizontal" ? "HStack" : "ZStack";
  if (node.kind === "text") return "Text";
  if (node.kind === "textField") return node.secure ? "SecureField" : "TextField";
  if (node.kind === "button") return "Button";
  if (node.kind === "toggle") return "Toggle";
  if (node.kind === "image") return "Image";
  if (node.kind === "spacer") return "Spacer";
  return "Conditional";
};

const systemIcon = (name: string, style: CSSProperties): ReactNode => {
  const props = { size: Number(style.fontSize ?? 34), strokeWidth: 1.8 };
  if (name.includes("lock")) return <LockKeyhole {...props} />;
  if (name.includes("fork") || name.includes("knife")) return <Utensils {...props} />;
  if (name.includes("leaf")) return <Leaf {...props} />;
  if (name.includes("flame")) return <Flame {...props} />;
  if (name.includes("bag")) return <ShoppingBag {...props} />;
  if (name.includes("check")) return <CheckCircle2 {...props} />;
  if (name.includes("wifi")) return <Wifi {...props} />;
  return <Code2 {...props} />;
};

export function SwiftUIRenderer({ root, state, onBindingChange, onAction, scope, selectedId, visualStyles, onSelect }: SwiftUIRendererProps) {
  const renderNode = (node: UINode, key: string): ReactNode => {
    const id = `${scope}:${key}`;
    const style = { ...modifierStyle(node.modifiers, state), ...visualStyle(visualStyles[id]) };
    const selected = selectedId === id;
    const select = (event: ReactMouseEvent) => {
      event.stopPropagation();
      onSelect({ id, kind: node.kind, name: nodeName(node) });
    };
    const selectableClass = selected ? " canvas-component-selected" : "";
    if (node.kind === "stack") {
      const classes = node.axis === "vertical" ? "swift-vstack" : node.axis === "horizontal" ? "swift-hstack" : "swift-zstack";
      return (
        <div className={`${classes} canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component={nodeName(node)}>
          {node.children.map((child, index) => renderNode(child, `${key}-${index}`))}
        </div>
      );
    }
    if (node.kind === "text") {
      return <div className={`swift-text canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component="Text">{valueAsText(evaluateExpression(node.value, state))}</div>;
    }
    if (node.kind === "textField") {
      const label = valueAsText(evaluateExpression(node.label, state));
      return (
        <input
          key={key}
          className={`swift-field canvas-component${selectableClass}`}
          style={style}
          type={node.secure ? "password" : "text"}
          placeholder={label}
          aria-label={label}
          value={valueAsText(state[node.binding] ?? "")}
          onChange={(event) => onBindingChange(node.binding, event.target.value)}
          onClick={select}
          data-component={nodeName(node)}
        />
      );
    }
    if (node.kind === "button") {
      return (
        <button key={key} type="button" className={`swift-button canvas-component${selectableClass}`} style={style} onClick={(event) => { select(event); onAction(node.action); }} data-component="Button">
          {valueAsText(evaluateExpression(node.label, state))}
        </button>
      );
    }
    if (node.kind === "toggle") {
      const label = valueAsText(evaluateExpression(node.label, state));
      const checked = valueAsBoolean(state[node.binding] ?? false);
      return (
        <label className={`swift-toggle canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component="Toggle">
          <span>{label}</span>
          <input type="checkbox" checked={checked} onChange={(event) => onBindingChange(node.binding, event.target.checked)} />
          <span className="swift-toggle-track" aria-hidden="true" />
        </label>
      );
    }
    if (node.kind === "image") {
      return <div className={`swift-image canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component="Image">{systemIcon(valueAsText(evaluateExpression(node.systemName, state)), style)}</div>;
    }
    if (node.kind === "spacer") return <div className={`swift-spacer canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component="Spacer" />;
    if (node.kind === "conditional") {
      const branch = valueAsBoolean(evaluateExpression(node.condition, state)) ? node.then : node.otherwise;
      return <div className={`swift-conditional canvas-component${selectableClass}`} style={style} key={key} onClick={select} data-component="Conditional">{branch.map((child, index) => renderNode(child, `${key}-${index}`))}</div>;
    }
    return null;
  };

  return <>{renderNode(root, "root")}</>;
}
