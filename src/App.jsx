import { useState } from "react";
import Editor from "@monaco-editor/react";
import { SiDocsify } from "react-icons/si";
import { BiLink } from "react-icons/bi";
import { LuFileCode } from "react-icons/lu";
import "./App.css";

const templates = {
  "Basic Assert": {
    code: `fn main() {\n    assert(1 + 1 == 2);\n}`,
    desc: "Test sederhana menggunakan assert."
  },
  "Poseidon Hash": {
    code: `use dep::std::hash::poseidon;\n\nfn main() {\n    let x = poseidon([1, 2, 3]);\n}`,
    desc: "Contoh hash dengan Poseidon."
  },
  "Token Transfer": {
    code: `struct Account {\n    pub balance: u32\n}\n\nfn main() {\n    let sender = Account { balance: 100 };\n    let receiver = Account { balance: 0 };\n    let amount = 30;\n\n    assert(sender.balance >= amount);\n    let new_sender_balance = sender.balance - amount;\n    let new_receiver_balance = receiver.balance + amount;\n\n    assert(new_sender_balance == 70);\n    assert(new_receiver_balance == 30);\n}`,
    desc: "Logika ZK token transfer antar akun."
  },
  "Failing Test": {
    code: `fn main() {\n    assert(2 + 2 == 5);\n}`,
    desc: "Contoh test yang akan gagal."
  }
};

function App() {
  const [selected, setSelected] = useState("Basic Assert");
  const [code, setCode] = useState(templates[selected].code);
  const [output, setOutput] = useState("Tulis kode Noir lalu klik tombol di bawah.");
  const [loading, setLoading] = useState(false);

  const handleSelect = (key) => {
    setSelected(key);
    setCode(templates[key].code);
    setOutput("Tulis kode Noir lalu klik tombol di bawah.");
  };

  const handleCompile = async () => {
    setLoading(true);
    setOutput("⏳ Mengompilasi kode...");

    try {
      const res = await fetch("http://45.76.101.191:4000/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setLoading(false);
    }
  };

  const handleProve = async () => {
    setLoading(true);
    setOutput("⏳ Membuktikan kode...");

    try {
      const res = await fetch("http://45.76.101.191:4000/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (data.error) {
        setOutput("❌ ERROR:\n" + data.error);
      } else {
        const { noir_version, hash } = data.compiled || {};
        const proof = data.proof || "-";

        const result = `
✅ BERHASIL:

Noir Version: ${noir_version || "unknown"}
Hash: ${hash || "unknown"}
Proof: ${proof}
        `.trim();

        setOutput(result);
      }
    } catch (err) {
      setOutput("❌ NETWORK ERROR:\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <img src="/NPG.svg" alt="Logo" className="logo" />
          <a
            href="https://docs.noir-lang.org"
            target="_blank"
            rel="noreferrer"
            title="Buka Dokumentasi"
          >
            <SiDocsify className="docs-icon" />
          </a>
        </div>
      </nav>

      <div className="container">
        <div className="menu-dropdown">
          <select
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
            className="dropdown"
          >
            {Object.keys(templates).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="editor-output-wrap">
          <div className="editor-card">
            <Editor
              height="60vh"
              defaultLanguage="rust"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
            />
          </div>
          <pre className="output desktop-only">{output}</pre>
        </div>

        {/* Run bar */}
        <div className="run-bar">
          <div className="run-icons">
            <BiLink title="Copy link" />
            <LuFileCode title="Embed" />
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Program arguments"
              className="run-input"
              disabled
            />
            <span className="help-icon">?</span>
          </div>
          <button className="run-button" onClick={handleCompile} disabled={loading}>
            {loading ? "Compiling..." : "Compile"}
          </button>
          <button className="run-button" onClick={handleProve} disabled={loading}>
            {loading ? "Proving..." : "Prove"}
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
