import { useState, useRef, useCallback } from "react";

const LOGO_SVG = `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" width="120" height="60">
  <text x="2" y="52" font-size="62" font-weight="900" font-family="Arial Black,sans-serif" fill="#4CAF50">P</text>
  <text x="42" y="52" font-size="62" font-weight="900" font-family="Arial Black,sans-serif" fill="#F9A825">A</text>
</svg>`;

const GREEN = "#2E7D32";
const AMBER = "#F9A825";
const DARK = "#1A1A1A";
const LIGHT_GREEN = "#E8F5E9";

const users = JSON.parse(localStorage.getItem("pa_users") || "{}");

function saveUsers() {
  localStorage.setItem("pa_users", JSON.stringify(users));
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("contracheques");
  const [loggedUser, setLoggedUser] = useState("");

  const [payslipFile, setPayslipFile] = useState(null);
  const [payslipStatus, setPayslipStatus] = useState("");
  const [payslipProgress, setPayslipProgress] = useState(0);
  const [payslipResults, setPayslipResults] = useState([]);
  const [payslipProcessing, setPayslipProcessing] = useState(false);

  const [compFile, setCompFile] = useState(null);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [compStatus, setCompStatus] = useState("");
  const [compProgress, setCompProgress] = useState(0);
  const [compResults, setCompResults] = useState([]);
  const [compProcessing, setCompProcessing] = useState(false);

  const payslipInputRef = useRef();
  const compPdfRef = useRef();
  const compXlsxRef = useRef();

  function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    if (!username.trim() || !password.trim()) {
      setAuthError("Preencha todos os campos.");
      return;
    }
    if (authMode === "register") {
      if (password !== confirmPw) {
        setAuthError("As senhas não coincidem.");
        return;
      }
      if (users[username]) {
        setAuthError("Usuário já existe.");
        return;
      }
      users[username] = btoa(password);
      saveUsers();
      setAuthError("");
      setAuthMode("login");
      setPassword("");
      setConfirmPw("");
      setPayslipStatus("Usuário criado com sucesso! Faça login.");
      return;
    }
    if (!users[username] || users[username] !== btoa(password)) {
      setAuthError("Usuário ou senha incorretos.");
      return;
    }
    setLoggedUser(username);
    setScreen("app");
  }

  async function processPayslips() {
    if (!payslipFile) return;
    setPayslipProcessing(true);
    setPayslipResults([]);
    setPayslipStatus("Processando contracheques com IA...");
    setPayslipProgress(10);

    const arrayBuffer = await payslipFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    setPayslipProgress(30);

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: `Você é um assistente especializado em processar contracheques. 
Analise o PDF fornecido e extraia informações de CADA contracheque encontrado.
Retorne APENAS um JSON válido (sem markdown, sem explicações) no formato:
{
  "contracheques": [
    {
      "nome": "NOME COMPLETO DO COLABORADOR",
      "matricula": "NÚMERO DA MATRÍCULA",
      "competencia": "MES/ANO ex: Outubro/2025",
      "salario_bruto": "VALOR BRUTO",
      "salario_liquido": "VALOR LÍQUIDO",
      "pagina": 1
    }
  ]
}
Cada objeto representa um contracheque por página do PDF.`,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 }
              },
              {
                type: "text",
                text: "Extraia os dados de todos os contracheques deste PDF. Cada página contém um contracheque. Retorne SOMENTE o JSON."
              }
            ]
          }]
        })
      });

      const data = await resp.json();
      setPayslipProgress(70);

      const text = data.content?.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setPayslipProgress(90);

      const results = (parsed.contracheques || []).map((cc, i) => ({
        ...cc,
        id: i,
        filename: `CONTRACHEQUE_${(cc.nome || "COLABORADOR").replace(/\s+/g, "_")}_${(cc.competencia || "").replace("/", "_")}.pdf`
      }));

      setPayslipResults(results);
      setPayslipProgress(100);
      setPayslipStatus(`✓ ${results.length} contracheque(s) identificado(s) com sucesso!`);
    } catch (err) {
      setPayslipStatus("Erro ao processar. Verifique o arquivo e tente novamente.");
      console.error(err);
    }
    setPayslipProcessing(false);
  }

  async function processComprovantes() {
    if (!compFile || !xlsxFile) {
      setCompStatus("Anexe o PDF de comprovantes e a planilha de colaboradores.");
      return;
    }
    setCompProcessing(true);
    setCompResults([]);
    setCompStatus("Lendo planilha de colaboradores...");
    setCompProgress(10);

    const xlsxBuf = await xlsxFile.arrayBuffer();
    const xlsxBase64 = btoa(String.fromCharCode(...new Uint8Array(xlsxBuf)));

    const pdfBuf = await compFile.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuf)));

    setCompProgress(30);
    setCompStatus("Analisando comprovantes com IA...");

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: `Você é um assistente especializado em processar comprovantes de pagamento.
Receberá uma planilha com NOME, CPF, DEPARTAMENTO e um PDF com comprovantes.
Identifique cada comprovante pelo CPF e associe ao colaborador na planilha.
Retorne APENAS um JSON válido (sem markdown) no formato:
{
  "comprovantes": [
    {
      "cpf": "CPF encontrado no comprovante",
      "nome": "Nome do colaborador da planilha",
      "departamento": "Departamento da planilha",
      "valor": "Valor do comprovante",
      "data": "Data do pagamento",
      "pagina": 1
    }
  ],
  "nao_identificados": [
    {"pagina": 2, "motivo": "CPF não encontrado na planilha"}
  ]
}`,
          messages: [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: xlsxBase64 }
              },
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdfBase64 }
              },
              {
                type: "text",
                text: "O primeiro documento é a planilha de colaboradores (NOME, CPF, DEPARTAMENTO). O segundo documento é o PDF com comprovantes de pagamento. Identifique cada comprovante pelo CPF e associe ao colaborador. Retorne SOMENTE o JSON."
              }
            ]
          }]
        })
      });

      const data = await resp.json();
      setCompProgress(80);

      const text = data.content?.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const results = (parsed.comprovantes || []).map((c, i) => ({
        ...c,
        id: i,
        filename: `COMPROVANTE_${(c.nome || "COLABORADOR").replace(/\s+/g, "_")}_${(c.data || "").replace(/\//g, "_")}.pdf`
      }));

      setCompResults(results);
      setCompProgress(100);
      setCompStatus(`✓ ${results.length} comprovante(s) identificado(s)! ${(parsed.nao_identificados || []).length} não identificado(s).`);
    } catch (err) {
      setCompStatus("Erro ao processar. Verifique os arquivos e tente novamente.");
      console.error(err);
    }
    setCompProcessing(false);
  }

  function downloadTemplate() {
    const csv = "NOME,CPF,DEPARTAMENTO\nFELIPE CANDIDO SAFI,123.456.789-00,GERENCIAMENTO DE ETES\nMARIA SILVA SANTOS,987.654.321-00,ADMINISTRATIVO\n";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PLANILHA_MODELO.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${LIGHT_GREEN} 0%, #fff8e1 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 48px rgba(46,125,50,0.15)", width: "100%", maxWidth: 420, padding: "2.5rem 2rem", border: `2px solid ${GREEN}22` }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 52, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: GREEN, lineHeight: 1 }}>P</span>
              <span style={{ fontSize: 52, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: AMBER, lineHeight: 1 }}>A</span>
            </div>
            <div style={{ fontSize: 13, color: "#666", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Parente Andrade</div>
            <div style={{ fontSize: 15, color: DARK, fontWeight: 600 }}>Sistema de Separação de Documentos</div>
          </div>

          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1.5px solid ${GREEN}33`, marginBottom: "1.5rem" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }} style={{ flex: 1, padding: "0.6rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s", background: authMode === m ? GREEN : "transparent", color: authMode === m ? "#fff" : GREEN }}>
                {m === "login" ? "Entrar" : "Criar Conta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Usuário</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Digite seu usuário" style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: 8, border: `1.5px solid #ddd`, fontSize: 14, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: 8, border: `1.5px solid #ddd`, fontSize: 14, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
            </div>
            {authMode === "register" && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Confirmar Senha</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repita a senha" style={{ width: "100%", padding: "0.7rem 1rem", borderRadius: 8, border: `1.5px solid #ddd`, fontSize: 14, marginTop: 4, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            {authError && <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 8, padding: "0.6rem 1rem", fontSize: 13, fontWeight: 500 }}>{authError}</div>}
            <button type="submit" style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 10, padding: "0.85rem", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4, letterSpacing: 0.5 }}>
              {authMode === "login" ? "Entrar no Sistema" : "Criar Conta"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <header style={{ background: DARK, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: GREEN }}>P</span>
          <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: AMBER }}>A</span>
          <div style={{ borderLeft: "1.5px solid #444", paddingLeft: 12, marginLeft: 4 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Parente Andrade</div>
            <div style={{ color: "#aaa", fontSize: 11 }}>Separação de Documentos</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#ccc", fontSize: 13 }}>Olá, <strong style={{ color: AMBER }}>{loggedUser}</strong></span>
          <button onClick={() => setScreen("login")} style={{ background: "transparent", border: `1.5px solid #555`, color: "#ccc", borderRadius: 8, padding: "0.4rem 1rem", cursor: "pointer", fontSize: 13 }}>Sair</button>
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1rem" }}>
        <div style={{ display: "flex", gap: 0, borderRadius: 14, overflow: "hidden", border: `2px solid ${GREEN}33`, marginBottom: "2rem", background: "#fff" }}>
          {[
            { key: "contracheques", label: "Separar Contracheques", icon: "📄" },
            { key: "comprovantes", label: "Separar Comprovantes", icon: "💳" }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: "1rem", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.2s", background: activeTab === tab.key ? GREEN : "transparent", color: activeTab === tab.key ? "#fff" : GREEN, gap: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "contracheques" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 24px rgba(46,125,50,0.08)", border: `1.5px solid ${GREEN}22` }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ margin: "0 0 0.5rem", color: DARK, fontSize: 20, fontWeight: 700 }}>Separar Contracheques</h2>
              <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Anexe o PDF com múltiplos contracheques (um por página). O sistema irá identificar e separar automaticamente.</p>
            </div>

            <div onClick={() => payslipInputRef.current?.click()} style={{ border: `2px dashed ${GREEN}55`, borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: payslipFile ? LIGHT_GREEN : "#fafafa", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
              <div style={{ fontWeight: 600, color: GREEN, fontSize: 15 }}>{payslipFile ? payslipFile.name : "Clique para anexar PDF de Contracheques"}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Somente arquivos .pdf</div>
              <input ref={payslipInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { setPayslipFile(e.target.files[0]); setPayslipResults([]); setPayslipStatus(""); }} />
            </div>

            <button onClick={processPayslips} disabled={!payslipFile || payslipProcessing} style={{ width: "100%", background: payslipFile && !payslipProcessing ? GREEN : "#ccc", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem", fontWeight: 700, fontSize: 15, cursor: payslipFile && !payslipProcessing ? "pointer" : "not-allowed", marginBottom: "1rem" }}>
              {payslipProcessing ? "⏳ Processando..." : "Separar Contracheques com IA"}
            </button>

            {payslipProcessing && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ background: "#eee", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ background: GREEN, height: "100%", width: `${payslipProgress}%`, transition: "width 0.4s", borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" }}>{payslipProgress}%</div>
              </div>
            )}

            {payslipStatus && (
              <div style={{ background: payslipStatus.startsWith("✓") ? LIGHT_GREEN : "#fff8e1", border: `1.5px solid ${payslipStatus.startsWith("✓") ? GREEN : AMBER}44`, borderRadius: 10, padding: "0.8rem 1rem", fontSize: 14, color: payslipStatus.startsWith("✓") ? GREEN : "#795548", marginBottom: "1rem", fontWeight: 500 }}>
                {payslipStatus}
              </div>
            )}

            {payslipResults.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, color: DARK, marginBottom: "0.75rem", fontSize: 15 }}>Contracheques Identificados:</div>
                {payslipResults.map(cc => (
                  <div key={cc.id} style={{ background: LIGHT_GREEN, border: `1px solid ${GREEN}33`, borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>{cc.nome}</div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Matrícula: {cc.matricula} • {cc.competencia} • Líquido: R$ {cc.salario_liquido}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>Arquivo: {cc.filename}</div>
                    </div>
                    <div style={{ background: GREEN, color: "#fff", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: 12, fontWeight: 700 }}>Pág. {cc.pagina}</div>
                  </div>
                ))}
                <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 13, color: "#2e7d32", fontWeight: 600, marginTop: "0.5rem", textAlign: "center" }}>
                  ℹ️ Para baixar os PDFs separados individualmente, utilize o Adobe Acrobat ou ferramentas como ilovepdf.com, usando os nomes identificados acima.
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "comprovantes" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 24px rgba(249,168,37,0.08)", border: `1.5px solid ${AMBER}44` }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ margin: "0 0 0.5rem", color: DARK, fontSize: 20, fontWeight: 700 }}>Separar Comprovantes de Pagamento</h2>
              <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Anexe a planilha de colaboradores e o PDF com comprovantes. A identificação é feita pelo CPF.</p>
            </div>

            <button onClick={downloadTemplate} style={{ width: "100%", background: "transparent", border: `2px solid ${AMBER}`, color: "#795548", borderRadius: 10, padding: "0.75rem", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⬇️</span> Baixar Planilha Modelo (CSV)
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div onClick={() => compXlsxRef.current?.click()} style={{ border: `2px dashed ${AMBER}88`, borderRadius: 12, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: xlsxFile ? "#fff8e1" : "#fafafa" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📊</div>
                <div style={{ fontWeight: 600, color: "#795548", fontSize: 13 }}>{xlsxFile ? xlsxFile.name : "Planilha de Colaboradores"}</div>
                <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>.xlsx, .xls ou .csv</div>
                <input ref={compXlsxRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => { setXlsxFile(e.target.files[0]); setCompResults([]); setCompStatus(""); }} />
              </div>
              <div onClick={() => compPdfRef.current?.click()} style={{ border: `2px dashed ${AMBER}88`, borderRadius: 12, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: compFile ? "#fff8e1" : "#fafafa" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>📋</div>
                <div style={{ fontWeight: 600, color: "#795548", fontSize: 13 }}>{compFile ? compFile.name : "PDF de Comprovantes"}</div>
                <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>Somente .pdf</div>
                <input ref={compPdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => { setCompFile(e.target.files[0]); setCompResults([]); setCompStatus(""); }} />
              </div>
            </div>

            <button onClick={processComprovantes} disabled={!compFile || !xlsxFile || compProcessing} style={{ width: "100%", background: compFile && xlsxFile && !compProcessing ? "#795548" : "#ccc", color: "#fff", border: "none", borderRadius: 10, padding: "0.9rem", fontWeight: 700, fontSize: 15, cursor: compFile && xlsxFile && !compProcessing ? "pointer" : "not-allowed", marginBottom: "1rem" }}>
              {compProcessing ? "⏳ Processando..." : "Identificar Comprovantes com IA"}
            </button>

            {compProcessing && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ background: "#eee", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ background: AMBER, height: "100%", width: `${compProgress}%`, transition: "width 0.4s", borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" }}>{compProgress}%</div>
              </div>
            )}

            {compStatus && (
              <div style={{ background: compStatus.startsWith("✓") ? "#fff8e1" : "#ffebee", border: `1.5px solid ${compStatus.startsWith("✓") ? AMBER : "#ef9a9a"}`, borderRadius: 10, padding: "0.8rem 1rem", fontSize: 14, color: compStatus.startsWith("✓") ? "#795548" : "#c62828", marginBottom: "1rem", fontWeight: 500 }}>
                {compStatus}
              </div>
            )}

            {compResults.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, color: DARK, marginBottom: "0.75rem", fontSize: 15 }}>Comprovantes Identificados:</div>
                {compResults.map(c => (
                  <div key={c.id} style={{ background: "#fff8e1", border: `1px solid ${AMBER}44`, borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>{c.nome}</div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>CPF: {c.cpf} • Depto: {c.departamento} • Valor: R$ {c.valor}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>Data: {c.data} • Arquivo: {c.filename}</div>
                    </div>
                    <div style={{ background: AMBER, color: "#fff", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: 12, fontWeight: 700 }}>Pág. {c.pagina}</div>
                  </div>
                ))}
                <div style={{ background: "#fff8e1", borderRadius: 10, padding: "0.75rem 1rem", fontSize: 13, color: "#795548", fontWeight: 600, marginTop: "0.5rem", textAlign: "center" }}>
                  ℹ️ Para baixar os PDFs separados individualmente, utilize ferramentas como ilovepdf.com com os nomes e páginas identificados acima.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ textAlign: "center", padding: "2rem", color: "#aaa", fontSize: 12 }}>
        © 2025 Parente Andrade Ltda — Sistema Interno de Gestão Documental
      </footer>
    </div>
  );
}
