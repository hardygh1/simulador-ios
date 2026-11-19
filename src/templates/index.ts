import type { Challenge, ExerciseTemplate, ProjectStarterId } from "../types";

const controller = (className: string, outlets: string, setup: string, actions: string) => `import UIKit

class ${className}: UIViewController {

${outlets}

    override func viewDidLoad() {
        super.viewDidLoad()
${setup}
    }

${actions}
}`;

export const templates: ExerciseTemplate[] = [
  {
    id: "hola-mundo", title: "Hola mundo", level: "Inicial", topic: "UILabel, IBOutlet e IBAction",
    description: "Conecta un UILabel y un UIButton desde Main.storyboard con el controlador.",
    expected: "Al presionar el botón, la etiqueta muestra un saludo.", source: "Tema 1 · UIKit y Storyboard", framework: "uikit", fileName: "HolaViewController.swift",
    code: controller("HolaViewController", `    @IBOutlet weak var lblSaludo: UILabel!`, `        lblSaludo.text = "Presiona el botón para comenzar"`, `    @IBAction func btnSaludar(_ sender: UIButton) {
        lblSaludo.text = "Hola, mundo desde UIKit"
        lblSaludo.textColor = .systemBlue
    }`)
  },
  {
    id: "contador", title: "Contador con botones", level: "Inicial", topic: "UILabel, UIButton y variables",
    description: "Actualiza un UILabel desde acciones conectadas a tres botones del Storyboard.",
    expected: "Los botones aumentan, disminuyen y reinician el contador.", source: "Práctica UIKit · Eventos", framework: "uikit", fileName: "ContadorViewController.swift",
    code: controller("ContadorViewController", `    @IBOutlet weak var lblContador: UILabel!
    private var contador = 0`, `        actualizarContador()`, `    @IBAction func btnRestar(_ sender: UIButton) {
        contador -= 1
        actualizarContador()
    }

    @IBAction func btnReiniciar(_ sender: UIButton) {
        contador = 0
        actualizarContador()
    }

    @IBAction func btnSumar(_ sender: UIButton) {
        contador += 1
        actualizarContador()
    }

    private func actualizarContador() {
        lblContador.text = String(contador)
    }`)
  },
  {
    id: "calculadora", title: "Calculadora de dos números", level: "Inicial", topic: "UITextField y conversiones",
    description: "Lee dos UITextField, convierte sus textos a Double y muestra la suma.",
    expected: "El UILabel presenta la suma o un mensaje de validación.", source: "Ejercicios Tema 1 · Operaciones", framework: "uikit", fileName: "CalculadoraViewController.swift",
    code: controller("CalculadoraViewController", `    @IBOutlet weak var txtNumeroA: UITextField!
    @IBOutlet weak var txtNumeroB: UITextField!
    @IBOutlet weak var lblResultado: UILabel!`, `        lblResultado.text = "Ingresa dos números"`, `    @IBAction func btnSumar(_ sender: UIButton) {
        if let textoA = txtNumeroA.text,
           let textoB = txtNumeroB.text,
           let numeroA = Double(textoA),
           let numeroB = Double(textoB) {
            let resultado = numeroA + numeroB
            lblResultado.text = "Resultado: \\(String(format: "%.2f", resultado))"
            lblResultado.textColor = .systemBlue
        } else {
            lblResultado.text = "Ingresa números válidos"
            lblResultado.textColor = .systemRed
        }
    }`)
  },
  {
    id: "promedio", title: "Calculadora de promedio", level: "Intermedio", topic: "IBOutlet, IBAction e if / else",
    description: "Laboratorio de la guía: recibe nombre y dos notas, calcula el promedio y determina si aprobó.",
    expected: "Muestra el promedio con dos decimales en azul o rojo.", source: "Guía Tema 2 · PromedioApp", framework: "uikit", fileName: "PromedioViewController.swift",
    code: controller("PromedioViewController", `    @IBOutlet weak var txtNombre: UITextField!
    @IBOutlet weak var txtNota1: UITextField!
    @IBOutlet weak var txtNota2: UITextField!
    @IBOutlet weak var lblResultado: UILabel!`, `        lblResultado.text = "Ingresa los datos y presiona el botón"`, `    @IBAction func btnCalcularPromedio(_ sender: UIButton) {
        let nombreIngresado = txtNombre.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let nombre = nombreIngresado.isEmpty ? "Estudiante" : nombreIngresado

        if let nota1Texto = txtNota1.text,
           let nota2Texto = txtNota2.text,
           let nota1 = Double(nota1Texto),
           let nota2 = Double(nota2Texto) {
            let promedio = (nota1 + nota2) / 2

            if promedio >= 13 {
                lblResultado.text = "\\(nombre), tu promedio es \\(String(format: "%.2f", promedio)) y aprobaste"
                lblResultado.textColor = .blue
            } else {
                lblResultado.text = "\\(nombre), tu promedio es \\(String(format: "%.2f", promedio)) y desaprobaste"
                lblResultado.textColor = .red
            }
        } else {
            lblResultado.text = "Ingrese notas válidas en formato numérico."
            lblResultado.textColor = .systemRed
        }
    }`)
  },
  {
    id: "temperatura", title: "Conversor de temperatura", level: "Inicial", topic: "UITextField y fórmula",
    description: "Convierte grados Celsius a Fahrenheit desde una acción de UIButton.",
    expected: "El resultado aparece en el UILabel después de presionar Convertir.", source: "Ejercicios Tema 1 · Fórmulas", framework: "uikit", fileName: "TemperaturaViewController.swift",
    code: controller("TemperaturaViewController", `    @IBOutlet weak var txtCelsius: UITextField!
    @IBOutlet weak var lblResultado: UILabel!`, `        lblResultado.text = "Ingresa una temperatura"`, `    @IBAction func btnConvertir(_ sender: UIButton) {
        if let texto = txtCelsius.text, let celsius = Double(texto) {
            let fahrenheit = celsius * 9 / 5 + 32
            lblResultado.text = "\\(String(format: "%.1f", fahrenheit)) °F"
        } else {
            lblResultado.text = "Temperatura no válida"
        }
    }`)
  },
  {
    id: "edad", title: "Validación de edad", level: "Inicial", topic: "UITextField y rangos",
    description: "Clasifica una edad usando condiciones dentro de un IBAction.",
    expected: "Muestra menor, adulto o adulto mayor.", source: "Ejercicios Tema 1 · P3", framework: "uikit", fileName: "EdadViewController.swift",
    code: controller("EdadViewController", `    @IBOutlet weak var txtEdad: UITextField!
    @IBOutlet weak var lblCategoria: UILabel!`, `        lblCategoria.text = "Ingresa una edad"`, `    @IBAction func btnClasificar(_ sender: UIButton) {
        guard let texto = txtEdad.text, let edad = Int(texto), edad >= 0 else {
            lblCategoria.text = "Edad no válida"
            return
        }

        if edad < 18 {
            lblCategoria.text = "Menor de edad"
        } else if edad < 60 {
            lblCategoria.text = "Adulto"
        } else {
            lblCategoria.text = "Adulto mayor"
        }
    }`)
  },
  {
    id: "registro", title: "Formulario de registro", level: "Intermedio", topic: "UITextField, UISwitch y validación",
    description: "Conecta campos, un UISwitch y un botón para validar un formulario.",
    expected: "El UILabel informa si el registro está completo.", source: "Práctica UIKit · Formularios", framework: "uikit", fileName: "RegistroViewController.swift",
    code: controller("RegistroViewController", `    @IBOutlet weak var txtNombre: UITextField!
    @IBOutlet weak var txtCorreo: UITextField!
    @IBOutlet weak var txtClave: UITextField!
    @IBOutlet weak var swTerminos: UISwitch!
    @IBOutlet weak var lblEstado: UILabel!`, `        txtClave.isSecureTextEntry = true
        lblEstado.text = "Completa el formulario"`, `    @IBAction func btnRegistrar(_ sender: UIButton) {
        let nombre = txtNombre.text ?? ""
        let correo = txtCorreo.text ?? ""
        let clave = txtClave.text ?? ""

        if nombre.isEmpty || correo.isEmpty || clave.isEmpty || !swTerminos.isOn {
            lblEstado.text = "Revisa los datos y acepta los términos"
            lblEstado.textColor = .systemRed
        } else {
            lblEstado.text = "Registro listo para \\(nombre)"
            lblEstado.textColor = .systemGreen
        }
    }`)
  },
  {
    id: "login", title: "Inicio de sesión simulado", level: "Intermedio", topic: "UITextField y operadores lógicos",
    description: "Valida credenciales locales desde dos UITextField.",
    expected: "Acepta alumno@cibertec.edu.pe con la clave swift6.", source: "Práctica UIKit · Validación", framework: "uikit", fileName: "LoginViewController.swift",
    code: controller("LoginViewController", `    @IBOutlet weak var txtCorreo: UITextField!
    @IBOutlet weak var txtClave: UITextField!
    @IBOutlet weak var lblMensaje: UILabel!`, `        txtClave.isSecureTextEntry = true
        lblMensaje.text = "Ingresa tus credenciales"`, `    @IBAction func btnIngresar(_ sender: UIButton) {
        let correo = txtCorreo.text ?? ""
        let clave = txtClave.text ?? ""

        if correo == "alumno@cibertec.edu.pe" && clave == "swift6" {
            lblMensaje.text = "Acceso correcto"
            lblMensaje.textColor = .systemGreen
        } else {
            lblMensaje.text = "Credenciales incorrectas"
            lblMensaje.textColor = .systemRed
        }
    }`)
  },
  {
    id: "condicionales", title: "Condicionales if / else", level: "Intermedio", topic: "UILabel y clasificación por rangos",
    description: "Clasifica el consumo mensual de agua ingresado en un UITextField.",
    expected: "Muestra consumo bajo, moderado, alto o muy alto.", source: "Ejercicios Tema 1 · Caso 4", framework: "uikit", fileName: "ConsumoViewController.swift",
    code: controller("ConsumoViewController", `    @IBOutlet weak var txtConsumo: UITextField!
    @IBOutlet weak var lblClasificacion: UILabel!`, `        lblClasificacion.text = "Sin evaluar"`, `    @IBAction func btnEvaluar(_ sender: UIButton) {
        guard let texto = txtConsumo.text, let consumo = Double(texto), consumo >= 0 else {
            lblClasificacion.text = "Error: consumo no válido"
            return
        }

        if consumo <= 15 {
            lblClasificacion.text = "Consumo bajo"
        } else if consumo <= 30 {
            lblClasificacion.text = "Consumo moderado"
        } else if consumo <= 50 {
            lblClasificacion.text = "Consumo alto"
        } else {
            lblClasificacion.text = "Consumo muy alto"
        }
    }`)
  },
  {
    id: "estado", title: "Laboratorio de UISwitch", level: "Inicial", topic: "UISwitch y evento valueChanged",
    description: "Conecta un UISwitch para cambiar el mensaje y el color de un UILabel.",
    expected: "El mensaje cambia al activar o desactivar el modo de estudio.", source: "UIKit · Controles y eventos", framework: "uikit", fileName: "EstadoViewController.swift",
    code: controller("EstadoViewController", `    @IBOutlet weak var swEstudiando: UISwitch!
    @IBOutlet weak var lblEstado: UILabel!`, `        actualizarEstado()`, `    @IBAction func swEstudiandoCambio(_ sender: UISwitch) {
        actualizarEstado()
    }

    private func actualizarEstado() {
        if swEstudiando.isOn {
            lblEstado.text = "Sesión en progreso"
            lblEstado.textColor = .systemGreen
        } else {
            lblEstado.text = "Tómate un momento y comienza"
            lblEstado.textColor = .systemGray
        }
    }`)
  }
];

export const challenges: Challenge[] = [
  { id: "minutos", title: "Minutos a horas", focus: "División y residuo", prompt: "Diseña la vista en Storyboard y convierte 130 minutos en 2 h y 10 min." },
  { id: "ponderado", title: "Promedio ponderado", focus: "IBOutlet, IBAction y fórmula", prompt: "Agrega tres UITextField y calcula N1 × 20%, N2 × 35% y N3 × 45%." },
  { id: "clientes", title: "Descuento por cliente", focus: "UISegmentedControl", prompt: "Aplica 5% a Bronce, 10% a Plata y 15% a Oro." },
  { id: "temperatura-rangos", title: "Clima por rangos", focus: "if / else anidado", prompt: "Clasifica una temperatura como frío, templado, cálido o calor extremo." },
  { id: "inventario", title: "Control de inventario", focus: "UITextField y comparaciones", prompt: "Distingue entre sin stock, stock bajo y stock suficiente." },
  { id: "becas", title: "Puntaje de beca", focus: "Rangos y UILabel", prompt: "Clasifica de 0 a 100 y calcula cuánto falta para llegar a 60." },
  { id: "estacionamiento", title: "Tarifa de estacionamiento", focus: "Tramos", prompt: "Calcula una tarifa por horas y agrega una multa después de 8 horas." },
  { id: "compras", title: "Evaluación de compra", focus: "UISegmentedControl y switch", prompt: "Combina tipo de cliente, monto y cantidad de productos." },
  { id: "recetas", title: "Detalle de receta", focus: "UIPickerView y segue", prompt: "Selecciona una receta y navega hacia DetalleViewController." },
  { id: "tareas", title: "Gestor de tareas", focus: "UITableView y navegación", prompt: "Diseña las pantallas de lista, detalle y creación de una tarea." }
];

export const templateById = (id: string) => templates.find((template) => template.id === id) ?? templates[0];

const blankController = controller("ViewController", "", "        view.backgroundColor = .systemBackground", "");

export const projectStarters: Array<{ id: ProjectStarterId; name: string; description: string; code: string }> = [
  { id: "blank", name: "App Storyboard vacía", description: "UIViewController listo para conectar con Main.storyboard.", code: blankController },
  { id: "counter", name: "Contador UIKit", description: "UILabel, tres UIButton e IBAction.", code: templateById("contador").code },
  { id: "average", name: "Promedio UIKit", description: "Proyecto basado en la Guía Tema 2.", code: templateById("promedio").code }
];

export const projectStarterById = (id: ProjectStarterId) => projectStarters.find((starter) => starter.id === id) ?? projectStarters[0];
