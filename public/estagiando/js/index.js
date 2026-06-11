/* ================================================================
   ESTAGIANDO v4 — index.js (home)
   ================================================================ */

let _abaAtual    = 'todas';
let _sortAtual   = 'recentes';
let _cidadeRJ    = '';
let _paginaAtual = 1;
const PAGE_SIZE  = 24;

document.addEventListener('DOMContentLoaded', async function () {
  verificarSessaoNavbar();
  mostrarSkeletons();
  mostrarStatus('Buscando vagas em tempo real…');

  try {
    await carregarVagas();
    if (!obterVagas().length) mostrarErroApi();
  } catch (e) {
    mostrarErroApi();
  }

  esconderStatus();
  atualizarStats();
  bindEventos();
  aplicarFiltros();
});

function verificarSessaoNavbar() {
  const usuario = obterUsuarioLogado();
  if (!usuario) return;
  ['link-login','m-link-login'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display='none'; });
  ['link-dashboard','m-link-dashboard','link-sair','m-link-sair'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display='block'; });
  const linkArea  = document.getElementById('link-area-usuario');
  const linkAreaM = document.getElementById('m-link-area-usuario');
  if (linkArea)  { linkArea.href  = 'pages/dashboard-estudante.html'; linkArea.textContent = '🎓 Meu Perfil'; }
  if (linkAreaM) { linkAreaM.href = 'pages/dashboard-estudante.html'; }
}

function mostrarStatus(msg) {
  const bar = document.getElementById('status-bar'); if (!bar) return;
  const m = bar.querySelector('.status-msg'); if (m) m.textContent = msg;
  bar.classList.add('visivel');
}
function esconderStatus() {
  const bar = document.getElementById('status-bar'); if (bar) bar.classList.remove('visivel');
}
function mostrarErroApi() {
  const el = document.getElementById('api-erro-banner'); if (el) el.classList.add('visivel');
}

function mostrarSkeletons() {
  const lista = document.getElementById('lista-vagas'); if (!lista) return;
  let html = '';
  for (let i = 0; i < 8; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton skel-titulo"></div>
        <div class="skeleton skel-emp"></div>
        <div class="skeleton skel-linha"></div>
        <div class="skeleton skel-linha" style="width:80%"></div>
        <div style="display:flex;gap:.5rem"><div class="skeleton skel-tag"></div><div class="skeleton skel-tag"></div></div>
        <div class="skeleton skel-btn"></div>
      </div>`;
  }
  lista.innerHTML = html;
}

function atualizarStats() {
  const vagas = obterVagas();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('stat-total',    vagas.length);
  set('stat-estagios', vagas.filter(ehEstagio).length);
  set('stat-rj',       vagas.filter(v => v.estado === 'RJ').length);
  set('stat-ti',       vagas.filter(v => v.area === 'tecnologia').length);
}

function ehEstagio(v) {
  const t = (v.titulo + ' ' + (v.descricao || '')).toLowerCase();
  return /est[áa]gi|intern(ship)?\b|trainee/.test(t);
}
function ehRemoto(v) {
  const t = (v.titulo + ' ' + (v.descricao || '') + ' ' + (v.cidade || '')).toLowerCase();
  return /remoto|home\s*office|h[íi]brido|anywhere|teletrab/.test(t);
}

function bindEventos() {
  ['filtro-busca','filtro-estado','filtro-cidade','filtro-area','filtro-tipo','filtro-remoto']
    .forEach(id => {
      const el = document.getElementById(id); if (!el) return;
      const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(evt, () => { _paginaAtual = 1; aplicarFiltros(); });
    });

  const slider = document.getElementById('filtro-salario');
  const sliderVal = document.getElementById('filtro-salario-val');
  if (slider) {
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value, 10);
      if (sliderVal) sliderVal.textContent = v === 0 ? 'Qualquer' : ('R$ ' + v.toLocaleString('pt-BR'));
      _paginaAtual = 1; aplicarFiltros();
    });
  }

  const busca = document.getElementById('filtro-busca');
  const clearBtn = document.getElementById('busca-clear');
  if (busca && clearBtn) {
    busca.addEventListener('input', () => clearBtn.classList.toggle('visivel', !!busca.value));
  }

  document.querySelectorAll('.aba-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.aba-btn').forEach(b => { b.classList.remove('ativo'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('ativo'); btn.setAttribute('aria-selected','true');
      _abaAtual = btn.dataset.aba; _paginaAtual = 1;
      aplicarFiltros();
    });
  });

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => { b.classList.remove('ativo'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('ativo'); btn.setAttribute('aria-pressed','true');
      _sortAtual = btn.dataset.sort;
      aplicarFiltros();
    });
  });
}

function _vagasFiltradas() {
  let vagas = obterVagas().slice();
  const busca  = (document.getElementById('filtro-busca')?.value || '').toLowerCase().trim();
  const estado = document.getElementById('filtro-estado')?.value || '';
  const cidade = (document.getElementById('filtro-cidade')?.value || '').toLowerCase().trim();
  const area   = document.getElementById('filtro-area')?.value || '';
  const tipo   = document.getElementById('filtro-tipo')?.value || '';
  const salMin = parseInt(document.getElementById('filtro-salario')?.value || '0', 10);
  const soRem  = document.getElementById('filtro-remoto')?.checked;

  if (_abaAtual === 'estagios') vagas = vagas.filter(ehEstagio);
  else if (_abaAtual === 'ti')  vagas = vagas.filter(v => v.area === 'tecnologia');
  else if (_abaAtual === 'rj')  vagas = vagas.filter(v => v.estado === 'RJ');
  else if (_abaAtual === 'remoto') vagas = vagas.filter(ehRemoto);

  if (_cidadeRJ) vagas = vagas.filter(v => (v.cidade||'').toLowerCase().includes(_cidadeRJ.toLowerCase()));

  if (busca)  vagas = vagas.filter(v => (v.titulo + ' ' + v.empresa + ' ' + v.cidade + ' ' + (v.descricao||'')).toLowerCase().includes(busca));
  if (estado) vagas = vagas.filter(v => v.estado === estado);
  if (cidade) vagas = vagas.filter(v => (v.cidade||'').toLowerCase().includes(cidade));
  if (area)   vagas = vagas.filter(v => v.area === area);
  if (tipo === 'estagio') vagas = vagas.filter(ehEstagio);
  else if (tipo === 'remoto') vagas = vagas.filter(ehRemoto);
  else if (tipo === 'efetivo') vagas = vagas.filter(v => !ehEstagio(v));
  if (soRem) vagas = vagas.filter(ehRemoto);
  if (salMin > 0) vagas = vagas.filter(v => (v.bolsa || 0) >= salMin);

  if (_sortAtual === 'salario') vagas.sort((a,b) => (b.bolsa||0) - (a.bolsa||0));
  else if (_sortAtual === 'relevancia' && busca) {
    vagas.sort((a,b) => (b.titulo.toLowerCase().includes(busca) ? 1 : 0) - (a.titulo.toLowerCase().includes(busca) ? 1 : 0));
  }
  return vagas;
}

function aplicarFiltros() {
  const vagas = _vagasFiltradas();
  renderizarChipsAtivos();
  atualizarContadoresAbas();
  renderizarVagas(vagas);
}

function atualizarContadoresAbas() {
  const todas = obterVagas();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('contador-todas',    todas.length);
  set('contador-estagios', todas.filter(ehEstagio).length);
  set('contador-ti',       todas.filter(v => v.area === 'tecnologia').length);
  set('contador-rj',       todas.filter(v => v.estado === 'RJ').length);
  set('contador-remoto',   todas.filter(ehRemoto).length);
}

function renderizarChipsAtivos() {
  const cont = document.getElementById('filtros-ativos'); if (!cont) return;
  const chips = [];
  const add = (label, fn) => chips.push(`<span class="chip-filtro">${label}<button onclick="${fn}" aria-label="Remover">✕</button></span>`);
  const busca  = document.getElementById('filtro-busca')?.value;
  const estado = document.getElementById('filtro-estado')?.value;
  const cidade = document.getElementById('filtro-cidade')?.value;
  const area   = document.getElementById('filtro-area')?.value;
  const tipo   = document.getElementById('filtro-tipo')?.value;
  const salMin = parseInt(document.getElementById('filtro-salario')?.value || '0', 10);
  const soRem  = document.getElementById('filtro-remoto')?.checked;

  if (busca)  add(`🔍 "${escapeHtml(busca)}"`, "limparBusca()");
  if (estado) add(`📍 ${estado}`, "document.getElementById('filtro-estado').value='';aplicarFiltros()");
  if (cidade) add(`🏙️ ${escapeHtml(cidade)}`, "document.getElementById('filtro-cidade').value='';aplicarFiltros()");
  if (area)   add(`🎯 ${labelArea(area)}`, "document.getElementById('filtro-area').value='';aplicarFiltros()");
  if (tipo)   add(`📋 ${tipo}`, "document.getElementById('filtro-tipo').value='';aplicarFiltros()");
  if (salMin) add(`💰 R$ ${salMin.toLocaleString('pt-BR')}+`, "document.getElementById('filtro-salario').value=0;document.getElementById('filtro-salario-val').textContent='Qualquer';aplicarFiltros()");
  if (soRem)  add(`🏠 Remoto`, "document.getElementById('filtro-remoto').checked=false;aplicarFiltros()");
  if (_cidadeRJ) add(`📍 ${escapeHtml(_cidadeRJ)}`, "limparFiltroRJ()");

  cont.innerHTML = chips.join('');
}

function renderizarVagas(vagas) {
  const lista    = document.getElementById('lista-vagas');
  const vazio    = document.getElementById('vagas-vazio');
  const contador = document.getElementById('contador-vagas');
  const btnMais  = document.getElementById('btn-carregar-mais');
  if (!lista) return;
  if (contador) contador.textContent = `${vagas.length} vaga${vagas.length !== 1 ? 's' : ''}`;

  if (!vagas.length) {
    lista.innerHTML = ''; lista.style.display = 'none';
    if (vazio) vazio.style.display = 'block';
    if (btnMais) btnMais.style.display = 'none';
    return;
  }
  if (vazio) vazio.style.display = 'none';
  lista.style.display = 'grid';

  const visiveis = vagas.slice(0, _paginaAtual * PAGE_SIZE);
  lista.innerHTML = visiveis.map((v, i) => criarCardVaga(v, i)).join('');
  if (btnMais) btnMais.style.display = (vagas.length > visiveis.length) ? 'inline-flex' : 'none';
}

function criarCardVaga(vaga, indice) {
  const destaqueRJ = vaga.estado === 'RJ' ? ' destaque-rj' : '';
  const bolsaHtml  = vaga.bolsa
    ? `<span class="vaga-bolsa">${formatarMoeda(vaga.bolsa)}<span>/mês</span></span>`
    : `<span class="vaga-info-item">💼 A combinar</span>`;
  return `
    <div class="card vaga-card${destaqueRJ}" style="animation-delay:${(indice % PAGE_SIZE) * 0.04}s">
      <div class="vaga-card-topo">
        <div>
          <div class="vaga-titulo">${escapeHtml(vaga.titulo)}</div>
          <div class="vaga-empresa">🏢 ${escapeHtml(vaga.empresa)}</div>
        </div>
        <span class="tag ${classTag(vaga.area)}">${labelArea(vaga.area)}</span>
      </div>
      <p class="vaga-descricao">${escapeHtml(vaga.descricao || '')}</p>
      <div class="vaga-info">
        <span class="vaga-info-item">📍 ${escapeHtml(vaga.cidade)}, ${vaga.estado}</span>
        ${ehRemoto(vaga) ? '<span class="vaga-info-item">🏠 Remoto</span>' : ''}
        ${ehEstagio(vaga) ? '<span class="vaga-info-item">🎓 Estágio</span>' : ''}
      </div>
      <div class="vaga-rodape">
        ${bolsaHtml}
        <button class="btn btn-primario btn-sm" onclick="abrirModal(${JSON.stringify(vaga.id)})">Ver vaga →</button>
      </div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function limparBusca() {
  const b = document.getElementById('filtro-busca'); if (b) b.value = '';
  const c = document.getElementById('busca-clear'); if (c) c.classList.remove('visivel');
  aplicarFiltros();
}
function limparFiltros() {
  ['filtro-busca','filtro-estado','filtro-cidade','filtro-area','filtro-tipo']
    .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const sl = document.getElementById('filtro-salario'); if (sl) sl.value = 0;
  const slv = document.getElementById('filtro-salario-val'); if (slv) slv.textContent = 'Qualquer';
  const rem = document.getElementById('filtro-remoto'); if (rem) rem.checked = false;
  const cb = document.getElementById('busca-clear'); if (cb) cb.classList.remove('visivel');
  _cidadeRJ = '';
  document.querySelectorAll('.cidade-chip.ativo').forEach(c => c.classList.remove('ativo'));
  _paginaAtual = 1;
  aplicarFiltros();
}
function filtrarCidadeRJ(cidade) {
  _cidadeRJ = (cidade === _cidadeRJ) ? '' : cidade;
  document.querySelectorAll('.cidade-chip').forEach(c => c.classList.toggle('ativo', c.dataset.cidade === _cidadeRJ));
  const tabRJ = document.querySelector('.aba-btn[data-aba="rj"]');
  if (tabRJ && _cidadeRJ) tabRJ.click();
  else aplicarFiltros();
}
function limparFiltroRJ() {
  _cidadeRJ = '';
  document.querySelectorAll('.cidade-chip.ativo').forEach(c => c.classList.remove('ativo'));
  aplicarFiltros();
}
function carregarMais() {
  _paginaAtual++;
  renderizarVagas(_vagasFiltradas());
}

function abrirModal(idVaga) {
  const vaga = obterVagas().find(v => v.id == idVaga); if (!vaga) return;
  const usuario = obterUsuarioLogado();
  const bolsaHtml = vaga.bolsa
    ? `<div><div style="font-size:.78rem;font-weight:700;color:var(--texto-secundario);margin-bottom:.2rem">BOLSA MENSAL</div><div class="modal-destaque-bolsa">${formatarMoeda(vaga.bolsa)}</div></div>`
    : `<div><div style="font-size:.78rem;font-weight:700;color:var(--texto-secundario)">REMUNERAÇÃO</div><div class="modal-destaque-bolsa">A combinar</div></div>`;

  document.getElementById('modal-conteudo').innerHTML = `
    <span class="tag ${classTag(vaga.area)}" style="margin-bottom:.6rem">${labelArea(vaga.area)}</span>
    <h2 class="modal-titulo">${escapeHtml(vaga.titulo)}</h2>
    <p class="modal-empresa">🏢 ${escapeHtml(vaga.empresa)} · 📍 ${escapeHtml(vaga.cidade)}, ${vaga.estado}</p>
    <div class="modal-destaque">
      ${bolsaHtml}
      <div style="text-align:right">
        <div style="font-size:.78rem;font-weight:700;color:var(--texto-secundario);margin-bottom:.2rem">CARGA</div>
        <div style="font-weight:700;font-size:1rem">⏱ ${vaga.cargaHoraria}</div>
      </div>
    </div>
    <div class="divisor"></div>
    <div class="modal-secao">
      <div class="modal-secao-titulo">Sobre a vaga</div>
      <p>${escapeHtml(vaga.descricao || '')}</p>
    </div>
    <div class="candidatura-form">
      ${usuario ? `
        <h3>🚀 Candidate-se diretamente com a empresa</h3>
        <p style="color:var(--texto-secundario);font-size:.88rem;margin:.4rem 0 1rem">O processo é conduzido pela própria empresa.</p>
        <a href="${vaga.linkExterno}" target="_blank" rel="noopener" class="btn btn-primario btn-full">Acessar site ↗</a>
      ` : `
        <h3>🔒 Entre para acessar a vaga</h3>
        <p style="color:var(--texto-secundario);font-size:.88rem;margin:.4rem 0 1rem">Crie sua conta gratuita para acessar.</p>
        <a href="pages/login.html" class="btn btn-primario btn-full">Entrar / Cadastrar</a>
      `}
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('ativo');
  document.body.style.overflow = 'hidden';
}
function fecharModal() {
  const o = document.getElementById('modal-overlay'); if (o) o.classList.remove('ativo');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });