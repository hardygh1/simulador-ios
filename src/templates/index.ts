import type { Challenge, ExerciseTemplate, ProjectStarterId } from "../types";

const wrap = (states: string, body: string) => `import SwiftUI

struct ContentView: View {
${states}

    var body: some View {
${body}
    }
}`;

export const templates: ExerciseTemplate[] = [
  {
    id: "hola-mundo",
    title: "Hola mundo",
    level: "Inicial",
    topic: "Text y VStack",
    description: "Construye tu primera vista y cambia el texto, el color o el tamaño.",
    expected: "El iPhone muestra un saludo y una breve descripción.",
    source: "Tema 1 · Introducción a Xcode",
    code: wrap(
      "",
      `        VStack {
            Image(systemName: "swift")
                .font(.largeTitle)
                .foregroundColor(.orange)
            Text("Hola, SwiftLab")
                .font(.title)
            Text("Mi primera vista SwiftUI")
                .foregroundColor(.gray)
        }
        .padding()`
    )
  },
  {
    id: "contador",
    title: "Contador con botones",
    level: "Inicial",
    topic: "@State y Button",
    description: "Observa cómo un estado cambia la interfaz sin volver a crear la vista.",
    expected: "Los botones aumentan, disminuyen y reinician el contador.",
    source: "Práctica de estado reactivo",
    code: wrap(
      `    @State var contador: Int = 0`,
      `        VStack {
            Text("Contador")
                .font(.title)
            Text("\\(contador)")
                .font(.largeTitle)
                .foregroundColor(.orange)
            HStack {
                Button("− 1") {
                    contador -= 1
                }
                Button("Reiniciar") {
                    contador = 0
                }
                Button("+ 1") {
                    contador += 1
                }
            }
        }
        .padding()`
    )
  },
  {
    id: "calculadora",
    title: "Calculadora de dos números",
    level: "Inicial",
    topic: "Conversiones y operaciones",
    description: "Convierte texto a Double y calcula una suma.",
    expected: "Al pulsar Sumar aparece el resultado de los dos campos.",
    source: "Ejercicios Tema 1 · Operaciones aritméticas",
    code: wrap(
      `    @State var numeroA: String = ""
    @State var numeroB: String = ""
    @State var resultado: Double = 0`,
      `        VStack {
            Text("Calculadora")
                .font(.title)
            TextField("Primer número", text: $numeroA)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            TextField("Segundo número", text: $numeroB)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Sumar") {
                let a = Double(numeroA) ?? 0
                let b = Double(numeroB) ?? 0
                resultado = a + b
            }
            Text("Resultado: \\(resultado)")
                .font(.title2)
        }
        .padding()`
    )
  },
  {
    id: "promedio",
    title: "Promedio de tres notas",
    level: "Intermedio",
    topic: "Validación e if / else",
    description: "Laboratorio principal: valida tres notas de 0 a 20, calcula el promedio y determina el estado académico.",
    expected: "Muestra el promedio con dos decimales y Aprobado o Desaprobado.",
    source: "Guía Tema 2 y Ejercicios Tema 1",
    code: wrap(
      `    @State var nota1: String = ""
    @State var nota2: String = ""
    @State var nota3: String = ""
    @State var promedio: Double = 0
    @State var mensaje: String = "Ingresa tus tres notas"`,
      `        VStack {
            Text("Calculadora de Promedio")
                .font(.title)
            TextField("Nota 1", text: $nota1)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            TextField("Nota 2", text: $nota2)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            TextField("Nota 3", text: $nota3)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Calcular promedio") {
                let n1 = Double(nota1) ?? -1
                let n2 = Double(nota2) ?? -1
                let n3 = Double(nota3) ?? -1
                if n1 < 0 || n1 > 20 || n2 < 0 || n2 > 20 || n3 < 0 || n3 > 20 {
                    mensaje = "Ingresa notas válidas entre 0 y 20"
                } else {
                    promedio = (n1 + n2 + n3) / 3
                    if promedio >= 13 {
                        mensaje = "Aprobado"
                    } else {
                        mensaje = "Desaprobado"
                    }
                }
            }
            Text("Promedio: \\(String(format: \"%.2f\", promedio))")
                .font(.title2)
            Text(mensaje)
                .foregroundColor(.blue)
        }
        .padding()`
    )
  },
  {
    id: "temperatura",
    title: "Conversor de temperatura",
    level: "Inicial",
    topic: "Fórmulas",
    description: "Convierte grados Celsius a Fahrenheit usando una expresión aritmética.",
    expected: "El resultado cambia después de pulsar Convertir.",
    source: "Ejercicios Tema 1 · Temperatura",
    code: wrap(
      `    @State var celsius: String = ""
    @State var fahrenheit: Double = 0`,
      `        VStack {
            Text("Temperatura")
                .font(.title)
            TextField("Grados Celsius", text: $celsius)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Convertir") {
                let valor = Double(celsius) ?? 0
                fahrenheit = valor * 9 / 5 + 32
            }
            Text("\\(String(format: \"%.1f\", fahrenheit)) °F")
                .font(.largeTitle)
        }
        .padding()`
    )
  },
  {
    id: "edad",
    title: "Validación de edad",
    level: "Inicial",
    topic: "Rangos con condicionales",
    description: "Clasifica una edad como menor, adulto o adulto mayor.",
    expected: "La clasificación respeta los rangos 0–17, 18–59 y 60 a más.",
    source: "Ejercicios Tema 1 · P3",
    code: wrap(
      `    @State var edadTexto: String = ""
    @State var categoria: String = "Ingresa una edad"`,
      `        VStack {
            Text("Clasificador de edad")
                .font(.title)
            TextField("Edad", text: $edadTexto)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Clasificar") {
                let edad = Int(edadTexto) ?? -1
                if edad < 0 {
                    categoria = "Edad no válida"
                } else {
                    if edad < 18 {
                        categoria = "Menor de edad"
                    } else {
                        if edad < 60 {
                            categoria = "Adulto"
                        } else {
                            categoria = "Adulto mayor"
                        }
                    }
                }
            }
            Text(categoria)
                .font(.title2)
        }
        .padding()`
    )
  },
  {
    id: "registro",
    title: "Formulario de registro",
    level: "Inicial",
    topic: "TextField, SecureField y Toggle",
    description: "Practica bindings con varios controles de entrada.",
    expected: "Valida nombre, correo, contraseña y aceptación de términos.",
    source: "Práctica de vistas y formularios",
    code: wrap(
      `    @State var nombre: String = ""
    @State var correo: String = ""
    @State var clave: String = ""
    @State var acepta: Bool = false
    @State var estado: String = "Completa el formulario"`,
      `        VStack {
            Text("Crear cuenta")
                .font(.title)
            TextField("Nombre", text: $nombre)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            TextField("Correo", text: $correo)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            SecureField("Contraseña", text: $clave)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Toggle("Acepto los términos", isOn: $acepta)
            Button("Registrarme") {
                if nombre == "" || correo == "" || clave == "" || acepta == false {
                    estado = "Revisa los datos y los términos"
                } else {
                    estado = "Registro listo para \\(nombre)"
                }
            }
            Text(estado)
        }
        .padding()`
    )
  },
  {
    id: "login",
    title: "Inicio de sesión simulado",
    level: "Intermedio",
    topic: "Comparaciones lógicas",
    description: "Compara credenciales locales sin conectarse a un servidor.",
    expected: "Acepta alumno@cibertec.edu.pe con la clave swift6.",
    source: "Práctica de validación",
    code: wrap(
      `    @State var usuario: String = ""
    @State var clave: String = ""
    @State var mensaje: String = "Ingresa tus credenciales"`,
      `        VStack {
            Image(systemName: "lock.fill")
                .font(.largeTitle)
                .foregroundColor(.blue)
            Text("Acceso al laboratorio")
                .font(.title)
            TextField("Correo", text: $usuario)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            SecureField("Contraseña", text: $clave)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Ingresar") {
                if usuario == "alumno@cibertec.edu.pe" && clave == "swift6" {
                    mensaje = "Acceso correcto"
                } else {
                    mensaje = "Credenciales incorrectas"
                }
            }
            Text(mensaje)
        }
        .padding()`
    )
  },
  {
    id: "condicionales",
    title: "Condicionales if / else",
    level: "Intermedio",
    topic: "Clasificación por rangos",
    description: "Clasifica el consumo mensual de agua y detecta valores negativos.",
    expected: "Muestra consumo bajo, moderado, alto o muy alto.",
    source: "Ejercicios Tema 1 · Caso 4",
    code: wrap(
      `    @State var consumoTexto: String = ""
    @State var clasificacion: String = "Sin evaluar"`,
      `        VStack {
            Text("Consumo de agua")
                .font(.title)
            TextField("Metros cúbicos", text: $consumoTexto)
                .padding()
                .background(.gray)
                .cornerRadius(10)
            Button("Evaluar") {
                let consumo = Double(consumoTexto) ?? -1
                if consumo < 0 {
                    clasificacion = "Error: consumo no válido"
                } else {
                    if consumo <= 15 {
                        clasificacion = "Consumo bajo"
                    } else {
                        if consumo <= 30 {
                            clasificacion = "Consumo moderado"
                        } else {
                            if consumo <= 50 {
                                clasificacion = "Consumo alto"
                            } else {
                                clasificacion = "Consumo muy alto"
                            }
                        }
                    }
                }
            }
            Text(clasificacion)
                .font(.title2)
        }
        .padding()`
    )
  },
  {
    id: "estado",
    title: "Laboratorio de @State",
    level: "Inicial",
    topic: "Estado y renderizado",
    description: "Activa el modo de estudio y observa cómo Text y Toggle comparten el mismo estado.",
    expected: "El mensaje cambia inmediatamente al alternar el control.",
    source: "SwiftUI · Estado reactivo",
    code: wrap(
      `    @State var estudiando: Bool = false`,
      `        VStack {
            Text("Mi sesión")
                .font(.title)
            Toggle("Modo estudio", isOn: $estudiando)
            if estudiando == true {
                Text("Sesión en progreso")
                    .foregroundColor(.green)
            } else {
                Text("Tómate un momento y comienza")
                    .foregroundColor(.gray)
            }
        }
        .padding()`
    )
  }
];

export const challenges: Challenge[] = [
  { id: "minutos", title: "Minutos a horas", focus: "División y residuo", prompt: "Convierte 130 minutos en 2 h y 10 min usando / y %." },
  { id: "ponderado", title: "Promedio ponderado", focus: "Fórmulas y validación", prompt: "Calcula N1 × 20%, N2 × 35% y N3 × 45%. Agrega Excelente desde 18." },
  { id: "clientes", title: "Descuento por cliente", focus: "Condicionales", prompt: "Aplica 5% a Bronce, 10% a Plata y 15% a Oro." },
  { id: "temperatura-rangos", title: "Clima por rangos", focus: "if / else anidado", prompt: "Clasifica una temperatura como frío, templado, cálido o calor extremo." },
  { id: "inventario", title: "Control de inventario", focus: "Comparaciones", prompt: "Distingue entre sin stock, stock bajo y stock suficiente." },
  { id: "becas", title: "Puntaje de beca", focus: "Rangos y cálculo", prompt: "Clasifica de 0 a 100 y calcula cuánto falta para llegar a 60." },
  { id: "estacionamiento", title: "Tarifa de estacionamiento", focus: "Tramos", prompt: "Calcula una tarifa por horas y agrega una multa después de 8 horas." },
  { id: "compras", title: "Evaluación de compra", focus: "Lógica compuesta", prompt: "Combina tipo de cliente, monto y cantidad de productos." },
  { id: "recetas", title: "Detalle de receta", focus: "Vistas y estado", prompt: "Crea una selección de receta y muestra su nombre, descripción y símbolo." },
  { id: "tareas", title: "Gestor de tareas", focus: "Diseño de vistas", prompt: "Diseña las pantallas de lista, detalle y creación de una tarea." }
];

export const templateById = (id: string) => templates.find((template) => template.id === id) ?? templates[0];

export const projectStarters: Array<{ id: ProjectStarterId; name: string; description: string; code: string }> = [
  {
    id: "blank",
    name: "App vacía",
    description: "Una vista inicial limpia con ContentView.swift.",
    code: wrap(
      "",
      `        VStack {
            Image(systemName: "swift")
                .font(.largeTitle)
                .foregroundColor(.orange)
            Text("Mi nueva app")
                .font(.title)
            Text("Edita ContentView.swift para comenzar")
                .foregroundColor(.gray)
        }
        .padding()`
    )
  },
  {
    id: "counter",
    name: "Contador",
    description: "Proyecto inicial con @State y acciones Button.",
    code: templateById("contador").code
  },
  {
    id: "average",
    name: "Promedio",
    description: "Proyecto inicial con campos, validación y resultado.",
    code: templateById("promedio").code
  }
];

export const projectStarterById = (id: ProjectStarterId) => projectStarters.find((starter) => starter.id === id) ?? projectStarters[0];
