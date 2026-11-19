export interface SwiftUIComponentDefinition {
  id: string;
  name: string;
  category: "Diseño" | "Controles" | "Contenido" | "Modificadores";
  description: string;
  snippet: string;
}

export const swiftUIComponents: SwiftUIComponentDefinition[] = [
  { id: "vstack", name: "VStack", category: "Diseño", description: "Organiza vistas verticalmente.", snippet: "VStack {\n    Text(\"Elemento\")\n}" },
  { id: "hstack", name: "HStack", category: "Diseño", description: "Organiza vistas horizontalmente.", snippet: "HStack {\n    Text(\"Izquierda\")\n    Text(\"Derecha\")\n}" },
  { id: "zstack", name: "ZStack", category: "Diseño", description: "Superpone vistas en profundidad.", snippet: "ZStack {\n    Text(\"Fondo\")\n    Text(\"Frente\")\n}" },
  { id: "spacer", name: "Spacer", category: "Diseño", description: "Añade espacio flexible.", snippet: "Spacer()" },
  { id: "text", name: "Text", category: "Contenido", description: "Muestra texto de solo lectura.", snippet: "Text(\"Nuevo texto\")" },
  { id: "image", name: "Image", category: "Contenido", description: "Muestra un símbolo del sistema.", snippet: "Image(systemName: \"swift\")\n    .font(.largeTitle)\n    .foregroundColor(.orange)" },
  { id: "textfield", name: "TextField", category: "Controles", description: "Entrada de texto con binding.", snippet: "TextField(\"Escribe aquí\", text: $texto)\n    .padding()\n    .background(.gray)\n    .cornerRadius(10)" },
  { id: "securefield", name: "SecureField", category: "Controles", description: "Entrada protegida para contraseñas.", snippet: "SecureField(\"Contraseña\", text: $clave)\n    .padding()\n    .background(.gray)\n    .cornerRadius(10)" },
  { id: "button", name: "Button", category: "Controles", description: "Ejecuta una acción al pulsarlo.", snippet: "Button(\"Continuar\") {\n    mensaje = \"Botón pulsado\"\n}" },
  { id: "toggle", name: "Toggle", category: "Controles", description: "Activa o desactiva un Bool.", snippet: "Toggle(\"Activado\", isOn: $activo)" },
  { id: "padding", name: ".padding()", category: "Modificadores", description: "Añade espacio alrededor de una vista.", snippet: ".padding()" },
  { id: "font", name: ".font()", category: "Modificadores", description: "Cambia el estilo tipográfico.", snippet: ".font(.title)" },
  { id: "foreground", name: ".foregroundColor()", category: "Modificadores", description: "Cambia el color del contenido.", snippet: ".foregroundColor(.blue)" },
  { id: "background", name: ".background()", category: "Modificadores", description: "Añade un fondo a la vista.", snippet: ".background(.gray)" },
  { id: "corner", name: ".cornerRadius()", category: "Modificadores", description: "Redondea las esquinas.", snippet: ".cornerRadius(10)" },
  { id: "frame", name: ".frame()", category: "Modificadores", description: "Controla el tamaño de una vista.", snippet: ".frame(maxWidth: .infinity)" }
];
