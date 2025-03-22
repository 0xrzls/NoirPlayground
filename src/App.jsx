import { useState } from "react";
import Editor from "@monaco-editor/react";

const templates = {
  "Basic Assert": "fn main() {\n  assert(1 + 1 == 2);\n}",
  "Poseidon Hash": "use dep::std::hash::poseidon;\n\nfn main() {\n  let x = poseidon([1, 2, 3]);\n}",
  "Failing Test": "fn main() {\n  assert(2 + 2 == 5);\n}"
};

function App() {
  const [code, setCode] = useState(templates["Basic Assert"]);
  const [output, setOutput] = useState("Tulis kode Noir lalu klik Compile!");

  async function handleCompile() {
    setOutput("⏳ Mengirim kode ke server...");

    try {
      const res = await fetch("http://207.148.3.95:4000/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (data.error) {
        setOutput("❌ ERROR:\n" + data.error);
      } else {
        setOutput("✅ BERHASIL:\n" + JSON.stringify(data.compiled, null, 2));
      }
    } catch (err) {
      setOutput("❌ NETWORK ERROR:\n" + err.message);
    }
  }

  return (
    <div style={{ backgroundColor: "#111", color: "#eee", minHeight: "100vh", padding: "20px" }}>
      <h2>Noir Playground (Connected to Real Compiler)</h2>

      <select onChange={(e) => setCode(templates[e.target.value])}>
        {Object.keys(templates).map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>

      <Editor
        height="50vh"
        defaultLanguage="rust"
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val || "")}
      />

      <button
        onClick={handleCompile}
        style={{ marginTop: "10px", padding: "10px 20px", fontWeight: "bold" }}
      >
        Compile
      </button>

      <pre
        style={{
          marginTop: "20px",
          background: "#222",
          padding: "15px",
          whiteSpace: "pre-wrap"
        }}
      >
        {output}
      </pre>
    </div>
  );
}

export default App;
