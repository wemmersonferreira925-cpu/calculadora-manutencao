/* ============================================================
   HEAVYTRACK — Controle de Manutenção de Máquinas Pesadas
   script.js (Revisado e Otimizado)
   ============================================================ */

/* ── MANUTENÇÕES PADRÃO (máquinas pesadas) ────────────────── */
const MANUTENCOES_PADRAO = [
  // ── MOTOR ────────────────────────────────────────────────
  { id: 'mp01', grupo: 'Motor', tipo: 'Troca de óleo do motor + filtros', descricao: 'Óleo SAE recomendado + filtro de óleo e separador de água', intervalo: 250 },
  { id: 'mp02', grupo: 'Motor', tipo: 'Filtro de ar primário e secundário', descricao: 'Verificação e substituição do elemento filtrante de ar', intervalo: 500 },
  { id: 'mp03', grupo: 'Motor', tipo: 'Correia do motor e tensores', descricao: 'Inspeção de desgaste e tensão; substituição se necessário', intervalo: 1000 },
  { id: 'mp04', grupo: 'Motor', tipo: 'Líquido de arrefecimento (coolant)', descricao: 'Verificação de concentração e troca do líquido refrigerante', intervalo: 2000 },
  { id: 'mp05', grupo: 'Motor', tipo: 'Ajuste de válvulas', descricao: 'Regulagem de folga entre válvulas conforme especificação OEM', intervalo: 2000 },
  // ── SISTEMA HIDRÁULICO ───────────────────────────────────
  { id: 'mp06', grupo: 'Hidráulico', tipo: 'Filtro retorno hidráulico', descricao: 'Troca do filtro de retorno do circuito hidráulico principal', intervalo: 500 },
  { id: 'mp07', grupo: 'Hidráulico', tipo: 'Análise do óleo hidráulico', descricao: 'Coleta de amostra e análise laboratorial do fluido hidráulico', intervalo: 1000 },
  { id: 'mp08', grupo: 'Hidráulico', tipo: 'Troca do óleo hidráulico + filtros', descricao: 'Substituição completa do fluido e filtros de alta pressão', intervalo: 2000 },
  { id: 'mp09', grupo: 'Hidráulico', tipo: 'Vedações e mangueiras hidráulicas', descricao: 'Inspeção geral de mangueiras, conexões e vedações; reaperto', intervalo: 1000 },
  // ── TREM DE FORÇA / TRANSMISSÃO ──────────────────────────
  { id: 'mp10', grupo: 'Transmissão', tipo: 'Óleo da transmissão / caixa de câmbio', descricao: 'Troca do fluido de transmissão powershift / torque converter', intervalo: 1000 },
  { id: 'mp11', grupo: 'Transmissão', tipo: 'Óleo diferencial / eixos', descricao: 'Substituição do óleo nos diferenciais e eixos traseiro/diant.', intervalo: 2000 },
  { id: 'mp12', grupo: 'Transmissão', tipo: 'Filtros da transmissão', descricao: 'Troca do filtro de sucção e pressão da transmissão', intervalo: 1000 },
  // ── TREM DE ROLAMENTO ─────────────────────────────────────
  { id: 'mp13', grupo: 'Trem de Rolamento', tipo: 'Lubrificação dos roletes e rolos guia', descricao: 'Graxagem dos roletes de suporte, rolos guia e roda motriz', intervalo: 250 },
  { id: 'mp14', grupo: 'Trem de Rolamento', tipo: 'Tensão e folga da esteira', descricao: 'Verificação e ajuste da tensão da esteira com graxeiro', intervalo: 500 },
  { id: 'mp15', grupo: 'Trem de Rolamento', tipo: 'Inspeção pinos e buchas da esteira', descricao: 'Medição de desgaste de pinos, buchas e sapatas', intervalo: 2000 },
  // ── FREIOS ────────────────────────────────────────────────
  { id: 'mp16', grupo: 'Freios', tipo: 'Regulagem e inspeção dos freios', descricao: 'Freio de serviço e de estacionamento; desgaste de discos/lonas', intervalo: 500 },
  { id: 'mp17', grupo: 'Freios', tipo: 'Fluido de freio (quando aplicável)', descricao: 'Verificação do nível e troca do fluido nos circuitos de freio', intervalo: 1000 },
  // ── IMPLEMENTOS / ESTRUTURA ───────────────────────────────
  { id: 'mp18', grupo: 'Implementos', tipo: 'Graxagem de pinos e articulações', descricao: 'Lubrificação de todos os pinos da lança, braço e caçamba', intervalo: 50 },
  { id: 'mp19', grupo: 'Implementos', tipo: 'Inspeção estrutural de solda', descricao: 'Verificação de trincas, fissuras e deformações na estrutura', intervalo: 2000 },
  { id: 'mp20', grupo: 'Implementos', tipo: 'Desgaste de dentes e lâminas', descricao: 'Medição e substituição de dentes, chanfros e lâmina de corte', intervalo: 1000 },
  // ── ELÉTRICA / ELETRÔNICA ────────────────────────────────
  { id: 'mp21', grupo: 'Elétrico', tipo: 'Bateria e sistema de carga', descricao: 'Teste de carga, densidade do eletrólito e limpeza dos terminais', intervalo: 500 },
  { id: 'mp22', grupo: 'Elétrico', tipo: 'Sensores e módulos eletrônicos', descricao: 'Leitura de falhas ativas, atualização de firmware e calibrações', intervalo: 1000 },
  // ── REVISÃO GERAL ─────────────────────────────────────────
  { id: 'mp23', grupo: 'Revisão', tipo: 'Revisão geral / Major Overhaul', descricao: 'Revisão completa de todos os sistemas com inspeção OEM', intervalo: 6000 },
];

/* ── ESTADO ───────────────────────────────────────────────── */
let S = {
  frota:      [],
  historico:  [],
  mants:      [],
  nextId:     1,
  nextHistId: 1,
};

/* ── ÍCONES POR TIPO ──────────────────────────────────────── */
const TIPO_ICON = {
  'Escavadeira Hidráulica':   '⛏',
  'Motoniveladora':           '🚜',
  'Trator de Esteiras':       '🚛',
  'Pá-Carregadeira':          '🏗',
  'Retroescavadeira':         '🔧',
  'Compactador / Rolo':       '⚙',
  'Guindaste Sobre Esteiras': '🏚',
  'Perfuratriz':              '⛏',
  'Britador Móvel':           '💥',
  'Caminhão Fora de Estrada': '🚚',
  'Caminhão Articulado':      '🚚',
  'Scraper':                  '🚧',
};

function tipoIcon(t) { return TIPO_ICON[t] || '⚙'; }

/* ── PERSISTÊNCIA (Local Storage) ─────────────────────────── */
function save() {
  try { localStorage.setItem('ht_state', JSON.stringify(S)); } catch(e) { console.error("Erro ao salvar dados:", e); }
}

function load() {
  try {
    const raw = localStorage.getItem('ht_state');
    if (raw) S = { ...S, ...JSON.parse(raw) };
  } catch(e) { console.error("Erro ao carregar dados:", e); }
  
  if (!S.mants || S.mants.length === 0) {
    S.mants = JSON.parse(JSON.stringify(MANUTENCOES_PADRAO));
  }
  if (!S.frota || S.frota.length === 0) seedFrota();
}

function seedFrota() {
  S.frota = [
    { id:1, nome:'320D2 GC', tipo:'Escavadeira Hidráulica', fab:'Caterpillar', serie:'CAT0320DAAABX04892', tag:'ESCA-001', horas:4850, obra:'Mineração Serra Norte — Pará', obs:'' },
    { id:2, nome:'PC210-11',  tipo:'Escavadeira Hidráulica', fab:'Komatsu',    serie:'KMTPC210M0023881',   tag:'ESCA-002', horas:2370, obra:'Rodovia BR-163 — Lote 04',    obs:'' },
    { id:3, nome:'GD655-7',   tipo:'Motoniveladora',         fab:'Komatsu',    serie:'KMTGD6550071209',    tag:'MOTO-001', horas:6120, obra:'Aeroporto de Altamira',       obs:'Motor passa por análise de óleo periódica.' },
    { id:4, nome:'XE370C',    tipo:'Escavadeira Hidráulica', fab:'XCMG',       serie:'XCMGXE370C00091234', tag:'ESCA-003', horas:1840, obra:'Usina Solar — Bahia',         obs:'' },
    { id:5, nome:'D6T XW',    tipo:'Trator de Esteiras',     fab:'Caterpillar',serie:'CAT00D6TPJGA03301',  tag:'TRAT-001', horas:9340, obra:'Terraplanagem Zona Oeste',    obs:'Esteiras próximas do limite de desgaste.' },
  ];
  S.nextId = 6;
}

/* ── LÓGICA DE ALERTAS E MANUTENÇÃO ───────────────────────── */
function gerarAlertas(horas) {
  return S.mants.map(m => {
    // Calcula o próximo múltiplo do intervalo baseado nas horas atuais
    const prox = Math.ceil((horas === 0 ? 1 : horas) / m.intervalo) * m.intervalo;
    const rest = prox - horas;
    const pct  = rest / m.intervalo;
    let status, label;

    if (rest <= 0)        { status = 'urgent'; label = 'VENCIDO';  }
    else if (pct <= 0.08) { status = 'urgent'; label = 'CRÍTICO';  }
    else if (pct <= 0.20) { status = 'warn';   label = 'ATENÇÃO';  }
    else                  { status = 'ok';     label = 'REGULAR';  }

    return { ...m, prox, rest, status, label };
  });
}

function todosAlertas() {
  const lista = [];
  S.frota.forEach(eq => {
    gerarAlertas(eq.horas).forEach(a => {
      // Ignora alertas "OK" para não encher a memória se a frota for muito grande
      if(a.status !== 'ok') {
        lista.push({ ...a, eqNome: eq.nome, eqTag: eq.tag, eqTipo: eq.tipo, eqId: eq.id });
      }
    });
  });
  return lista.sort((a,b) => a.rest - b.rest);
}

/* ── DASHBOARD ────────────────────────────────────────────── */
function renderDashboard() {
  const alertasAtivos = todosAlertas();
  const criticos = alertasAtivos.filter(a => a.status === 'urgent').length;
  const atencao  = alertasAtivos.filter(a => a.status === 'warn').length;
  const total    = S.frota.length;
  const diags    = S.historico.length;

  // Atualiza Health badge
  const hb = document.getElementById('healthBadge');
  if (criticos > 0) {
    hb.textContent = `${criticos} CRÍTICO${criticos>1?'S':''}`;
    hb.className = 'health-badge urgent';
  } else if (atencao > 0) {
    hb.textContent = `${atencao} ATENÇÃO`;
    hb.className = 'health-badge warn';
  } else {
    hb.textContent = 'FROTA OK';
    hb.className = 'health-badge ok';
  }

  // Atualiza Top badge
  const tb = document.getElementById('topBadge');
  if (criticos > 0) {
    tb.textContent = criticos + ' CRÍTICO' + (criticos>1?'S':'');
    tb.style.display = 'block';
  } else {
    tb.style.display = 'none';
  }

  // Renderiza KPIs
  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi ${total===0?'neutral':'info'}">
      <div class="kpi-label">EQUIPAMENTOS</div>
      <div class="kpi-value">${total}</div>
      <div class="kpi-sub">na frota ativa</div>
    </div>
    <div class="kpi ${criticos>0?'urgent':'neutral'}">
      <div class="kpi-label">CRÍTICOS</div>
      <div class="kpi-value" style="color:${criticos>0?'var(--red)':'inherit'}">${criticos}</div>
      <div class="kpi-sub">manutenções vencidas/urgentes</div>
    </div>
    <div class="kpi ${atencao>0?'warn':'neutral'}">
      <div class="kpi-label">EM ATENÇÃO</div>
      <div class="kpi-value" style="color:${atencao>0?'var(--amber)':'inherit'}">${atencao}</div>
      <div class="kpi-sub">manutenções próximas</div>
    </div>
    <div class="kpi neutral">
      <div class="kpi-label">DIAGNÓSTICOS</div>
      <div class="kpi-value">${diags}</div>
      <div class="kpi-sub">realizados no histórico</div>
    </div>
  `;

  // Renderiza Lista de Alertas
  const alertDiv = document.getElementById('dashAlertas');
  const exibirAlertas = alertasAtivos.slice(0, 8); // Mostra apenas os 8 piores
  
  if (exibirAlertas.length === 0) {
    alertDiv.innerHTML = `<div class="alert-item ok">
      <div class="alert-dot ok"></div>
      <div class="alert-body">
        <div class="alert-tipo">Todos os equipamentos em dia</div>
        <div class="alert-meta">Nenhuma manutenção crítica ou em atenção.</div>
      </div>
      <div class="pill ok">OK</div>
    </div>`;
  } else {
    alertDiv.innerHTML = exibirAlertas.map(a => `
      <div class="alert-item ${a.status}">
        <div class="alert-dot ${a.status}"></div>
        <div class="alert-body">
          <div class="alert-tipo">${esc(a.tipo)}</div>
          <div class="alert-meta">${esc(a.eqTag)} · ${esc(a.eqNome)} · faltam ${fmt(a.rest)}h</div>
        </div>
        <div class="pill ${a.status}">${a.label}</div>
      </div>
    `).join('');
  }

  // Renderiza Frota Mini no Dashboard
  const frotaDiv = document.getElementById('dashFrota');
  if (S.frota.length === 0) {
    frotaDiv.innerHTML = `<div class="alert-item ok" style="cursor:pointer" onclick="ir('frota')">
      <div class="alert-body"><div class="alert-tipo">Nenhum equipamento cadastrado</div>
      <div class="alert-meta">Clique para ir à Frota e cadastrar</div></div>
    </div>`;
  } else {
    frotaDiv.innerHTML = S.frota.map(eq => {
      const als = gerarAlertas(eq.horas);
      const cr  = als.filter(a => a.status === 'urgent').length;
      const at  = als.filter(a => a.status === 'warn').length;
      let sc = 'var(--green)', st = 'OK';
      if (cr > 0) { sc = 'var(--red)'; st = cr+' CRIT.'; }
      else if (at > 0) { sc = 'var(--amber)'; st = at+' ATEN.'; }
      
      return `<div class="frota-mini" onclick="abrirDiagEquip(${eq.id})">
        <div class="frota-mini-icon">${tipoIcon(eq.tipo)}</div>
        <div style="flex:1;min-width:0">
          <div class="frota-mini-nome">${esc(eq.nome)} <span style="font-size:11px;color:var(--text-3);font-family:var(--font-mono)">${esc(eq.tag)}</span></div>
          <div class="frota-mini-tipo">${esc(eq.fab)} · ${esc(eq.tipo)}</div>
        </div>
        <div>
          <div class="frota-mini-h">${fmt(eq.horas)}h</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:${sc};text-align:right;margin-top:2px">${st}</div>
        </div>
      </div>`;
    }).join('');
  }
}

/* ── FROTA ────────────────────────────────────────────────── */
function renderFrota() {
  const tbody = document.getElementById('frotaBody');
  if (S.frota.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2.5rem;color:var(--text-3);font-family:var(--font-mono);font-size:12px">
      Nenhum equipamento cadastrado. Clique em "+ Novo equipamento".
    </td></tr>`;
    return;
  }

  tbody.innerHTML = S.frota.map(eq => {
    const als = gerarAlertas(eq.horas);
    const cr  = als.filter(a => a.status === 'urgent').length;
    const at  = als.filter(a => a.status === 'warn').length;
    let stHtml;
    
    if (cr > 0) stHtml = `<span class="pill urgent">${cr} CRÍTICO${cr>1?'S':''}</span>`;
    else if (at > 0) stHtml = `<span class="pill warn">${at} ATENÇÃO</span>`;
    else stHtml = `<span class="pill ok">REGULAR</span>`;

    return `<tr>
      <td><span class="tag-badge">${esc(eq.tag)||'—'}</span></td>
      <td>
        <div style="font-weight:600">${esc(eq.nome)}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px;font-family:var(--font-mono)">${esc(eq.serie)||'—'}</div>
      </td>
      <td style="font-size:12px;color:var(--text-2)">${esc(eq.tipo)}</td>
      <td><span class="fab-badge">${esc(eq.fab)}</span></td>
      <td class="mono-td">${fmt(eq.horas)}h</td>
      <td style="font-size:12px;color:var(--text-2);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(eq.obra)}">${esc(eq.obra)||'—'}</td>
      <td>${stHtml}</td>
      <td>
        <div class="tbl-actions">
          <button class="icon-btn" title="Diagnóstico" onclick="abrirDiagEquip(${eq.id})">⚙</button>
          <button class="icon-btn" title="Editar" onclick="editarEquip(${eq.id})">✎</button>
          <button class="icon-btn danger" title="Excluir" onclick="excluirEquip(${eq.id})">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── MODAL DE CADASTRO ────────────────────────────────────── */
function abrirModal() {
  document.getElementById('formEquip').reset(); // Limpa o formulário todo de uma vez
  document.getElementById('modalTitle').textContent = 'Novo Equipamento';
  document.getElementById('mId').value = '';
  document.getElementById('modalBg').classList.add('active'); // Ajustado para 'active' conforme CSS
}

function editarEquip(id) {
  const eq = S.frota.find(e => e.id === id);
  if (!eq) return;
  document.getElementById('modalTitle').textContent = 'Editar Equipamento';
  document.getElementById('mId').value    = eq.id;
  document.getElementById('mNome').value  = eq.nome;
  document.getElementById('mTipo').value  = eq.tipo;
  document.getElementById('mFab').value   = eq.fab;
  document.getElementById('mSerie').value = eq.serie;
  document.getElementById('mTag').value   = eq.tag;
  document.getElementById('mHoras').value = eq.horas;
  document.getElementById('mObra').value  = eq.obra;
  document.getElementById('mObs').value   = eq.obs;
  document.getElementById('modalBg').classList.add('active');
}

function fecharModal() {
  document.getElementById('modalBg').classList.remove('active');
}

// O event "e" vem do onsubmit no HTML. Previne o reload da página.
function salvarEquip(e) {
  if (e) e.preventDefault(); 

  const id    = parseInt(document.getElementById('mId').value) || null;
  const nome  = document.getElementById('mNome').value.trim();
  const tipo  = document.getElementById('mTipo').value;
  const fab   = document.getElementById('mFab').value;
  const serie = document.getElementById('mSerie').value.trim();
  const tag   = document.getElementById('mTag').value.trim().toUpperCase();
  const horas = parseFloat(document.getElementById('mHoras').value) || 0;
  const obra  = document.getElementById('mObra').value.trim();
  const obs   = document.getElementById('mObs').value.trim();

  // Validações de segurança extra (HTML5 required já cuida de parte disso)
  if (!nome || !tipo || !fab || !tag) { 
    toast('Preencha os campos obrigatórios.'); 
    return; 
  }

  if (id) {
    const eq = S.frota.find(e => e.id === id);
    if (eq) Object.assign(eq, { nome, tipo, fab, serie, tag, horas, obra, obs });
    toast('Equipamento atualizado.');
  } else {
    S.frota.push({ id: S.nextId++, nome, tipo, fab, serie, tag, horas, obra, obs });
    toast('Equipamento cadastrado com sucesso.');
  }

  save();
  fecharModal();
  renderFrota();
  // Se estiver no dashboard, precisa atualizar os alertas lá também
  if (document.getElementById('page-dashboard').classList.contains('active')) {
      renderDashboard();
  }
}

function excluirEquip(id) {
  const eq = S.frota.find(e => e.id === id);
  if (!eq) return;
  if (!confirm(`Excluir "${eq.nome} (${eq.tag})" da frota? Esta ação não pode ser desfeita.`)) return;
  
  S.frota = S.frota.filter(e => e.id !== id);
  save();
  renderFrota();
  toast('Equipamento removido da frota.');
}

/* ── DIAGNÓSTICO ──────────────────────────────────────────── */
function renderCalcSelect() {
  const sel = document.getElementById('diagEquip');
  sel.innerHTML = '<option value="">— Selecione o equipamento —</option>' +
    S.frota.map(eq =>
      `<option value="${eq.id}">${esc(eq.tag)} · ${esc(eq.nome)} (${fmt(eq.horas)}h)</option>`
    ).join('');
}

// Listener para quando o usuário seleciona uma máquina na tela de Diagnóstico
document.addEventListener('change', e => {
  if (e.target.id === 'diagEquip') {
    const eq = S.frota.find(x => x.id === parseInt(e.target.value));
    const box = document.getElementById('equipInfoBox');
    
    if (eq) {
      document.getElementById('diagHoras').value = eq.horas;
      document.getElementById('equipInfo').innerHTML = `
        <div class="eir"><span class="eir-k">Modelo</span><span class="eir-v">${esc(eq.nome)}</span></div>
        <div class="eir"><span class="eir-k">Tipo</span><span class="eir-v">${esc(eq.tipo)}</span></div>
        <div class="eir"><span class="eir-k">Fabricante</span><span class="eir-v">${esc(eq.fab)}</span></div>
        <div class="eir"><span class="eir-k">Série</span><span class="eir-v">${esc(eq.serie||'—')}</span></div>
        <div class="eir"><span class="eir-k">Obra / Local</span><span class="eir-v">${esc(eq.obra||'—')}</span></div>
        ${eq.obs ? `<div style="margin-top:8px;padding:6px 8px;background:var(--amber-bg);border-radius:5px;border:1px solid var(--amber-border);font-size:11px;color:var(--amber)">${esc(eq.obs)}</div>` : ''}
      `;
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
      document.getElementById('diagHoras').value = '';
    }
  }
});

function abrirDiagEquip(id) {
  ir('calcular');
  setTimeout(() => {
    document.getElementById('diagEquip').value = id;
    document.getElementById('diagEquip').dispatchEvent(new Event('change'));
  }, 50);
}

function calcular() {
  const horasVal = document.getElementById('diagHoras').value;
  const horas    = parseFloat(horasVal);
  const eqId     = parseInt(document.getElementById('diagEquip').value) || null;
  const eq       = S.frota.find(e => e.id === eqId);

  if (!eq) { toast('Selecione um equipamento primeiro.'); return; }
  if (isNaN(horas) || horas < 0) { toast('Informe um valor de horímetro válido.'); return; }

  const resultados = gerarAlertas(horas).sort((a,b) => a.rest - b.rest);
  const criticos   = resultados.filter(r => r.status === 'urgent').length;
  const atencao    = resultados.filter(r => r.status === 'warn').length;
  const regulares  = resultados.filter(r => r.status === 'ok').length;
  const proxima    = Math.min(...resultados.map(r => r.rest));

  // Atualiza as horas na frota e salva
  eq.horas = horas;

  // Salva no histórico
  const reg = {
    id:        S.nextHistId++,
    eqNome:    eq.nome,
    eqTag:     eq.tag,
    eqId:      eq.id,
    horas,
    criticos,
    atencao,
    regulares,
    data:      new Date().toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
  };

  S.historico.unshift(reg);
  if (S.historico.length > 200) S.historico.pop(); // Mantém só os últimos 200 históricos
  save();

  // Renderiza Resumo Lateral
  const sumBox = document.getElementById('diagSumBox');
  const sumDiv = document.getElementById('diagSum');
  sumDiv.innerHTML = `
    <div class="sum-row"><span>Horímetro atual</span><span>${fmt(horas)}h</span></div>
    <div class="sum-row"><span>Próxima ação em</span><span>+${fmt(proxima)}h</span></div>
    <div class="sum-row"><span>Críticos / Vencidos</span><span style="color:var(--red)">${criticos}</span></div>
    <div class="sum-row"><span>Atenção (Próximos)</span><span style="color:var(--amber)">${atencao}</span></div>
    <div class="sum-row"><span>Itens Regulares</span><span style="color:var(--green)">${regulares}</span></div>
  `;
  sumBox.style.display = 'block';

  // Agrupa Resultados por Categoria (Motor, Hidráulico, etc)
  const grupos = {};
  resultados.forEach(r => {
    if (!grupos[r.grupo]) grupos[r.grupo] = [];
    grupos[r.grupo].push(r);
  });

  const eqNome = `${eq.tag} · ${eq.nome}`;
  const eqFab  = eq.fab;

  let tlHtml = '';
  let idx = 0;
  
  Object.entries(grupos).forEach(([grp, items]) => {
    tlHtml += `<div style="padding:8px 1.25rem;background:var(--bg-3);border-bottom:1px solid var(--border);font-family:var(--font-cond);font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--text-3)">${grp.toUpperCase()}</div>`;
    
    items.forEach(r => {
      idx++;
      const pct = Math.min(100, Math.max(2, ((r.intervalo - r.rest) / r.intervalo) * 100));
      tlHtml += `
        <div class="tl-item" style="animation-delay:${idx * 0.03}s">
          <div class="tl-num">${idx}</div>
          <div class="tl-dot ${r.status}"></div>
          <div class="tl-body">
            <div class="tl-tipo">${esc(r.tipo)}</div>
            <div class="tl-desc">${esc(r.descricao)}</div>
            <div class="tl-horas">Ciclo: ${fmt(r.intervalo)}h · Fazer com: ${fmt(r.prox)}h · Restam: ${fmt(r.rest)}h</div>
            <div class="tl-bar-wrap">
              <div class="tl-bar ${r.status}" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="pill ${r.status}">${r.label}</div>
        </div>
      `;
    });
  });

  // Renderiza no painel principal
  document.getElementById('diagResult').innerHTML = `
    <div class="diag-result-header">
      <div>
        <div class="drh-equip">${esc(eqNome)}</div>
        <div class="drh-horas">${esc(eqFab)} · Horímetro atualizado: ${fmt(horas)}h</div>
      </div>
      <div class="pill ${criticos>0?'urgent':atencao>0?'warn':'ok'}">
        ${criticos>0?criticos+' CRÍTICO'+(criticos>1?'S':''):atencao>0?atencao+' ATENÇÃO':'FROTA OK'}
      </div>
    </div>
    <div class="tl">${tlHtml}</div>
  `;

  toast('Diagnóstico gerado e salvo!');
}

/* ── HISTÓRICO ────────────────────────────────────────────── */
function renderHistorico() {
  const div = document.getElementById('histList');
  if (S.historico.length === 0) {
    div.innerHTML = `<div class="empty-st">
      <div class="empty-ring"></div>
      <div class="empty-title">Nenhum diagnóstico registrado</div>
      <div class="empty-sub">Realize um diagnóstico em uma máquina para aparecer aqui.</div>
    </div>`;
    return;
  }

  div.innerHTML = S.historico.map(h => `
    <div class="hist-item">
      <div class="hist-num">${h.id}</div>
      <div class="hist-body">
        <div class="hist-equip">${esc(h.eqTag)} · ${esc(h.eqNome)}</div>
        <div class="hist-meta">Horímetro na época: ${fmt(h.horas)}h · ${h.data}</div>
        <div class="hist-pills">
          ${h.criticos > 0  ? `<div class="pill urgent">${h.criticos} CRÍTICO${h.criticos>1?'S':''}</div>` : ''}
          ${h.atencao  > 0  ? `<div class="pill warn">${h.atencao} ATENÇÃO</div>` : ''}
          ${h.regulares > 0 ? `<div class="pill ok">${h.regulares} REGULAR${h.regulares>1?'IS':''}</div>` : ''}
        </div>
      </div>
      <button class="icon-btn danger" onclick="removerHist(${h.id})" title="Remover" style="flex-shrink:0">✕</button>
    </div>
  `).join('');
}

function removerHist(id) {
  S.historico = S.historico.filter(h => h.id !== id);
  save();
  renderHistorico();
}

function limparHistorico() {
  if (!confirm('Deseja apagar TODO o histórico de diagnósticos?')) return;
  S.historico = [];
  save();
  renderHistorico();
  toast('Histórico apagado.');
}

/* ── CONFIGURAÇÕES ────────────────────────────────────────── */
function renderConfiguracoes() {
  const grid = document.getElementById('cfgGrid');
  grid.innerHTML = S.mants.map(m => `
    <div class="cfg-card">
      <div class="cfg-card-t">${esc(m.tipo)}</div>
      <div class="cfg-card-s">${esc(m.grupo)} · ${esc(m.descricao)}</div>
      <div class="cfg-inp-row">
        <input class="cfg-inp" type="number" min="10" step="10"
          value="${m.intervalo}"
          onchange="atualizarIntervalo('${m.id}', this.value)">
        <span class="cfg-unit">h</span>
      </div>
    </div>
  `).join('');
}

function atualizarIntervalo(id, val) {
  const n = parseInt(val);
  if (isNaN(n) || n < 10) return;
  const m = S.mants.find(x => x.id === id);
  if (m) { 
    m.intervalo = n; 
    save(); 
    toast('Intervalo de horas atualizado.'); 
  }
}

function restaurar() {
  if (!confirm('Isto voltará todas as manutenções para os intervalos de fábrica originais. Continuar?')) return;
  S.mants = JSON.parse(JSON.stringify(MANUTENCOES_PADRAO));
  save();
  renderConfiguracoes();
  toast('Valores de fábrica restaurados.');
}

function exportar() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `heavytrack_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Arquivo JSON exportado para download.');
}

function resetTotal() {
  if (!confirm('Atenção mecânico: Isso irá APAGAR TODAS AS MÁQUINAS e histórico! Deseja mesmo formatar o sistema?')) return;
  localStorage.removeItem('ht_state');
  location.reload();
}

/* ── NAVEGAÇÃO ENTRE ABAS ─────────────────────────────────── */
const PAGE_TITLES = {
  dashboard:     'DASHBOARD DE CONTROLE',
  frota:         'GESTÃO DE FROTA',
  calcular:      'DIAGNÓSTICO E MANUTENÇÃO',
  historico:     'HISTÓRICO DE REVISÕES',
  configuracoes: 'CONFIGURAÇÕES DO SISTEMA',
};

function ir(pageId) {
  // Esconde todas as páginas e desmarca os botões
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Mostra a página escolhida
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.classList.add('active');

  const nb = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
  if (nb) nb.classList.add('active');

  // Muda o título na barra superior
  document.getElementById('pageTitle').textContent = PAGE_TITLES[pageId] || pageId.toUpperCase();
  
  // Fecha o menu lateral no celular se estiver aberto
  document.getElementById('sidebar').classList.remove('open');

  // Roda a função específica de renderização daquela tela
  if (pageId === 'dashboard')     renderDashboard();
  if (pageId === 'frota')         renderFrota();
  if (pageId === 'calcular')      renderCalcSelect();
  if (pageId === 'historico')     renderHistorico();
  if (pageId === 'configuracoes') renderConfiguracoes();
}

/* ── UTILITÁRIOS E RELÓGIO ────────────────────────────────── */
function atualizarRelogio() {
  const agora = new Date();
  document.getElementById('topClock').textContent = 
    agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }) + ' - ' + 
    agora.toLocaleDateString('pt-BR');
}

// Formatação de números (ex: 4850 vira 4.850)
function fmt(n) { return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 }); }

// Escape de HTML para evitar injeção de código
function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTmr;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTmr);
  toastTmr = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── INICIALIZAÇÃO E EVENTOS GERAIS ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Liga os botões do menu
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.addEventListener('click', () => ir(b.dataset.page));
  });

  // Botão hamburguer (Mobile)
  document.getElementById('ham').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Fechar Modal clicando fora dele
  document.getElementById('modalBg').addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharModal();
  });

  // Prepara o sistema
  load();
  atualizarRelogio();
  setInterval(atualizarRelogio, 60000); // Atualiza o relógio a cada minuto
  ir('dashboard'); // Tela inicial
});
