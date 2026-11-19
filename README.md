# SwiftLab Web

SwiftLab Web es un simulador educativo inspirado en Xcode para aprender desde Windows el patrón usado en los laboratorios del curso: **UIKit + Storyboard + Swift**. Las prácticas utilizan `UIViewController`, conexiones `IBOutlet`, eventos `IBAction` y una vista interactiva de iPhone.

No compila una aplicación iOS real ni sustituye Xcode. Su objetivo es enseñar la estructura de un proyecto, practicar el código de clase y comprobar visualmente el comportamiento de los ejercicios.

## Ejecutar el proyecto

Requiere Node.js 18 o posterior y npm 9 o posterior.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://127.0.0.1:5173`.

Para comprobar el proyecto:

```bash
npm test -- --run
npm run build
```

## Qué incluye

- Interfaz inspirada en Xcode: barra de herramientas, navegador, editor, vista de la app, Inspector, Biblioteca y consola.
- Editor Monaco con resaltado para Swift y UIKit.
- Diez prácticas escritas como controladores UIKit, siguiendo el estilo del código del curso.
- Proyectos nuevos con `Main.storyboard`, `ViewController.swift`, `AppDelegate.swift`, `SceneDelegate.swift`, Assets y Products.
- Vista de iPhone interactiva para escribir datos, pulsar botones, cambiar interruptores y ver resultados.
- Inspector visual para seleccionar componentes y modificar tamaño, fuente, color, fondo, espaciado y bordes.
- Biblioteca de controles y fragmentos UIKit: `UILabel`, `UITextField`, `UIButton`, `UISwitch`, `IBAction` y otros.
- Organización horizontal o vertical de código y vista, intercambio de posición y divisor redimensionable.
- Tema claro y oscuro.
- Guardado de ejercicios y proyectos en `localStorage`.
- Consola con diagnósticos básicos y explicaciones de errores.

## Código UIKit admitido

El validador reconoce el patrón principal trabajado en clase:

```swift
import UIKit

class PromedioViewController: UIViewController {
    @IBOutlet weak var txtNombre: UITextField!
    @IBOutlet weak var lblResultado: UILabel!

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    @IBAction func btnCalcularPromedio(_ sender: UIButton) {
        // Lógica del ejercicio
    }
}
```

La simulación cubre controles como `UILabel`, `UITextField`, `UIButton`, `UISwitch` y `UISegmentedControl`, además de conversiones numéricas, `if / else`, `guard`, interpolación, `String(format:)`, cambios de texto y colores comunes.

## Prácticas incluidas

1. Hola mundo con `UILabel` y `UIButton`
2. Contador con botones
3. Calculadora de dos números
4. Promedio de dos notas con validación
5. Conversor de temperatura
6. Validación de edad
7. Formulario de registro
8. Inicio de sesión simulado
9. Clasificación del consumo de agua
10. Laboratorio de `UISwitch`

La práctica de promedio mantiene los mismos nombres y estructura del ejemplo del curso: `PromedioViewController`, `txtNombre`, `txtNota1`, `txtNota2`, `lblResultado` y `btnCalcularPromedio`.

## Crear un proyecto

1. Pulsa **Nuevo** en el navegador izquierdo.
2. Escribe el nombre del producto.
3. Elige una plantilla Storyboard: vacía, contador o promedio.
4. Pulsa **Crear proyecto**.
5. Expande el proyecto para ver `ViewController.swift`, `Main.storyboard`, AppDelegate, SceneDelegate, Assets y Products.
6. Edita el controlador y pulsa **Ejecutar** para validar y actualizar la vista.

El código y la vista Storyboard ocupan el área central. Se pueden colocar lado a lado, uno sobre otro, intercambiar de posición y redimensionar. El Inspector y la Biblioteca permanecen a la derecha, como herramientas del área de diseño.

Haz clic en un componente de la vista para seleccionarlo. Después usa el Inspector para modificar sus propiedades visuales. La Biblioteca inserta conexiones, acciones y controles UIKit en la posición actual del editor.

## Arquitectura

```text
src/
  components/
    editor/       Editor y biblioteca UIKit
    projects/     Creación y árbol del proyecto
    simulator/    Vista de iPhone UIKit
    utility/      Inspector y biblioteca
  engine/
    uikit/        Detección y validación UIKit
    parser/       Compatibilidad con proyectos SwiftUI anteriores
    interpreter/  Evaluación educativa de expresiones
  store/          Estado y persistencia local
  templates/      Prácticas y proyectos iniciales
```

## Limitaciones

- Es un simulador web educativo, no el compilador de Swift ni el SDK de iOS.
- `Main.storyboard` es una representación virtual; todavía no edita XML de Storyboard ni implementa el motor completo de Auto Layout.
- La vista interpreta los patrones previstos para estas prácticas, no cualquier código UIKit existente.
- No genera un archivo `.ipa`, no abre el simulador oficial y no puede publicar una app en App Store.
- La persistencia es local al navegador y no se sincroniza entre equipos.
- El parser SwiftUI anterior se conserva únicamente para abrir proyectos guardados de versiones previas.

## Material del curso

Las prácticas se adaptaron al formato real observado en el material compartido: proyectos con Storyboard y controladores UIKit, operaciones, condicionales, validación, promedio, formularios y manejo de controles. El código de práctica ya no se transforma a SwiftUI.
