import { useEffect, useRef } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { RotateCcw } from "lucide-react";
import { useLabStore } from "../../store/useLabStore";

export function CodeEditor() {
  const code = useLabStore((state) => state.code);
  const setCode = useLabStore((state) => state.setCode);
  const theme = useLabStore((state) => state.theme);
  const selectedTemplateId = useLabStore((state) => state.selectedTemplateId);
  const activeCustomProjectId = useLabStore((state) => state.activeCustomProjectId);
  const restoreTemplate = useLabStore((state) => state.restoreTemplate);
  const insertionRequest = useLabStore((state) => state.insertionRequest);
  const clearInsertionRequest = useLabStore((state) => state.clearInsertionRequest);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !insertionRequest) return;
    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) return;
    const currentLine = model.getLineContent(selection.startLineNumber);
    const indentation = currentLine.match(/^\s*/)?.[0] ?? "";
    const snippet = insertionRequest.snippet
      .split("\n")
      .map((line, index) => index === 0 ? line : `${indentation}${line}`)
      .join("\n");
    editor.executeEdits("swiftui-library", [{ range: selection, text: snippet, forceMoveMarkers: true }]);
    editor.focus();
    clearInsertionRequest();
  }, [insertionRequest, clearInsertionRequest]);

  const configureMonaco: BeforeMount = (monaco) => {
    if (!monaco.languages.getLanguages().some((language) => language.id === "swift")) {
      monaco.languages.register({ id: "swift" });
      monaco.languages.setMonarchTokensProvider("swift", {
        keywords: ["import", "struct", "var", "let", "some", "if", "else", "true", "false", "private", "return"],
        typeKeywords: ["View", "String", "Int", "Double", "Bool", "VStack", "HStack", "ZStack", "Text", "TextField", "Button", "Toggle", "Image"],
        tokenizer: {
          root: [
            [/@[A-Za-z_][\w]*/, "annotation"],
            [/[A-Z][\w]*/, "type.identifier"],
            [/[a-z_$][\w$]*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
            [/\/\/.*$/, "comment"],
            [/"([^"\\]|\\.)*"/, "string"],
            [/\d+(\.\d+)?/, "number"],
            [/[{}()[\]]/, "delimiter.bracket"],
            [/[+\-*\/%=<>!&|?]+/, "operator"]
          ]
        }
      });
    }
    monaco.editor.defineTheme("swiftlab-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "annotation", foreground: "F973A9" },
        { token: "keyword", foreground: "C792EA" },
        { token: "type.identifier", foreground: "82D2CE" },
        { token: "string", foreground: "FFCA85" },
        { token: "number", foreground: "C3E88D" },
        { token: "comment", foreground: "6E7681", fontStyle: "italic" }
      ],
      colors: {
        "editor.background": "#17191D",
        "editorLineNumber.foreground": "#555A63",
        "editorLineNumber.activeForeground": "#C9CDD5",
        "editor.selectionBackground": "#264F78AA",
        "editor.lineHighlightBackground": "#1E2126"
      }
    });
    monaco.editor.defineTheme("swiftlab-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "annotation", foreground: "B42362" },
        { token: "keyword", foreground: "7E3FA0" },
        { token: "type.identifier", foreground: "087F8C" },
        { token: "string", foreground: "A04B00" },
        { token: "number", foreground: "397300" }
      ],
      colors: { "editor.background": "#FBFBFC", "editor.lineHighlightBackground": "#F2F3F5" }
    });
  };

  return (
    <section className="editor-pane" aria-label="Editor Swift">
      <div className="pane-titlebar">
        <div className="file-tab">
          <span className="swift-file-icon">S</span>
          <span>ContentView.swift</span>
          <span className="unsaved-dot" aria-label="Los cambios se guardan localmente" />
        </div>
        {!activeCustomProjectId && (
          <button className="icon-text-button" type="button" onClick={restoreTemplate} title="Restaurar código de la plantilla">
            <RotateCcw size={14} /> Restaurar
          </button>
        )}
      </div>
      <div className="editor-surface">
        <Editor
          beforeMount={configureMonaco}
          path={`${activeCustomProjectId ?? selectedTemplateId}.swift`}
          language="swift"
          theme={theme === "dark" ? "swiftlab-dark" : "swiftlab-light"}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          onMount={(editor) => { editorRef.current = editor; }}
          options={{
            fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 14, bottom: 20 },
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            tabSize: 4,
            insertSpaces: true
          }}
        />
      </div>
    </section>
  );
}
