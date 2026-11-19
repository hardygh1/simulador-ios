export type TokenKind = "identifier" | "number" | "string" | "symbol" | "operator" | "newline" | "eof";

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  column: number;
}

const twoCharacterOperators = new Set(["==", "!=", ">=", "<=", "&&", "||", "??", "+=", "-=", "*=", "/="]);
const operatorCharacters = new Set(["+", "-", "*", "/", "%", "=", "!", "<", ">", "?", "&", "|"]);
const symbolCharacters = new Set(["{", "}", "(", ")", "[", "]", ",", ".", ":", "@", "$", ";"]);

export class SwiftLexer {
  private index = 0;
  private line = 1;
  private column = 1;
  private readonly tokens: Token[] = [];

  constructor(private readonly source: string) {}

  tokenize(): Token[] {
    while (!this.atEnd()) {
      const char = this.peek();

      if (char === "\r") {
        this.advance();
        continue;
      }
      if (char === "\n") {
        this.tokens.push(this.makeToken("newline", "\n"));
        this.advanceLine();
        continue;
      }
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }
      if (char === "/" && this.peek(1) === "/") {
        this.skipLineComment();
        continue;
      }
      if (char === "/" && this.peek(1) === "*") {
        this.skipBlockComment();
        continue;
      }
      if (char === '"') {
        this.readString();
        continue;
      }
      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }
      if (/[A-Za-z_]/.test(char)) {
        this.readIdentifier();
        continue;
      }

      const pair = char + this.peek(1);
      if (twoCharacterOperators.has(pair)) {
        const token = this.makeToken("operator", pair);
        this.advance();
        this.advance();
        this.tokens.push(token);
        continue;
      }
      if (operatorCharacters.has(char)) {
        this.tokens.push(this.makeToken("operator", char));
        this.advance();
        continue;
      }
      if (symbolCharacters.has(char)) {
        this.tokens.push(this.makeToken("symbol", char));
        this.advance();
        continue;
      }

      this.tokens.push(this.makeToken("symbol", char));
      this.advance();
    }

    this.tokens.push({ kind: "eof", value: "", line: this.line, column: this.column });
    return this.tokens;
  }

  private readString() {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance();
    let value = "";
    let interpolationDepth = 0;

    while (!this.atEnd()) {
      const char = this.peek();
      if (char === '"' && interpolationDepth === 0) {
        this.advance();
        this.tokens.push({ kind: "string", value, line: startLine, column: startColumn });
        return;
      }
      if (char === "\\") {
        const next = this.peek(1);
        if (next === "(") {
          value += "\\(";
          interpolationDepth += 1;
          this.advance();
          this.advance();
          continue;
        }
        const escapes: Record<string, string> = { n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\" };
        value += escapes[next] ?? next;
        this.advance();
        this.advance();
        continue;
      }
      if (char === "(" && interpolationDepth > 0) interpolationDepth += 1;
      if (char === ")" && interpolationDepth > 0) interpolationDepth -= 1;
      value += char;
      if (char === "\n") this.advanceLine();
      else this.advance();
    }

    this.tokens.push({ kind: "string", value, line: startLine, column: startColumn });
  }

  private readNumber() {
    const start = this.index;
    const token = this.makeToken("number", "");
    while (/[0-9]/.test(this.peek())) this.advance();
    if (this.peek() === "." && /[0-9]/.test(this.peek(1))) {
      this.advance();
      while (/[0-9]/.test(this.peek())) this.advance();
    }
    token.value = this.source.slice(start, this.index);
    this.tokens.push(token);
  }

  private readIdentifier() {
    const start = this.index;
    const token = this.makeToken("identifier", "");
    while (/[A-Za-z0-9_]/.test(this.peek())) this.advance();
    token.value = this.source.slice(start, this.index);
    this.tokens.push(token);
  }

  private skipLineComment() {
    while (!this.atEnd() && this.peek() !== "\n") this.advance();
  }

  private skipBlockComment() {
    this.advance();
    this.advance();
    while (!this.atEnd() && !(this.peek() === "*" && this.peek(1) === "/")) {
      if (this.peek() === "\n") this.advanceLine();
      else this.advance();
    }
    if (!this.atEnd()) {
      this.advance();
      this.advance();
    }
  }

  private makeToken(kind: TokenKind, value: string): Token {
    return { kind, value, line: this.line, column: this.column };
  }

  private peek(offset = 0): string {
    return this.source[this.index + offset] ?? "\0";
  }

  private advance() {
    this.index += 1;
    this.column += 1;
  }

  private advanceLine() {
    this.index += 1;
    this.line += 1;
    this.column = 1;
  }

  private atEnd() {
    return this.index >= this.source.length;
  }
}

export const lexSwift = (source: string) => new SwiftLexer(source).tokenize();
