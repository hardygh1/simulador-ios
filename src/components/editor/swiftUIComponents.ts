export interface SwiftUIComponentDefinition {
  id: string;
  name: string;
  category: "Diseño" | "Controles" | "Contenido" | "Modificadores";
  description: string;
  snippet: string;
}

export const swiftUIComponents: SwiftUIComponentDefinition[] = [
  { id: "controller", name: "UIViewController", category: "Diseño", description: "Controlador de una pantalla Storyboard.", snippet: "class ViewController: UIViewController {\n\n    override func viewDidLoad() {\n        super.viewDidLoad()\n    }\n}" },
  { id: "viewdidload", name: "viewDidLoad", category: "Diseño", description: "Configura la pantalla al cargar.", snippet: "override func viewDidLoad() {\n    super.viewDidLoad()\n}" },
  { id: "outlet-label", name: "UILabel IBOutlet", category: "Contenido", description: "Conexión con una etiqueta del Storyboard.", snippet: "@IBOutlet weak var lblResultado: UILabel!" },
  { id: "outlet-image", name: "UIImageView IBOutlet", category: "Contenido", description: "Conexión con una imagen.", snippet: "@IBOutlet weak var imgContenido: UIImageView!" },
  { id: "outlet-field", name: "UITextField IBOutlet", category: "Controles", description: "Conexión con un campo de texto.", snippet: "@IBOutlet weak var txtDato: UITextField!" },
  { id: "outlet-button", name: "UIButton IBOutlet", category: "Controles", description: "Conexión de referencia con un botón.", snippet: "@IBOutlet weak var btnContinuar: UIButton!" },
  { id: "outlet-switch", name: "UISwitch IBOutlet", category: "Controles", description: "Conexión con un interruptor.", snippet: "@IBOutlet weak var swActivo: UISwitch!" },
  { id: "outlet-segment", name: "UISegmentedControl", category: "Controles", description: "Selector de opciones por segmentos.", snippet: "@IBOutlet weak var scOpciones: UISegmentedControl!" },
  { id: "outlet-table", name: "UITableView IBOutlet", category: "Controles", description: "Conexión con una tabla.", snippet: "@IBOutlet weak var tblElementos: UITableView!" },
  { id: "action-button", name: "IBAction UIButton", category: "Controles", description: "Acción Touch Up Inside de un botón.", snippet: "@IBAction func btnContinuar(_ sender: UIButton) {\n    // Escribe aquí la lógica\n}" },
  { id: "action-switch", name: "IBAction UISwitch", category: "Controles", description: "Acción Value Changed de un switch.", snippet: "@IBAction func swActivoCambio(_ sender: UISwitch) {\n    // Lee sender.isOn\n}" },
  { id: "label-text", name: "UILabel.text", category: "Modificadores", description: "Cambia el texto de una etiqueta.", snippet: "lblResultado.text = \"Resultado\"" },
  { id: "label-color", name: "UILabel.textColor", category: "Modificadores", description: "Cambia el color de una etiqueta.", snippet: "lblResultado.textColor = .systemBlue" },
  { id: "secure", name: "Texto seguro", category: "Modificadores", description: "Oculta una contraseña en UITextField.", snippet: "txtClave.isSecureTextEntry = true" },
  { id: "segue", name: "performSegue", category: "Diseño", description: "Navega usando un segue con identificador.", snippet: "performSegue(withIdentifier: \"mostrarDetalle\", sender: self)" }
];
