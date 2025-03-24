import { useState } from "react";
import Editor from "@monaco-editor/react";
import { SiDocsify } from "react-icons/si";
import { BiLink } from "react-icons/bi";
import { LuFileCode } from "react-icons/lu";
import "./App.css";

function App() {
  const [isManual, setIsManual] = useState(true);
  const [code, setCode] = useState("fn main() {\n    assert(1 + 1 == 2);\n}");
  const [output, setOutput] = useState("Tulis kode Noir lalu klik Run!");
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState("");

  const handleCompile = async () => {
    const selectedCode = isManual ? code : fileContent;

    if (!selectedCode.trim()) {
      alert("Tidak ada kode untuk dikompilasi.");
      return;
    }

    setLoading(true);
    setOutput("⏳ Mengirim kode ke server...");

    try {
      const res = await fetch("http://45.76.101.191:4000/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedCode })
      });

      const data = await res.json();
      if (data.error) {
        setOutput("❌ ERROR:\n" + data.error);
      } else {
        setOutput("✅ BERHASIL:\n" + JSON.stringify(data.compiled, null, 2));
      }
    } catch (err) {
      setOutput("❌ NETWORK ERROR:\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".nr")) {
      alert("Hanya file .nr yang diperbolehkan.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
      setCode(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <img src="/NPG.svg" alt="Logo" className="logo" />
          <a href="https://docs.noir-lang.org" target="_blank" rel="noreferrer">
            <SiDocsify className="docs-icon" />
          </a>
        </div>
      </nav>

      <div className="container">
        <div className="mode-toggle">
          <button
            className={`toggle-button ${isManual ? "active" : ""}`}
            onClick={() => setIsManual(true)}
          >
            MANUAL
          </button>
          <button
            className={`toggle-button ${!isManual ? "active" : ""}`}
            onClick={() => setIsManual(false)}
          >
            UPLOAD
          </button>
        </div>

        <div className="editor-output-wrap">
          <div className="editor-card">
            {isManual ? (
              <Editor
                height="60vh"
                defaultLanguage="rust"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
              />
            ) : (
              <>
                <input type="file" className="file-upload" onChange={handleFileChange} />
                <pre className="upload-preview">{fileContent || "// Upload file .nr untuk melihat isi di sini."}</pre>
              </>
            )}
          </div>
          <pre className="output desktop-only">{output}</pre>
        </div>

        <div className="run-bar">
          <div className="run-icons">
            <BiLink title="Copy link" />
            <LuFileCode title="Embed" />
          </div>
          <div className="input-wrapper">
            <input type="text" placeholder="Program arguments" className="run-input" disabled />
            <span className="help-icon">?</span>
          </div>
          <button
            className="run-button"
            onClick={handleCompile}
            disabled={loading || (!isManual && !fileContent)}
          >
            {loading ? "Running..." : "Run"}
          </button>
        </div>

        <div className="mobile-output">
          <pre className="output">{output}</pre>
        </div>
      </div>
    </>
  );
}

export default App;
