# SwiftLab Web

SwiftLab Web es un simulador educativo para practicar un subconjunto de Swift y SwiftUI desde Windows 11. Incluye un editor Monaco, un parser propio, un intérprete controlado, estado reactivo y una vista de iPhone construida en React.

No compila Swift real, no ejecuta iOS y no reemplaza Xcode. El objetivo es practicar fundamentos y observar cómo el código admitido cambia una interfaz.

## Requisitos

- Windows 11, macOS o Linux
- Node.js 18 o posterior
- npm 9 o posterior

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://127.0.0.1:5173`.

Para verificar el proyecto:

```bash
npm test
npm run build
```

## Qué incluye

- Editor Swift basado en Monaco con resaltado, líneas y edición en vivo.
- Simulador visual de iPhone con apariencia clara y oscura.
- Lexer y parser que producen un AST. No se usa `eval()` ni se genera JavaScript desde el código Swift.
- Intérprete de expresiones, condicionales y acciones de botones.
- Bindings como `$nombre` para actualizar `@State` desde `TextField`, `SecureField` y `Toggle`.
- Consola con errores, ubicación y explicaciones.
- Guardado local por ejercicio mediante LocalStorage.
- Creación de proyectos SwiftUI locales con nombre y plantilla inicial.
- Disposición inspirada en Xcode: toolbar, navegador, editor, Canvas, utilidades y área de depuración.
- Código y Canvas acoplables: lado a lado, uno sobre otro, intercambiables y con divisor redimensionable.
- Biblioteca SwiftUI para insertar vistas y modificadores en la posición del cursor.
- Inspector visual: selecciona una vista del Canvas y cambia tamaño, fuente, colores, padding y radio.
- Árbol de proyecto con `App.swift`, `ContentView.swift`, Assets, Preview Content y Products.
- Diez plantillas editables y un banco de retos basado en el material del curso.

## Sintaxis admitida

### Estado y valores

- `@State var nombre: String = ""`
- `String`, `Int`, `Double` y `Bool`
- Variables locales `let` y `var` dentro de `Button`
- Asignaciones `=`, `+=`, `-=`, `*=` y `/=`

### Expresiones

- `+`, `-`, `*`, `/` y `%`
- `==`, `!=`, `<`, `<=`, `>` y `>=`
- `&&`, `||`, `!` y `??`
- `Double(texto)`, `Int(texto)` y `String(format: "%.2f", valor)`
- Interpolación como `"Promedio: \(promedio)"`

### Control y vistas

- `if / else`
- `VStack`, `HStack` y `ZStack`
- `Text`, `TextField`, `SecureField`, `Button`, `Toggle`, `Image(systemName:)` y `Spacer`
- `.padding()`, `.font()`, `.foregroundColor()`, `.background()`, `.cornerRadius()` y `.frame()`

## Limitaciones conocidas

- No admite todo Swift ni todo SwiftUI.
- No admite bucles, `switch`, `List`, `ForEach`, navegación, colecciones ni funciones definidas por el estudiante en esta fase.
- No ejecuta UIKit, Storyboard, `IBOutlet` o `IBAction`. Los laboratorios UIKit se usan como referencia temática y se adaptan a SwiftUI.
- Los SF Symbols se representan con un mapa pequeño de iconos equivalentes.
- La persistencia es local al navegador y no se sincroniza entre equipos.

Cuando se encuentra una construcción fuera del subconjunto, la consola explica la limitación en lugar de intentar ejecutar código arbitrario.

## Plantillas incluidas

1. Hola mundo
2. Contador con botones
3. Calculadora de dos números
4. Promedio de tres notas con validación
5. Conversor de temperatura
6. Validación de edad
7. Formulario de registro
8. Inicio de sesión simulado
9. Condicionales por rangos
10. Laboratorio de `@State`

El banco adicional contiene retos de minutos a horas, promedio ponderado, descuentos, consumo, inventario, becas, estacionamiento, compras, recetas y tareas.

## Crear un proyecto

1. Pulsa **Nuevo** en el navegador izquierdo.
2. Escribe el nombre del producto.
3. Elige App vacía, Contador o Promedio.
4. Pulsa **Crear proyecto**.
5. Expande el proyecto para ver `App.swift`, `ContentView.swift`, `Assets.xcassets`, `Preview Content` y `Products`.
6. Edita `ContentView.swift` y usa **Ejecutar** para actualizar el Canvas.

Código y Canvas ocupan el área central. Los botones sobre ambas ventanas permiten colocarlas lado a lado, una sobre otra o intercambiar su posición; el divisor se arrastra para cambiar el tamaño. El Inspector y la Biblioteca permanecen en la columna derecha.

Haz clic sobre un componente del Canvas para seleccionarlo. El Inspector permite ajustar ancho, alto, tamaño de fuente, color, fondo, padding y radio de esquina. Al pulsar un componente de la Biblioteca, SwiftLab inserta su código en la posición actual del cursor.

## Arquitectura

```text
src/
  components/
    console/
    editor/
    projects/
    simulator/
  engine/
    lexer/
    parser/
    interpreter/
    renderer/
  store/
  templates/
  types/
```

Flujo de ejecución:

1. Monaco entrega el código fuente.
2. El lexer produce tokens con línea y columna.
3. El parser construye el AST y registra diagnósticos.
4. El intérprete inicializa los estados y evalúa acciones.
5. El renderizador transforma los nodos SwiftUI admitidos en componentes React.
6. Cada interacción actualiza el estado y vuelve a renderizar la pantalla.

## Material del curso incorporado

La experiencia prioriza los temas de los archivos compartidos: plataforma iOS y Xcode, operaciones básicas, condicionales, validación por rangos, promedio simple y ponderado, formularios, vistas y estado. Los proyectos de PromedioApp, ComprasApp, RecetasApp y TareasApp inspiran ejercicios progresivos, aunque el simulador ejecuta la versión SwiftUI educativa y no el código UIKit original.
