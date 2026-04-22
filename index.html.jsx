<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PA Sistema - Parente Andrade</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<style>
:root {
  --green: #4a8c3f; --green-dark: #2d6a2d; --green-light: #6ab04c;
  --gold: #e8a020; --gold-dark: #c8880a;
  --black: #1a1a1a; --surface: #f5f5f0; --white: #ffffff;
  --border: #d8d8ce; --text: #2a2a2a; --muted: #777;
  --error: #d93025; --success: #34a853;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; background: #eeeee8; min-height: 100vh; color: var(--text); display: flex; flex-direction: column; }

.header { background: #fff; border-bottom: 3px solid var(--gold); height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.header img { height: 44px; object-fit: contain; }
.header-sub { color: #aaa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }

.body { display: flex; flex: 1; }
.sidebar { width: 220px; background: var(--white); border-right: 1px solid var(--border); padding: 28px 0; flex-shrink: 0; }
.sidebar-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); padding: 0 18px 10px; }
.nav { display: flex; align-items: center; gap: 10px; padding: 12px 18px; cursor: pointer; color: var(--muted); font-size: 13px; font-weight: 700; border-left: 3px solid transparent; transition: all .18s; user-select: none; }
.nav:hover { background: var(--surface); color: var(--text); }
.nav.active { background: rgba(74,140,63,.09); color: var(--green); border-left-color: var(--green); }
.nav-icon { width: 34px; height: 34px; border-radius: 8px; background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.nav.active .nav-icon { background: rgba(74,140,63,.14); }

.content { flex: 1; padding: 32px; overflow-y: auto; }
.page { display: none; } .page.active { display: block; }

.page-title { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: var(--black); }
.page-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

.card { background: var(--white); border: 1px solid var(--border); border-radius: 4px; padding: 24px; margin-bottom: 18px; }
.card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--black); display: flex; align-items: center; gap: 8px; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 2px solid var(--surface); }
.dot { width: 8px; height: 8px; background: var(--gold); border-radius: 50%; flex-shrink: 0; }

.upload-area { border: 2px dashed var(--border); border-radius: 4px; background: var(--surface); padding: 28px 20px; text-align: center; transition: border-color .2s, background .2s; }
.upload-area.drag-over { border-color: var(--green); background: rgba(74,140,63,.05); }
.upload-area.has-file { border-color: var(--green); border-style: solid; background: rgba(74,140,63,.04); }
.upload-area .u-icon { font-size: 32px; margin-bottom: 10px; }
.upload-area h4 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.upload-area p { font-size: 12px; color: var(--muted); margin-bottom: 14px; }

.btn-select { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; background: var(--white); border: 1.5px solid var(--border); border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; color: var(--text); cursor: pointer; transition: all .18s; }
.btn-select:hover { border-color: var(--green); color: var(--green); }

.file-tag { display: none; align-items: center; gap: 10px; margin-top: 12px; padding: 10px 14px; background: white; border: 1px solid var(--border); border-radius: 3px; }
.file-tag.show { display: flex; }
.file-tag-name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-tag-size { font-size: 11px; color: var(--muted); }
.file-tag-clear { margin-left: auto; cursor: pointer; color: var(--muted); font-size: 16px; flex-shrink: 0; }
.file-tag-clear:hover { color: var(--error); }

.btn-process { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; background: var(--green); color: white; border: none; border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: background .18s; margin-top: 6px; }
.btn-process:hover { background: var(--green-dark); }
.btn-process:disabled { background: #aaa; cursor: not-allowed; }

.btn-unify { display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; background: #7b3fa0; color: white; border: none; border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: background .18s; margin-top: 6px; }
.btn-unify:hover { background: #5c2e7a; }
.btn-unify:disabled { background: #aaa; cursor: not-allowed; }

.btn-gold { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--gold); color: var(--black); border: none; border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; text-decoration: none; transition: background .18s; }
.btn-gold:hover { background: var(--gold-dark); }

.btn-dark { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--black); color: white; border: none; border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: background .18s; }
.btn-dark:hover { background: #333; }
.btn-dark:disabled { background: #888; cursor: not-allowed; }

.btn-purple { display: none; align-items: center; gap: 6px; padding: 12px 28px; background: #7b3fa0; color: white; border: none; border-radius: 3px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: background .18s; margin-top: 12px; }
.btn-purple:hover { background: #5c2e7a; }

.progress-wrap { display: none; margin-top: 18px; }
.progress-bg { height: 6px; background: var(--surface); border-radius: 3px; overflow: hidden; margin-bottom: 7px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--green), var(--green-light)); border-radius: 3px; transition: width .3s; width: 0%; }
.progress-fill-purple { background: linear-gradient(90deg, #7b3fa0, #b06fd4); }
.progress-txt { font-size: 12px; color: var(--muted); font-weight: 600; }

.alert { display: none; padding: 13px 16px; border-radius: 3px; font-size: 13px; font-weight: 600; margin-top: 14px; }
.alert-err { background: rgba(217,48,37,.08); border-left: 3px solid var(--error); color: var(--error); }
.alert-ok { background: rgba(52,168,83,.08); border-left: 3px solid var(--success); color: #1a7a3a; }

.results-header { display: flex; align-items: center; justify-content: space-between; margin: 24px 0 12px; }
.results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.result-item { display: flex; align-items: center; gap: 10px; padding: 13px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 3px; cursor: pointer; transition: all .18s; }
.result-item:hover { border-color: var(--green); background: rgba(74,140,63,.05); }
.result-icon { width: 34px; height: 34px; background: rgba(74,140,63,.12); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.result-name { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-pages { font-size: 11px; color: var(--muted); margin-top: 2px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.preview-table th { padding: 8px 12px; text-align: left; border-bottom: 2px solid var(--border); font-weight: 700; background: var(--surface); }
.preview-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); }

.info-box { background: rgba(123,63,160,.07); border-left: 3px solid #7b3fa0; border-radius: 3px; padding: 12px 16px; font-size: 13px; color: #4a1e6a; margin-bottom: 18px; line-height: 1.6; }

@media(max-width:768px) { .two-col { grid-template-columns: 1fr; } .sidebar { display: none; } .content { padding: 18px; } }
</style>
</head>
<body>

<header class="header">
  <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADjArQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAgJBgcDBAUBAv/EAFcQAAEDAgMCBQoPDwMDBQEAAAEAAgMEBQYHERIhCBMxQVEJFGFxdYGRsbPRFRYXIjI2N1JVdIKSk6HSIzM0OEJUVldicnOUlaLBGDWyJUPhJFNjwtNl/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAUGAgMEBwH/xAA5EQEAAQMBAwcLAwQDAQAAAAAAAQIDBBEFITESExRBUXGhBhUzNFKBkbHB0eFhkvAiMmJyFlPxQv/aAAwDAQACEQMRAD8AmWiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiLFMbY+sGFdYauV1RWkaimh0Lh0bR5Gjt7+wsLl2i1Tyq50hjVVFMayytFoyszxuRlPWdjpGM13cbI5x+rRcHq3334Itv9/2lHztfFjr8JaOl2u1vpFoX1b778EW3+/7Serfffgi2/3/AGk874vb4HS7Xa30i0L6t99+CLb/AH/aT1b778EW3+/7Sed8Xt8Dpdrtb6RaKjzxuo++WSid+7I4edejRZ5Qn8Mw+9v8Ko18bVlTtbFn/wCvCX2Mu1PW3Ii17as38IVha2okq6Fx3fdodW+FuqzS0Xm1XeLjbZcKarbz8VICR2xyhddrJtXf7KoltpuUVcJd5ERbmYiIgIiwzGmMKm0XQUVBFTSFrAZTK0nQnkA0I5vGuTNzbOFa527O7g34+PXkV8ijizNFq/1Q71+a2/6N/wBpPVDvX5rb/o3/AGlEf8owO2fg7vM2T2R8W0EWr/VDvX5rb/o3/aT1Q71+a2/6N/2k/wCUYHbPwPM2T2R8W0EWKYGxRPfJqinrI4I5mND2cUCARyHlJ7CytTOJl2su1F21O6XBfsV2K5or4iIi6WkREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQYlmrio4Uww+pgLTXVDuKpgd+jtN7u8Pr0UYauonqqmSpqZXyzSOLnvedS4nlJK2lwlKuR2JrbQkni46LjQOy57gf8AgFqhVHa1+q5fmjqpROXcmq5p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" alt="Parente Andrade">
  <span class="header-sub">Sistema de Gestão de Documentos</span>
</header>

<div class="body">
  <nav class="sidebar">
    <div class="sidebar-label">Menu</div>
    <div class="nav active" id="nav-cc" onclick="goPage('cc')"><div class="nav-icon">📄</div> Contracheques</div>
    <div class="nav" id="nav-cp" onclick="goPage('cp')"><div class="nav-icon">🏦</div> Comprovantes</div>
    <div class="nav" id="nav-uz" onclick="goPage('uz')"><div class="nav-icon">🔗</div> Unificar</div>
  </nav>

  <main class="content">

    <!-- CONTRACHEQUES -->
    <div class="page active" id="page-cc">
      <div class="page-title">Separador de Contracheques</div>
      <div class="page-sub">Cada contracheque será salvo com o nome completo do colaborador seguido do número 1 (ex: João da Silva 1.pdf).</div>
      <div class="card">
        <div class="card-title"><div class="dot"></div>Upload do Arquivo PDF</div>
        <div class="upload-area" id="cc-area" ondragover="dragOver(event,'cc-area')" ondragleave="dragLeave('cc-area')" ondrop="drop(event,'cc')">
          <div class="u-icon">📁</div>
          <h4>Arraste o PDF aqui</h4>
          <p>Um contracheque por página</p>
          <button type="button" class="btn-select" onclick="document.getElementById('cc-file').click()">📂 Selecionar Arquivo</button>
          <input type="file" id="cc-file" accept=".pdf" style="display:none" onchange="fileSelected('cc',this)">
        </div>
        <div class="file-tag" id="cc-tag">
          <span style="font-size:20px">📄</span>
          <div style="overflow:hidden;flex:1"><div class="file-tag-name" id="cc-tag-name"></div><div class="file-tag-size" id="cc-tag-size"></div></div>
          <span class="file-tag-clear" onclick="clearFile('cc')">✕</span>
        </div>
      </div>
      <button type="button" class="btn-process" id="cc-btn" onclick="processCC()">⚙️ Processar e Separar</button>
      <div class="progress-wrap" id="cc-prog"><div class="progress-bg"><div class="progress-fill" id="cc-bar"></div></div><div class="progress-txt" id="cc-txt"></div></div>
      <div class="alert alert-err" id="cc-err"></div>
      <div class="alert alert-ok" id="cc-ok"></div>
      <div id="cc-results" style="display:none">
        <div class="results-header">
          <div class="card-title" style="margin:0;border:0;padding:0"><div class="dot"></div>Arquivos Gerados</div>
          <button type="button" class="btn-dark" id="cc-dl-btn" onclick="dlAllZip('cc','Contracheques')">⬇ Baixar Tudo (.zip)</button>
        </div>
        <div class="results-grid" id="cc-grid"></div>
      </div>
    </div>

    <!-- COMPROVANTES -->
    <div class="page" id="page-cp">
      <div class="page-title">Separador de Comprovantes</div>
      <div class="page-sub">Faça upload da planilha e do PDF de comprovantes. A identificação é feita pelo CPF.</div>
      <div class="two-col">
        <div class="card">
          <div class="card-title"><div class="dot"></div>Planilha de Colaboradores</div>
          <a class="btn-gold" href="data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,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" download="PLANILHA_MODELO.xlsx">⬇ Baixar Planilha Modelo</a>
          <div style="margin-top:16px">
            <div class="upload-area" id="xl-area" ondragover="dragOver(event,'xl-area')" ondragleave="dragLeave('xl-area')" ondrop="drop(event,'xl')">
              <div class="u-icon">📊</div>
              <h4>Arraste a Planilha aqui</h4>
              <p>Excel com NOME, CPF e DEPARTAMENTO</p>
              <button type="button" class="btn-select" onclick="document.getElementById('xl-file').click()">📂 Selecionar Planilha</button>
              <input type="file" id="xl-file" accept=".xlsx,.xls,.csv" style="display:none" onchange="fileSelected('xl',this);loadPlanilha(this)">
            </div>
            <div class="file-tag" id="xl-tag">
              <span style="font-size:20px">📊</span>
              <div style="overflow:hidden;flex:1"><div class="file-tag-name" id="xl-tag-name"></div><div class="file-tag-size" id="xl-tag-size"></div></div>
              <span class="file-tag-clear" onclick="clearFile('xl')">✕</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><div class="dot"></div>Arquivo de Comprovantes</div>
          <div class="upload-area" id="cp-area" ondragover="dragOver(event,'cp-area')" ondragleave="dragLeave('cp-area')" ondrop="drop(event,'cp')">
            <div class="u-icon">🏦</div>
            <h4>Arraste o PDF aqui</h4>
            <p>PDF com todos os comprovantes</p>
            <button type="button" class="btn-select" onclick="document.getElementById('cp-file').click()">📂 Selecionar Arquivo</button>
            <input type="file" id="cp-file" accept=".pdf" style="display:none" onchange="fileSelected('cp',this)">
          </div>
          <div class="file-tag" id="cp-tag">
            <span style="font-size:20px">📄</span>
            <div style="overflow:hidden;flex:1"><div class="file-tag-name" id="cp-tag-name"></div><div class="file-tag-size" id="cp-tag-size"></div></div>
            <span class="file-tag-clear" onclick="clearFile('cp')">✕</span>
          </div>
        </div>
      </div>
      <div class="card" id="xl-preview" style="display:none">
        <div class="card-title"><div class="dot"></div>Colaboradores Carregados</div>
        <div id="xl-table"></div>
      </div>
      <button type="button" class="btn-process" id="cp-btn" onclick="processCP()">⚙️ Processar e Separar</button>
      <div class="progress-wrap" id="cp-prog"><div class="progress-bg"><div class="progress-fill" id="cp-bar"></div></div><div class="progress-txt" id="cp-txt"></div></div>
      <div class="alert alert-err" id="cp-err"></div>
      <div class="alert alert-ok" id="cp-ok"></div>
      <div id="cp-results" style="display:none">
        <div class="results-header">
          <div class="card-title" style="margin:0;border:0;padding:0"><div class="dot"></div>Arquivos Gerados</div>
          <button type="button" class="btn-dark" id="cp-dl-btn" onclick="dlAllZip('cp','Comprovantes')">⬇ Baixar Tudo (.zip)</button>
        </div>
        <div class="results-grid" id="cp-grid"></div>
      </div>
    </div>

    <!-- UNIFICAR -->
    <div class="page" id="page-uz">
      <div class="page-title">Unificar Comprovantes</div>
      <div class="page-sub">Combina contracheques e comprovantes em um único PDF por colaborador: contracheque em cima, comprovante embaixo.</div>

      <div class="info-box">
        💡 <strong>Como funciona:</strong> Anexe o ZIP dos contracheques (arquivos com " 1" no final do nome) e o ZIP dos comprovantes. O sistema cruza os nomes e gera um PDF unificado na ordem: contracheque → comprovante, colaborador por colaborador.
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-title"><div class="dot"></div>ZIP dos Contracheques</div>
          <div class="upload-area" id="uz_cc-area" ondragover="dragOver(event,'uz_cc-area')" ondragleave="dragLeave('uz_cc-area')" ondrop="drop(event,'uz_cc')">
            <div class="u-icon">🗜️</div>
            <h4>ZIP dos Contracheques</h4>
            <p>Arquivos com " 1" no final do nome</p>
            <button type="button" class="btn-select" onclick="document.getElementById('uz_cc-file').click()">📂 Selecionar ZIP</button>
            <input type="file" id="uz_cc-file" accept=".zip" style="display:none" onchange="fileSelected('uz_cc',this)">
          </div>
          <div class="file-tag" id="uz_cc-tag">
            <span style="font-size:20px">🗜️</span>
            <div style="overflow:hidden;flex:1"><div class="file-tag-name" id="uz_cc-tag-name"></div><div class="file-tag-size" id="uz_cc-tag-size"></div></div>
            <span class="file-tag-clear" onclick="clearFile('uz_cc')">✕</span>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><div class="dot"></div>ZIP dos Comprovantes</div>
          <div class="upload-area" id="uz_cp-area" ondragover="dragOver(event,'uz_cp-area')" ondragleave="dragLeave('uz_cp-area')" ondrop="drop(event,'uz_cp')">
            <div class="u-icon">🗜️</div>
            <h4>ZIP dos Comprovantes</h4>
            <p>Gerado na aba Comprovantes</p>
            <button type="button" class="btn-select" onclick="document.getElementById('uz_cp-file').click()">📂 Selecionar ZIP</button>
            <input type="file" id="uz_cp-file" accept=".zip" style="display:none" onchange="fileSelected('uz_cp',this)">
          </div>
          <div class="file-tag" id="uz_cp-tag">
            <span style="font-size:20px">🗜️</span>
            <div style="overflow:hidden;flex:1"><div class="file-tag-name" id="uz_cp-tag-name"></div><div class="file-tag-size" id="uz_cp-tag-size"></div></div>
            <span class="file-tag-clear" onclick="clearFile('uz_cp')">✕</span>
          </div>
        </div>
      </div>

      <button type="button" class="btn-unify" id="uz-btn" onclick="processUnify()">🔗 Unificar PDFs</button>
      <div class="progress-wrap" id="uz-prog"><div class="progress-bg"><div class="progress-fill progress-fill-purple" id="uz-bar"></div></div><div class="progress-txt" id="uz-txt"></div></div>
      <div class="alert alert-err" id="uz-err"></div>
      <div class="alert alert-ok" id="uz-ok"></div>

      <div id="uz-results" style="display:none;margin-top:24px">
        <div class="card">
          <div class="card-title"><div class="dot"></div>PDF Unificado Gerado</div>
          <div id="uz-summary"></div>
          <button type="button" class="btn-purple" id="uz-dl-final">⬇ Baixar PDF Unificado</button>
        </div>
      </div>
    </div>

  </main>
</div>

<script>

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const files = { cc: null, xl: null, cp: null, uz_cc: null, uz_cp: null };
const stored = { cc: [], cp: [] };
let planilha = [];

// ---- NAVIGATION ----
function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('nav-' + id).classList.add('active');
}

// ---- FILE HANDLING ----
function fileSelected(prefix, input) {
  const f = input.files[0];
  if (!f) return;
  files[prefix] = f;
  const area = document.getElementById(prefix + '-area');
  if (area) area.classList.add('has-file');
  const tag = document.getElementById(prefix + '-tag');
  if (tag) tag.classList.add('show');
  const nameEl = document.getElementById(prefix + '-tag-name');
  const sizeEl = document.getElementById(prefix + '-tag-size');
  if (nameEl) nameEl.textContent = f.name;
  if (sizeEl) sizeEl.textContent = (f.size / 1024 / 1024).toFixed(2) + ' MB';
}

function clearFile(prefix) {
  files[prefix] = null;
  const area = document.getElementById(prefix + '-area');
  if (area) area.classList.remove('has-file');
  const tag = document.getElementById(prefix + '-tag');
  if (tag) tag.classList.remove('show');
  const input = document.getElementById(prefix + '-file');
  if (input) input.value = '';
  if (prefix === 'xl') { planilha = []; document.getElementById('xl-preview').style.display = 'none'; }
}

function dragOver(e, areaId) { e.preventDefault(); document.getElementById(areaId).classList.add('drag-over'); }
function dragLeave(areaId) { document.getElementById(areaId).classList.remove('drag-over'); }
function drop(e, prefix) {
  e.preventDefault();
  const areaId = prefix + '-area';
  document.getElementById(areaId).classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (!f) return;
  const input = document.getElementById(prefix + '-file');
  const dt = new DataTransfer(); dt.items.add(f); input.files = dt.files;
  fileSelected(prefix, input);
  if (prefix === 'xl') loadPlanilha(input);
}

// ---- PROGRESS / ALERTS ----
function setProgress(prefix, pct, txt) {
  document.getElementById(prefix + '-prog').style.display = 'block';
  document.getElementById(prefix + '-bar').style.width = pct + '%';
  document.getElementById(prefix + '-txt').textContent = txt;
}
function showErr(prefix, msg) {
  const e = document.getElementById(prefix + '-err');
  e.textContent = msg; e.style.display = 'block';
  document.getElementById(prefix + '-ok').style.display = 'none';
}
function showOk(prefix, msg) {
  const e = document.getElementById(prefix + '-ok');
  e.textContent = msg; e.style.display = 'block';
  document.getElementById(prefix + '-err').style.display = 'none';
}
function hideAlerts(prefix) {
  document.getElementById(prefix + '-err').style.display = 'none';
  document.getElementById(prefix + '-ok').style.display = 'none';
}

// ---- ZIP DOWNLOAD ----
async function dlAllZip(prefix, zipName) {
  const items = stored[prefix];
  if (!items.length) return;
  const btn = document.getElementById(prefix + '-dl-btn');
  btn.disabled = true; btn.textContent = '⏳ Compactando...';
  try {
    const zip = new JSZip();
    items.forEach(item => zip.file(item.name, item.bytes));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = zipName + '.zip'; a.click();
  } catch(e) { alert('Erro ao gerar ZIP: ' + e.message); }
  btn.disabled = false; btn.textContent = '⬇ Baixar Tudo (.zip)';
}

function dlItem(item) {
  const url = URL.createObjectURL(new Blob([item.bytes], { type: 'application/pdf' }));
  const a = document.createElement('a'); a.href = url; a.download = item.name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function addResult(prefix, name, bytes, pages) {
  const item = { name, bytes };
  stored[prefix].push(item);
  const el = document.createElement('div');
  el.className = 'result-item';
  el.innerHTML = `<div class="result-icon">📄</div>
    <div style="overflow:hidden;flex:1">
      <div class="result-name">${name}</div>
      <div class="result-pages">${pages} página${pages > 1 ? 's' : ''}</div>
    </div>
    <span style="color:var(--green);font-size:18px">⬇</span>`;
  el.onclick = () => dlItem(item);
  document.getElementById(prefix + '-grid').appendChild(el);
}

// ---- TEXT EXTRACTION ----
async function pageText(pdfjsDoc, pageNum) {
  const page = await pdfjsDoc.getPage(pageNum);
  const content = await page.getTextContent();
  return content.items.map(i => i.str).join(' ');
}

function sanitize(s) {
  return s.replace(/[\/\\?%*:|"<>]/g, '').trim().substring(0, 100) || 'Sem_Nome';
}

// ---- EXTRACT FULL NAME ----
function extractName(text, idx) {
  const t = text.replace(/\s+/g, ' ').trim();

  // Pattern 1: ALL CAPS full name after "Nome :"
  let m = t.match(/Nome\s*:\s*((?:[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ]{2,}\s+){1,8}[A-ZÀÁÂÃÉÊÍÓÔÕÚÇ]{2,})/);
  if (m && m[1].trim().split(/\s+/).length >= 2) return m[1].trim();

  // Pattern 2: Mixed case, stops at known keywords or 2+ spaces
  m = t.match(/Nome\s*:\s*([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+){1,8}?)(?=\s{2,}|\s*(?:Local|Fun|Sal|Mat|Nome\s*Soc|CBO|Ordem|CNPJ|$))/);
  if (m && m[1].trim().split(/\s+/).length >= 2) return m[1].trim();

  // Pattern 3: loose fallback
  m = t.match(/Nome\s*:\s*([A-Za-zÀ-ú]{2,}(?:\s+[A-Za-zÀ-ú]{2,}){1,8})/i);
  if (m && m[1].trim().split(/\s+/).length >= 2) return m[1].trim();

  return 'Colaborador_Pag_' + (idx + 1);
}

// ---- PROCESS CONTRACHEQUES (append "1" to name) ----
async function processCC() {
  hideAlerts('cc');
  if (!files.cc) { showErr('cc', '⚠ Selecione o arquivo PDF primeiro.'); return; }
  const btn = document.getElementById('cc-btn');
  btn.disabled = true;
  stored.cc = [];
  document.getElementById('cc-grid').innerHTML = '';
  document.getElementById('cc-results').style.display = 'none';

  try {
    setProgress('cc', 5, 'Carregando PDF...');
    const buf = await files.cc.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(buf);
    const pdfjs = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const total = pdfDoc.getPageCount();
    setProgress('cc', 10, `PDF com ${total} páginas carregado`);

    for (let i = 0; i < total; i++) {
      setProgress('cc', 10 + Math.round((i / total) * 85), `Processando página ${i+1} de ${total}...`);
      const text = await pageText(pdfjs, i + 1);
      const name = extractName(text, i);
      const newDoc = await PDFLib.PDFDocument.create();
      const [pg] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(pg);
      const bytes = await newDoc.save();
      // Append "1" to distinguish contracheque from comprovante
      addResult('cc', sanitize(name) + ' 1.pdf', bytes, 1);
    }
    setProgress('cc', 100, 'Concluído!');
    document.getElementById('cc-results').style.display = 'block';
    showOk('cc', `✅ ${total} contracheque(s) separado(s) com sucesso!`);
  } catch(e) {
    console.error(e);
    showErr('cc', '❌ Erro: ' + e.message);
    document.getElementById('cc-prog').style.display = 'none';
  }
  btn.disabled = false;
}

// ---- PLANILHA ----
function normCPF(c) { return String(c).replace(/\D/g, ''); }

function loadPlanilha(input) {
  const f = input.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = e => {
    const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    planilha = rows.map(r => {
      const n = {};
      for (const k in r) n[k.trim().toUpperCase()] = String(r[k]).trim();
      return n;
    }).filter(r => r.CPF && r.NOME);
    renderPreview();
  };
  reader.readAsArrayBuffer(f);
}

function renderPreview() {
  const el = document.getElementById('xl-preview');
  if (!planilha.length) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const rows = planilha.slice(0, 8);
  let html = `<table class="preview-table"><thead><tr><th>NOME</th><th>CPF</th><th>DEPARTAMENTO</th></tr></thead><tbody>`;
  rows.forEach(r => { html += `<tr><td>${r.NOME}</td><td>${r.CPF}</td><td>${r.DEPARTAMENTO || ''}</td></tr>`; });
  if (planilha.length > 8) html += `<tr><td colspan="3" style="color:var(--muted);font-size:12px">... e mais ${planilha.length - 8} registros</td></tr>`;
  html += '</tbody></table>';
  document.getElementById('xl-table').innerHTML = html;
}

// ---- PROCESS COMPROVANTES ----
async function processCP() {
  hideAlerts('cp');
  if (!files.xl) { showErr('cp', '⚠ Carregue a planilha de colaboradores.'); return; }
  if (!files.cp) { showErr('cp', '⚠ Selecione o PDF de comprovantes.'); return; }
  if (!planilha.length) { showErr('cp', '⚠ A planilha está vazia ou sem dados válidos.'); return; }
  const btn = document.getElementById('cp-btn');
  btn.disabled = true;
  stored.cp = [];
  document.getElementById('cp-grid').innerHTML = '';
  document.getElementById('cp-results').style.display = 'none';

  try {
    setProgress('cp', 5, 'Carregando PDF...');
    const buf = await files.cp.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(buf);
    const pdfjs = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const total = pdfDoc.getPageCount();
    setProgress('cp', 10, `PDF com ${total} páginas carregado`);

    const groups = {};
    for (let i = 0; i < total; i++) {
      setProgress('cp', 10 + Math.round((i / total) * 60), `Analisando página ${i+1} de ${total}...`);
      const text = await pageText(pdfjs, i + 1);
      let matched = false;
      const cpfMatches = text.match(/\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[\-\.\s]?\d{2}/g) || [];
      for (const raw of cpfMatches) {
        const cpf = normCPF(raw);
        if (cpf.length === 11) {
          const collab = planilha.find(r => normCPF(r.CPF) === cpf);
          if (collab) {
            if (!groups[cpf]) groups[cpf] = { collab, pages: [] };
            groups[cpf].pages.push(i); matched = true; break;
          }
        }
      }
      if (!matched) {
        const digits = text.replace(/\D/g, '');
        for (const collab of planilha) {
          const cpf = normCPF(collab.CPF);
          if (cpf.length === 11 && digits.includes(cpf)) {
            if (!groups[cpf]) groups[cpf] = { collab, pages: [] };
            groups[cpf].pages.push(i); break;
          }
        }
      }
    }

    const keys = Object.keys(groups);
    for (let i = 0; i < keys.length; i++) {
      const g = groups[keys[i]];
      setProgress('cp', 72 + Math.round((i / keys.length) * 25), `Gerando: ${g.collab.NOME}...`);
      const newDoc = await PDFLib.PDFDocument.create();
      const copied = await newDoc.copyPages(pdfDoc, g.pages);
      copied.forEach(p => newDoc.addPage(p));
      const bytes = await newDoc.save();
      addResult('cp', sanitize(g.collab.NOME) + '.pdf', bytes, g.pages.length);
    }

    setProgress('cp', 100, 'Concluído!');
    document.getElementById('cp-results').style.display = 'block';
    const unmatched = total - Object.values(groups).reduce((a, g) => a + g.pages.length, 0);
    let msg = `✅ ${keys.length} comprovante(s) separado(s)!`;
    if (unmatched > 0) msg += ` (${unmatched} pág. não identificada(s))`;
    showOk('cp', msg);
  } catch(e) {
    console.error(e);
    showErr('cp', '❌ Erro: ' + e.message);
    document.getElementById('cp-prog').style.display = 'none';
  }
  btn.disabled = false;
}

// ======== UNIFICAR COMPROVANTES ========

// Read all files from a ZIP, returns Map<baseName, Uint8Array>
async function readZipFiles(zipFile) {
  const buf = await zipFile.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const result = new Map();
  for (const [filename, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const name = filename.split('/').pop(); // strip folder path
    if (name.toLowerCase().endsWith('.pdf')) {
      const bytes = await entry.async('uint8array');
      result.set(name, bytes);
    }
  }
  return result;
}

// Normalize name for matching: lowercase, remove accents, trim spaces
function normName(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip suffix like " 1" and ".pdf" from filename for matching
function baseNameCC(filename) {
  // "FELIPE CANDIDO SAFI 1.pdf" -> "felipe candido safi"
  return normName(filename.replace(/\.pdf$/i, '').replace(/\s*1\s*$/, '').trim());
}

function baseNameCP(filename) {
  // "FELIPE CANDIDO SAFI.pdf" -> "felipe candido safi"
  return normName(filename.replace(/\.pdf$/i, '').trim());
}

async function processUnify() {
  hideAlerts('uz');
  if (!files.uz_cc) { showErr('uz', '⚠ Selecione o ZIP dos contracheques.'); return; }
  if (!files.uz_cp) { showErr('uz', '⚠ Selecione o ZIP dos comprovantes.'); return; }

  const btn = document.getElementById('uz-btn');
  btn.disabled = true;
  document.getElementById('uz-results').style.display = 'none';
  document.getElementById('uz-summary').innerHTML = '';

  try {
    setProgress('uz', 5, 'Lendo ZIP de contracheques...');
    const ccFiles = await readZipFiles(files.uz_cc);
    setProgress('uz', 25, 'Lendo ZIP de comprovantes...');
    const cpFiles = await readZipFiles(files.uz_cp);

    setProgress('uz', 40, 'Cruzando arquivos...');

    // Build lookup map for comprovantes
    const cpMap = new Map();
    for (const [fname] of cpFiles) {
      cpMap.set(baseNameCP(fname), fname);
    }

    const matched = [];
    const unmatchedCC = [];

    for (const [ccFname] of ccFiles) {
      const key = baseNameCC(ccFname);
      if (cpMap.has(key)) {
        matched.push({ key, ccFname, cpFname: cpMap.get(key) });
      } else {
        unmatchedCC.push(ccFname);
      }
    }

    setProgress('uz', 50, `${matched.length} pares encontrados. Unificando PDFs...`);

    const mergedDoc = await PDFLib.PDFDocument.create();
    let done = 0;

    for (const pair of matched) {
      setProgress('uz', 50 + Math.round((done / matched.length) * 45),
        `Unificando: ${pair.key}...`);

      const ccBytes = ccFiles.get(pair.ccFname);
      const cpBytes = cpFiles.get(pair.cpFname);

      const ccDoc = await PDFLib.PDFDocument.load(ccBytes);
      const cpDoc = await PDFLib.PDFDocument.load(cpBytes);

      const ccPages = await mergedDoc.copyPages(ccDoc, ccDoc.getPageIndices());
      const cpPages = await mergedDoc.copyPages(cpDoc, cpDoc.getPageIndices());

      ccPages.forEach(p => mergedDoc.addPage(p));
      cpPages.forEach(p => mergedDoc.addPage(p));

      done++;
    }

    setProgress('uz', 97, 'Gerando PDF final...');
    const finalBytes = await mergedDoc.save();
    const blob = new Blob([finalBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Show result
    setProgress('uz', 100, 'Concluído!');
    document.getElementById('uz-results').style.display = 'block';

    // Summary
    let summaryHtml = `<div style="margin-bottom:12px;font-size:13px;color:var(--muted)">
      <strong style="color:var(--text)">${matched.length}</strong> colaboradores unificados
      ${unmatchedCC.length > 0 ? `· <strong style="color:var(--error)">${unmatchedCC.length}</strong> contracheque(s) sem comprovante correspondente` : ''}
    </div>`;

    if (unmatchedCC.length > 0) {
      summaryHtml += `<div style="font-size:12px;color:var(--error);margin-bottom:12px">
        Sem par: ${unmatchedCC.map(f => f.replace('.pdf','')).join(', ')}
      </div>`;
    }
    document.getElementById('uz-summary').innerHTML = summaryHtml;

    // Download button
    const dlBtn = document.getElementById('uz-dl-final');
    dlBtn.style.display = 'inline-flex';
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url; a.download = 'Contracheques_Comprovantes_Unificados.pdf'; a.click();
    };

    showOk('uz', `✅ PDF unificado gerado com ${matched.length} colaboradores!`);

  } catch(e) {
    console.error(e);
    showErr('uz', '❌ Erro ao unificar: ' + e.message);
    document.getElementById('uz-prog').style.display = 'none';
  }
  btn.disabled = false;
}

</script>
</body>
</html>
