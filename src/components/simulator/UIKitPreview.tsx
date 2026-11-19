import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { useLabStore } from "../../store/useLabStore";
import type { ComponentVisualStyle } from "../../types";

const toStyle = (style?: ComponentVisualStyle): CSSProperties => ({
  width: style?.width || undefined,
  height: style?.height || undefined,
  color: style?.foregroundColor,
  background: style?.backgroundColor,
  padding: style?.padding,
  borderRadius: style?.cornerRadius,
  fontSize: style?.fontSize
});

export function UIKitPreview() {
  const selectedTemplateId = useLabStore((state) => state.selectedTemplateId);
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const projects = useLabStore((state) => state.customProjects);
  const selection = useLabStore((state) => state.canvasSelection);
  const selectComponent = useLabStore((state) => state.selectCanvasComponent);
  const visualStyles = useLabStore((state) => state.componentVisualStyles);
  const project = projects.find((item) => item.id === activeCustomProjectId);
  const previewId = project?.starterId === "counter" ? "contador" : project?.starterId === "average" ? "promedio" : activeCustomProjectId ? "hola-mundo" : selectedTemplateId;
  const scope = activeCustomProjectId ?? `template-${selectedTemplateId}`;
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [resultColor, setResultColor] = useState<string | undefined>();
  const [counter, setCounter] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setFields({}); setResult(""); setResultColor(undefined); setCounter(0); setEnabled(false);
  }, [previewId]);

  const componentProps = (key: string, name: string, kind: string) => {
    const id = `${scope}:uikit-${key}`;
    return {
      className: `canvas-component${selection?.id === id ? " canvas-component-selected" : ""}`,
      style: toStyle(visualStyles[id]),
      onClick: (event: MouseEvent) => { event.stopPropagation(); selectComponent({ id, name, kind }); },
      "data-component": name
    };
  };

  const input = (key: string, placeholder: string, secure = false) => (
    <input {...componentProps(key, "UITextField", "textField")} className={`uikit-text-field ${componentProps(key, "UITextField", "textField").className}`} type={secure ? "password" : "text"} placeholder={placeholder} value={fields[key] ?? ""} onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))} />
  );
  const label = (key: string, text: string, className = "") => <div {...componentProps(key, "UILabel", "label")} className={`uikit-label ${className} ${componentProps(key, "UILabel", "label").className}`} style={{ ...toStyle(visualStyles[`${scope}:uikit-${key}`]), color: key === "result" ? resultColor ?? toStyle(visualStyles[`${scope}:uikit-${key}`]).color : toStyle(visualStyles[`${scope}:uikit-${key}`]).color }}>{text}</div>;
  const button = (key: string, text: string, action: () => void) => <button {...componentProps(key, "UIButton", "button")} className={`uikit-button ${componentProps(key, "UIButton", "button").className}`} type="button" onClick={(event) => { componentProps(key, "UIButton", "button").onClick(event); action(); }}>{text}</button>;

  const classifyWater = () => {
    const value = Number(fields.consumo);
    if (!fields.consumo || value < 0) setResult("Error: consumo no válido");
    else if (value <= 15) setResult("Consumo bajo");
    else if (value <= 30) setResult("Consumo moderado");
    else if (value <= 50) setResult("Consumo alto");
    else setResult("Consumo muy alto");
  };

  let content;
  if (previewId === "contador") content = <>{label("title", "Contador", "uikit-title")}{label("counter", String(counter), "uikit-counter")}<div className="uikit-button-row">{button("minus", "− 1", () => setCounter((v) => v - 1))}{button("reset", "Reiniciar", () => setCounter(0))}{button("plus", "+ 1", () => setCounter((v) => v + 1))}</div></>;
  else if (previewId === "calculadora") content = <>{label("title", "Calculadora", "uikit-title")}{input("a", "Primer número")}{input("b", "Segundo número")}{button("sum", "Sumar", () => { const a=Number(fields.a), b=Number(fields.b); setResult(fields.a && fields.b ? `Resultado: ${(a+b).toFixed(2)}` : "Ingresa números válidos"); })}{label("result", result || "Ingresa dos números")}</>;
  else if (previewId === "promedio") content = <>{label("title", "Calculadora de Promedio", "uikit-title")}{input("nombre", "Ingresa tu nombre")}{input("nota1", "Ingrese nota 1")}{input("nota2", "Ingrese nota 2")}{button("average", "Calcular promedio", () => { const n1=Number(fields.nota1), n2=Number(fields.nota2); if (!fields.nota1 || !fields.nota2) { setResult("Ingrese notas válidas en formato numérico."); setResultColor("#ff3b30"); } else { const avg=(n1+n2)/2; const pass=avg>=13; setResult(`${fields.nombre?.trim() || "Estudiante"}, tu promedio es ${avg.toFixed(2)} y ${pass ? "aprobaste" : "desaprobaste"}`); setResultColor(pass ? "#007aff" : "#ff3b30"); } })}{label("result", result || "Ingresa los datos y presiona el botón")}</>;
  else if (previewId === "temperatura") content = <>{label("title", "Conversor de temperatura", "uikit-title")}{input("celsius", "Grados Celsius")}{button("convert", "Convertir", () => setResult(fields.celsius ? `${(Number(fields.celsius)*9/5+32).toFixed(1)} °F` : "Temperatura no válida"))}{label("result", result || "Ingresa una temperatura")}</>;
  else if (previewId === "edad") content = <>{label("title", "Clasificador de edad", "uikit-title")}{input("edad", "Edad")}{button("classify", "Clasificar", () => { const age=Number(fields.edad); setResult(!fields.edad || age<0 ? "Edad no válida" : age<18 ? "Menor de edad" : age<60 ? "Adulto" : "Adulto mayor"); })}{label("result", result || "Ingresa una edad")}</>;
  else if (previewId === "registro") content = <>{label("title", "Crear cuenta", "uikit-title")}{input("nombre", "Nombre")}{input("correo", "Correo")}{input("clave", "Contraseña", true)}<label {...componentProps("terms", "UISwitch", "switch")} className={`uikit-switch ${componentProps("terms", "UISwitch", "switch").className}`}><span>Acepto los términos</span><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /></label>{button("register", "Registrarme", () => setResult(fields.nombre && fields.correo && fields.clave && enabled ? `Registro listo para ${fields.nombre}` : "Revisa los datos y acepta los términos"))}{label("result", result || "Completa el formulario")}</>;
  else if (previewId === "login") content = <>{label("title", "Inicio de sesión", "uikit-title")}{input("correo", "Correo")}{input("clave", "Contraseña", true)}{button("login", "Ingresar", () => setResult(fields.correo === "alumno@cibertec.edu.pe" && fields.clave === "swift6" ? "Acceso correcto" : "Credenciales incorrectas"))}{label("result", result || "Ingresa tus credenciales")}</>;
  else if (previewId === "condicionales") content = <>{label("title", "Consumo de agua", "uikit-title")}{input("consumo", "Metros cúbicos")}{button("evaluate", "Evaluar", classifyWater)}{label("result", result || "Sin evaluar")}</>;
  else if (previewId === "estado") content = <>{label("title", "Mi sesión", "uikit-title")}<label {...componentProps("study", "UISwitch", "switch")} className={`uikit-switch ${componentProps("study", "UISwitch", "switch").className}`}><span>Modo estudio</span><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /></label>{label("result", enabled ? "Sesión en progreso" : "Tómate un momento y comienza")}</>;
  else content = <>{label("title", "Hola, mundo", "uikit-title")}{button("hello", "Mostrar saludo", () => setResult("Hola, mundo desde UIKit"))}{label("result", result || "Presiona el botón para comenzar")}</>;

  return <div className="uikit-screen" onClick={(event) => { if (event.target === event.currentTarget) selectComponent(null); }}><div className="uikit-form">{content}</div></div>;
}
