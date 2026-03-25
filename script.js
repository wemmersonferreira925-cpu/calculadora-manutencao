/* ============================================================
   SCM — Sistema de Controle de Manutenção
   script.js
   ============================================================ */

/* ── DADOS PADRÃO ─────────────────────────────────────────── */
const MANUTENCOES_PADRAO = [
  { id: 'm1', tipo: 'Troca de óleo',         descricao: 'Óleo de motor + filtro de óleo',    intervalo: 250  },
  { id: 'm2', tipo: 'Filtros de ar',          descricao: 'Filtro primário e secundário',       intervalo: 300  },
  { id: 'm3', tipo: 'Revisão de correias',    descricao: 'Correia dentada e de acessórios',   intervalo: 500  },
  { id: 'm4', tipo: 'Sistema de arrefecimento', descricao: 'Líquido de arrefecimento',        intervalo: 750  },
  { id: 'm5', tipo: 'Inspeção hidráulica',    descricao: 'Fluido hidráulico e mangueiras',    intervalo: 1000 },
  { id: 'm6', tipo: 'Revisão de freios',      descricao: 'Pastilhas, discos e fluido',        intervalo: 1500 },
  { id: 'm7', tipo: 'Revisão geral',          descricao: 'Todos os sistemas e componentes',   intervalo: 2000 },
];

/* ── ESTADO ───────────────────────────────────────────────── */
let state = {
  maquinas:     [],
  historico:    [],
  manutencoes:  [],
  tema:         'light',
  nextMaqId:    1,
  nextHistId:   1,
};

/* ── PERSISTÊNCIA ─────────────────────────────────────────── */
function salvarState() {
  try { localStorage.setItem('scm_state', JSON.stringify(state)); } catch(e) {}
}

function carregarState() {
  try {
    const s = localStorage.getItem('scm_state');
    if (s) {
      const parsed = JSON.parse(s);
      state = { ...state, ...parsed };
    }
  } catch(e) {}

  if (!state.manutencoes || state.manutencoes.length === 0) {
    state.manutencoes = JSON.parse(JSON.stringify(MANUTENCOES_PADRAO));
  }

  if (!state.maquinas || state.maquinas.length === 0) {
    state.maquinas = [
      { id: 1, nome: 'Torno CNC 01',   setor: 'Produção A', horas: 1240 },
      { id: 2, nome: 'Fresadora 02',    setor: 'Produção B', horas: 870  },
      { id: 3, nome: 'Compressor AR',   setor: 'Utilidades', horas: 3540 },
    ];
    state.nextMaqId = 4;
  }
}

/* ── NAVEGAÇÃO ────────────────────────────────────────────── */
const pageTitles = {
  dashboard:     'Dashboard',
  calcular:      'Calcular',
  historico:     'Histórico',
  maquinas:      'Máquinas',
  configuracoes: 'Configurações',
};

function navegarPara(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (nav) nav.classList.add('active');

  document.getElementById('pageTitle').textContent = pageTitles[pageId] || pageId;

  // Fechar sidebar mobile
  document.querySelector('.sidebar').classList.remove('open');

  renderPage(pageId);
}

function renderPage(pageId) {
  if (pageId === 'dashboard')     renderDashboard();
  if (pageId === 'maquinas')      renderMaquinas();
  if (pageId === 'historico')     renderHistorico();
  if (pageId === 'configuracoes') renderConfiguracoes();
  if (pageId === 'calcular')      renderCalcSelect();
}

/* ── DASHBOARD ────────────────────────────────────────────── */
function renderDashboard() {
  const todos = gerarTodosAlertas();

  const criticos = todos.filter(a => a.status === 'urgent').length;
  const atencao  = todos.filter(a => a.status === 'warn').length;
  const regulares = todos.filter(a => a.status === 'ok').length;
  const totalMaq = state.maquinas.length;
  const totalDiag = state.historico.length;

  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Máquinas</div>
      <div class="kpi-value">${totalMaq}</div>
      <div class="kpi-sub">cadastradas no sistema</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Alertas críticos</div>
      <div class="kpi-value" style="color: ${criticos > 0 ? 'var(--c-danger)' : 'var(--c-text)'}">${criticos}</div>
      <div class="kpi-sub">manutenções vencidas</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Em atenção</div>
      <div class="kpi-value" style="color: ${atencao > 0 ? 'var(--c-warn)' : 'var(--c-text)'}">${atencao}</div>
      <div class="kpi-sub">manutenções próximas</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Diagnósticos</div>
      <div class="kpi-value">${totalDiag}</div>
      <div class="kpi-sub">realizados no histórico</div>
    </div>
  `;

  const alertList = document.getElementById('alertList');
  const alertas = todos.filter(a => a.status !== 'ok').slice(0, 6);

  if (alertas.length === 0) {
    alertList.innerHTML = `<div class="alert-item ok">
      <div class="alert-dot ok"></div>
      <div class="alert-body">
        <div class="alert-tipo">Tudo em dia</div>
        <div class="alert-meta">Nenhuma manutenção crítica ou em atenção no momento.</div>
      </div>
      <div class="pill ok">OK</div>
    </div>`;
  } else {
    alertList.innerHTML = alertas.map(a => `
      <div class="alert-item ${a.status}">
        <div class="alert-dot ${a.status}"></div>
        <div class="alert-body">
          <div class="alert-tipo">${a.tipo} — ${a.maqNome}</div>
          <div class="alert-meta">Próxima em ${fmtNum(a.proximaCiclo)}h · restam ${fmtNum(a.restante)}h (${a.maqSetor})</div>
        </div>
        <div class="pill ${a.status}">${a.label}</div>
      </div>
    `).join('');
  }

  const machineGrid = document.getElementById('machineGrid');
  if (state.maquinas.length === 0) {
    machineGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg></div>
      <div class="empty-text">Nenhuma máquina cadastrada</div>
      <div class="empty-sub">Acesse Máquinas para cadastrar.</div>
    </div>`;
  } else {
    machineGrid.innerHTML = state.maquinas.map(m => {
      const alertasMaq = gerarAlertas(m.horas);
      const criticosMaq = alertasMaq.filter(a => a.status === 'urgent').length;
      const atencaoMaq  = alertasMaq.filter(a => a.status === 'warn').length;
      let statusCor = 'var(--c-ok)';
      let statusTxt = 'Regular';
      if (criticosMaq > 0) { statusCor = 'var(--c-danger)'; statusTxt = `${criticosMaq} crítico${criticosMaq > 1 ? 's' : ''}`; }
      else if (atencaoMaq > 0) { statusCor = 'var(--c-warn)'; statusTxt = `${atencaoMaq} atenção`; }

      return `<div class="machine-card" onclick="abrirCalcMaquina(${m.id})">
        <div class="machine-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="16" height="16">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>
        <div class="machine-name">${escHtml(m.nome)}</div>
        <div class="machine-setor">${escHtml(m.setor)}</div>
        <div class="machine-horas">${fmtNum(m.horas)}h · <span style="color:${statusCor}">${statusTxt}</span></div>
      </div>`;
    }).join('');
  }
}

/* ── CALCULAR ─────────────────────────────────────────────── */
function renderCalcSelect() {
  const sel = document.getElementById('calcMaquina');
  sel.innerHTML = '<option value="">— Selecione —</option>' +
    state.maquinas.map(m => `<option value="${m.id}">${escHtml(m.nome)} (${fmtNum(m.horas)}h)</option>`).join('');
}

function abrirCalcMaquina(id) {
  navegarPara('calcular');
  setTimeout(() => {
    const maq = state.maquinas.find(m => m.id === id);
    if (!maq) return;
    document.getElementById('calcMaquina').value = id;
    document.getElementById('horasInput').value = maq.horas;
  }, 50);
}

document.addEventListener('change', e => {
  if (e.target.id === 'calcMaquina') {
    const maq = state.maquinas.find(m => m.id === parseInt(e.target.value));
    if (maq) document.getElementById('horasInput').value = maq.horas;
  }
});

function calcular() {
  const horasRaw = document.getElementById('horasInput').value;
  const horas = parseFloat(horasRaw);
  const maqId = parseInt(document.getElementById('calcMaquina').value) || null;
  const maq   = state.maquinas.find(m => m.id === maqId);

  if (isNaN(horas) || horas < 0) {
    mostrarToast('Insira um valor válido de horas.');
    return;
  }

  const resultados = gerarAlertas(horas);
  const criticos   = resultados.filter(r => r.status === 'urgent').length;
  const atencao    = resultados.filter(r => r.status === 'warn').length;
  const regulares  = resultados.filter(r => r.status === 'ok').length;
  const proxima    = Math.min(...resultados.map(r => r.restante));

  // Salvar no histórico
  const registro = {
    id:        state.nextHistId++,
    maqNome:   maq ? maq.nome : 'Manual',
    maqId:     maq ? maq.id : null,
    horas,
    criticos,
    atencao,
    regulares,
    data:      new Date().toLocaleString('pt-BR'),
    resultados,
  };

  state.historico.unshift(registro);
  if (state.historico.length > 100) state.historico.pop();

  // Atualizar horas da máquina
  if (maq) {
    maq.horas = horas;
  }

  salvarState();

  // Summary
  const summaryCard = document.getElementById('calcSummaryCard');
  const summary     = document.getElementById('calcSummary');

  summary.innerHTML = `
    <div class="sum-row"><span>Hodômetro</span><span>${fmtNum(horas)}h</span></div>
    <div class="sum-row"><span>Próxima ação</span><span>+${proxima}h</span></div>
    <div class="sum-row"><span>Críticos</span><span style="color: var(--c-danger)">${criticos}</span></div>
    <div class="sum-row"><span>Em atenção</span><span style="color: var(--c-warn)">${atencao}</span></div>
    <div class="sum-row"><span>Regulares</span><span style="color: var(--c-ok)">${regulares}</span></div>
  `;

  summaryCard.style.display = 'block';

  // Timeline
  const resultDiv = document.getElementById('calcResultado');
  resultDiv.innerHTML = `
    <div class="card">
      <div class="card-label">Diagnóstico completo — ${fmtNum(horas)}h</div>
      <div class="timeline">
        ${resultados
          .sort((a,b) => a.restante - b.restante)
          .map((r, i) => {
            const pct = Math.min(100, Math.max(3, ((r.intervalo - r.restante) / r.intervalo) * 100));
            return `
              <div class="tl-item" style="animation-delay:${i * 0.04}s">
                <div class="tl-rank">${i + 1}</div>
                <div class="tl-dot ${r.status}"></div>
                <div class="tl-body">
                  <div class="tl-tipo">${escHtml(r.tipo)}</div>
                  <div class="tl-desc">${escHtml(r.descricao)}</div>
                  <div class="tl-horas">Próxima em ${fmtNum(r.proximaCiclo)}h · restam ${fmtNum(r.restante)}h</div>
                  <div class="progress-bar-wrap">
                    <div class="progress-bar ${r.status}" style="width:${pct}%"></div>
                  </div>
                </div>
                <div class="pill ${r.status}">${r.label}</div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;

  mostrarToast('Diagnóstico concluído com sucesso.');
}

/* ── GERAR ALERTAS ────────────────────────────────────────── */
function gerarAlertas(horas) {
  return state.manutencoes.map(m => {
    const proximaCiclo = Math.ceil(horas / m.intervalo) * m.intervalo;
    const restante     = proximaCiclo - horas;
    const pct          = restante / m.intervalo;

    let status, label;
    if (restante === 0)       { status = 'urgent'; label = 'Agora';   }
    else if (pct <= 0.10)     { status = 'urgent'; label = 'Crítico'; }
    else if (pct <= 0.25)     { status = 'warn';   label = 'Atenção'; }
    else                      { status = 'ok';     label = 'Regular'; }

    return { ...m, proximaCiclo, restante, status, label };
  });
}

function gerarTodosAlertas() {
  const lista = [];
  state.maquinas.forEach(maq => {
    gerarAlertas(maq.horas).forEach(a => {
      lista.push({ ...a, maqNome: maq.nome, maqSetor: maq.setor, maqId: maq.id });
    });
  });
  return lista.sort((a,b) => a.restante - b.restante);
}

/* ── HISTÓRICO ────────────────────────────────────────────── */
function renderHistorico() {
  const div = document.getElementById('historicoList');

  if (state.historico.length === 0) {
    div.innerHTML = `<div class="empty-state">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div class="empty-text">Nenhum diagnóstico no histórico.</div>
      <div class="empty-sub">Após calcular, os registros aparecerão aqui.</div>
    </div>`;
    return;
  }

  div.innerHTML = state.historico.map(h => `
    <div class="hist-item">
      <div class="hist-num">${h.id}</div>
      <div class="hist-body">
        <div class="hist-maq">${escHtml(h.maqNome)}</div>
        <div class="hist-meta">${fmtNum(h.horas)}h · ${h.data}</div>
        <div class="hist-pills">
          ${h.criticos > 0  ? `<div class="pill urgent">${h.criticos} crítico${h.criticos > 1 ? 's' : ''}</div>` : ''}
          ${h.atencao  > 0  ? `<div class="pill warn">${h.atencao} atenção</div>` : ''}
          ${h.regulares > 0 ? `<div class="pill ok">${h.regulares} regular${h.regulares > 1 ? 's' : ''}</div>` : ''}
        </div>
      </div>
      <button class="btn-icon" onclick="removerHistorico(${h.id})" title="Remover">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function removerHistorico(id) {
  state.historico = state.historico.filter(h => h.id !== id);
  salvarState();
  renderHistorico();
  mostrarToast('Registro removido.');
}

function limparHistorico() {
  if (!confirm('Deseja remover todos os diagnósticos do histórico?')) return;
  state.historico = [];
  salvarState();
  renderHistorico();
  mostrarToast('Histórico limpo.');
}

/* ── MÁQUINAS ─────────────────────────────────────────────── */
function renderMaquinas() {
  const tbody = document.getElementById('maquinasBody');

  if (state.maquinas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--c-text-2)">Nenhuma máquina cadastrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.maquinas.map(m => `
    <tr>
      <td class="mono">#${m.id}</td>
      <td><strong>${escHtml(m.nome)}</strong></td>
      <td>${escHtml(m.setor)}</td>
      <td class="mono">${fmtNum(m.horas)}h</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn-icon" onclick="editarMaquina(${m.id})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="abrirCalcMaquina(${m.id})" title="Calcular">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </button>
          <button class="btn-icon" onclick="excluirMaquina(${m.id})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="14" height="14">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function abrirModalMaquina() {
  document.getElementById('modalTitle').textContent = 'Nova Máquina';
  document.getElementById('maqId').value    = '';
  document.getElementById('maqNome').value  = '';
  document.getElementById('maqSetor').value = '';
  document.getElementById('maqHoras').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function editarMaquina(id) {
  const m = state.maquinas.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modalTitle').textContent = 'Editar Máquina';
  document.getElementById('maqId').value    = m.id;
  document.getElementById('maqNome').value  = m.nome;
  document.getElementById('maqSetor').value = m.setor;
  document.getElementById('maqHoras').value = m.horas;
  document.getElementById('modalOverlay').classList.add('open');
}

function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function salvarMaquina() {
  const id    = parseInt(document.getElementById('maqId').value) || null;
  const nome  = document.getElementById('maqNome').value.trim();
  const setor = document.getElementById('maqSetor').value.trim();
  const horas = parseFloat(document.getElementById('maqHoras').value);

  if (!nome)           { mostrarToast('Informe o nome da máquina.'); return; }
  if (!setor)          { mostrarToast('Informe o setor.'); return; }
  if (isNaN(horas) || horas < 0) { mostrarToast('Informe um valor válido de horas.'); return; }

  if (id) {
    const m = state.maquinas.find(x => x.id === id);
    if (m) { m.nome = nome; m.setor = setor; m.horas = horas; }
    mostrarToast('Máquina atualizada.');
  } else {
    state.maquinas.push({ id: state.nextMaqId++, nome, setor, horas });
    mostrarToast('Máquina cadastrada.');
  }

  salvarState();
  fecharModal();
  renderMaquinas();
}

function excluirMaquina(id) {
  if (!confirm('Excluir esta máquina?')) return;
  state.maquinas = state.maquinas.filter(m => m.id !== id);
  salvarState();
  renderMaquinas();
  mostrarToast('Máquina excluída.');
}

/* ── CONFIGURAÇÕES ────────────────────────────────────────── */
function renderConfiguracoes() {
  const grid = document.getElementById('configGrid');
  grid.innerHTML = state.manutencoes.map(m => `
    <div class="config-card">
      <div class="config-card-label">${escHtml(m.tipo)}</div>
      <div class="config-card-desc">${escHtml(m.descricao)}</div>
      <div class="config-input-row">
        <input class="config-input" type="number" min="10" step="10"
          value="${m.intervalo}"
          onchange="atualizarIntervalo('${m.id}', this.value)"
          onblur="atualizarIntervalo('${m.id}', this.value)">
        <span class="config-unit">h</span>
      </div>
    </div>
  `).join('');
}

function atualizarIntervalo(id, val) {
  const n = parseInt(val);
  if (isNaN(n) || n < 10) return;
  const m = state.manutencoes.find(x => x.id === id);
  if (m) { m.intervalo = n; salvarState(); mostrarToast('Intervalo atualizado.'); }
}

function restaurarPadroes() {
  if (!confirm('Restaurar todos os intervalos para os valores padrão?')) return;
  state.manutencoes = JSON.parse(JSON.stringify(MANUTENCOES_PADRAO));
  salvarState();
  renderConfiguracoes();
  mostrarToast('Intervalos restaurados.');
}

function exportarDados() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `scm_dados_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast('Dados exportados.');
}

/* ── TEMA ─────────────────────────────────────────────────── */
function aplicarTema(tema) {
  state.tema = tema;
  document.documentElement.setAttribute('data-theme', tema);
  salvarState();
}

document.getElementById('themeToggle').addEventListener('click', () => {
  aplicarTema(state.tema === 'dark' ? 'light' : 'dark');
});

/* ── DATA TOPBAR ──────────────────────────────────────────── */
function atualizarData() {
  const agora = new Date();
  const opts  = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('topbarDate').textContent = agora.toLocaleDateString('pt-BR', opts);
}

/* ── TOAST ────────────────────────────────────────────────── */
let toastTimer;
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── MOBILE SIDEBAR ───────────────────────────────────────── */
document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

/* ── HELPERS ──────────────────────────────────────────────── */
function fmtNum(n) {
  return Number(n).toLocaleString('pt-BR');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── INIT ─────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navegarPara(item.dataset.page);
  });
});

carregarState();
aplicarTema(state.tema || 'light');
atualizarData();
setInterval(atualizarData, 30000);
navegarPara('dashboard');
