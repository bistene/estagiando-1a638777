(function aplicarTemaInicial() {
  const temaSalvo = localStorage.getItem('estagiando-tema');
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

function alternarTema() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('estagiando-tema', isDark ? 'dark' : 'light');
}

function obterUsuarioLogado() {
  const dados = localStorage.getItem('estagiando-usuario');
  return dados ? JSON.parse(dados) : null;
}

function salvarSessao(usuario) {
  localStorage.setItem('estagiando-usuario', JSON.stringify(usuario));
}

function encerrarSessao() {
  localStorage.removeItem('estagiando-usuario');
  
  const emPages = window.location.pathname.includes('/pages/');
  window.location.href = emPages ? 'login.html' : 'pages/login.html';
}

function mostrarAlerta(mensagem, tipo, elementoId) {
  const alerta = document.getElementById(elementoId);
  if (!alerta) return;

  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  alerta.style.display = 'block';

  alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    alerta.style.display = 'none';
  }, 4000);
}

const ADZUNA_CONFIG = {
  appId: '4a9de73d',
  appKey: 'd218145bf5cbd2fd97bd2ee837f9ce65',
  pais: 'br',
  resultsPerPage: 50,
  paginas: 2,
  termoBusca: 'estágio'
};

const MAPA_ESTADOS_BR = {
  'acre':'AC','alagoas':'AL','amapá':'AP','amapa':'AP','amazonas':'AM',
  'bahia':'BA','ceará':'CE','ceara':'CE','distrito federal':'DF',
  'espírito santo':'ES','espirito santo':'ES','goiás':'GO','goias':'GO',
  'maranhão':'MA','maranhao':'MA','mato grosso':'MT','mato grosso do sul':'MS',
  'minas gerais':'MG','pará':'PA','para':'PA','paraíba':'PB','paraiba':'PB',
  'paraná':'PR','parana':'PR','pernambuco':'PE','piauí':'PI','piaui':'PI',
  'rio de janeiro':'RJ','rio grande do norte':'RN','rio grande do sul':'RS',
  'rondônia':'RO','rondonia':'RO','roraima':'RR','santa catarina':'SC',
  'são paulo':'SP','sao paulo':'SP','sergipe':'SE','tocantins':'TO'
};

function _mapearEstado(nome) {
  if (!nome) return '';
  const chave = String(nome).toLowerCase().trim();
  if (MAPA_ESTADOS_BR[chave]) return MAPA_ESTADOS_BR[chave];
  if (chave.length === 2) return chave.toUpperCase();
  return '';
}

function _mapearArea(tag, label) {
  const t = (tag || '').toLowerCase();
  const l = (label || '').toLowerCase();
  const s = t + ' ' + l;
  if (/it-|software|tecnolog|developer|programa|ti\b|dados|data|ti jobs/.test(s)) return 'tecnologia';
  if (/healthcare|saúde|saude|enferm|médic|medic|hospital|farmac/.test(s)) return 'saude';
  if (/design|creative|criativ|ux|ui/.test(s)) return 'design';
  if (/finance|financ|contab|account|banc/.test(s)) return 'financas';
  if (/marketing|comunica|publicidade|social media/.test(s)) return 'marketing';
  if (/sales|vendas|comercial|atendimento/.test(s)) return 'vendas';
  if (/admin|administra|escritório|escritorio|recep/.test(s)) return 'administrativo';
  if (/hr-|\brh\b|recursos humanos|pessoas/.test(s)) return 'rh';
  if (/engineer|engenh|industr|produç|manufatur|mecânic|elétric|eletric|civil/.test(s)) return 'engenharia';
  if (/legal|jurídic|juridic|direito|advog/.test(s)) return 'juridico';
  if (/log[ií]stic|supply|transport|estoque/.test(s)) return 'logistica';
  if (/educa|ensino|professor|pedagog/.test(s)) return 'educacao';
  if (/consult/.test(s)) return 'consultoria';
  return 'geral';
}

function _extrairLocal(location) {
  const area = (location && Array.isArray(location.area)) ? location.area : [];
  // Adzuna BR: ["Brasil", "Estado", "Cidade", ...]
  let estado = '';
  let cidade = '';
  for (let i = 0; i < area.length; i++) {
    const uf = _mapearEstado(area[i]);
    if (uf && !estado) { estado = uf; continue; }
    if (estado && !cidade) { cidade = area[i]; }
  }
  if (!cidade && location && location.display_name) {
    cidade = String(location.display_name).split(',')[0].trim();
  }
  return { estado: estado || '—', cidade: cidade || 'Brasil' };
}

function _mapearVagaAdzuna(item) {
  const local = _extrairLocal(item.location);
  const bolsa = item.salary_min ? Math.round(item.salary_min / 12) : 0;
  let descricao = item.description || '';
  if (descricao.length > 400) descricao = descricao.substring(0, 397) + '...';
  return {
    id: item.id,
    titulo: item.title ? item.title.replace(/<[^>]+>/g, '') : 'Vaga',
    empresa: (item.company && item.company.display_name) || 'Empresa confidencial',
    area: _mapearArea(item.category && item.category.tag, item.category && item.category.label),
    estado: local.estado,
    cidade: local.cidade,
    bolsa: bolsa,
    cargaHoraria: item.contract_time === 'part_time' ? '20h/semana' : '40h/semana',
    descricao: descricao || 'Acesse o site da empresa para mais detalhes sobre esta vaga.',
    linkExterno: item.redirect_url || '#'
  };
}

let _vagasCache = [];
let _vagasPromise = null;

function obterVagas() {
  return _vagasCache;
}

function carregarVagas() {
  if (_vagasPromise) return _vagasPromise;
  _vagasPromise = (async function () {
    const todas = [];
    for (let p = 1; p <= ADZUNA_CONFIG.paginas; p++) {
      const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_CONFIG.pais}/search/${p}` +
        `?app_id=${ADZUNA_CONFIG.appId}&app_key=${ADZUNA_CONFIG.appKey}` +
        `&results_per_page=${ADZUNA_CONFIG.resultsPerPage}` +
        `&what=${encodeURIComponent(ADZUNA_CONFIG.termoBusca)}` +
        `&content-type=application/json`;
      try {
        const resp = await fetch(url);
        if (!resp.ok) break;
        const dados = await resp.json();
        if (!dados.results || dados.results.length === 0) break;
        dados.results.forEach(function (item) { todas.push(_mapearVagaAdzuna(item)); });
      } catch (e) {
        console.error('Erro ao buscar vagas Adzuna:', e);
        break;
      }
    }
    _vagasCache = todas;
    return todas;
  })();
  return _vagasPromise;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function labelArea(area) {
  const mapa = {
    tecnologia: 'Tecnologia',
    saude: 'Saúde',
    design: 'Design',
    financas: 'Finanças',
    marketing: 'Marketing',
    vendas: 'Vendas',
    administrativo: 'Administrativo',
    rh: 'Recursos Humanos',
    engenharia: 'Engenharia',
    juridico: 'Jurídico',
    logistica: 'Logística',
    educacao: 'Educação',
    consultoria: 'Consultoria',
    geral: 'Geral'
  };
  return mapa[area] || 'Geral';
}

function classTag(area) {
  const mapa = {
    tecnologia: 'tag-tech',
    saude: 'tag-saude',
    design: 'tag-design',
    financas: 'tag-negocio',
    marketing: 'tag-negocio',
    vendas: 'tag-negocio',
    administrativo: 'tag-outro',
    rh: 'tag-outro',
    engenharia: 'tag-tech',
    juridico: 'tag-outro',
    logistica: 'tag-outro',
    educacao: 'tag-outro',
    consultoria: 'tag-negocio',
    geral: 'tag-outro'
  };
  return mapa[area] || 'tag-outro';
}

var nivelFonte = 0;

function toggleAcessWidget() {
  const painel = document.getElementById('acess-painel');
  const btn    = document.getElementById('acess-toggle');
  if (!painel || !btn) return;
  const aberto = painel.classList.toggle('ativo');
  painel.setAttribute('aria-hidden', !aberto);
  btn.classList.toggle('ativo', aberto);
}

function alterarFonte(direcao) {
  nivelFonte = Math.max(-2, Math.min(4, nivelFonte + direcao));
  const porcentagem = 100 + (nivelFonte * 10);
  document.documentElement.style.fontSize = porcentagem + '%';
  const el = document.getElementById('acess-font-valor');
  if (el) el.textContent = porcentagem + '%';
  localStorage.setItem('estagiando-fonte', nivelFonte);
}

function resetarAcessibilidade() {
  nivelFonte = 0;
  document.documentElement.style.fontSize = '';
  const el = document.getElementById('acess-font-valor');
  if (el) el.textContent = '100%';
  localStorage.removeItem('estagiando-fonte');
}

(function restaurarFonte() {
  const salvo = localStorage.getItem('estagiando-fonte');
  if (salvo !== null) {
    nivelFonte = parseInt(salvo);
    const porcentagem = 100 + (nivelFonte * 10);
    document.documentElement.style.fontSize = porcentagem + '%';
    document.addEventListener('DOMContentLoaded', function () {
      const el = document.getElementById('acess-font-valor');
      if (el) el.textContent = porcentagem + '%';
    });
  }
})();

document.addEventListener('click', function (e) {
  const widget = document.getElementById('acess-widget');
  if (widget && !widget.contains(e.target)) {
    const painel = document.getElementById('acess-painel');
    const btn    = document.getElementById('acess-toggle');
    if (painel) painel.classList.remove('ativo');
    if (btn) btn.classList.remove('ativo');
  }
});

/* ── Menu mobile ─────────────────────────────────────────────── */
function toggleMenuMobile() {
  const btn    = document.getElementById('navbar-menu-btn');
  const drawer = document.getElementById('navbar-drawer');
  if (!btn || !drawer) return;
  const aberto = drawer.classList.toggle('aberto');
  btn.classList.toggle('aberto', aberto);
  btn.setAttribute('aria-expanded', aberto);
}

/* ── Toast simples ───────────────────────────────────────────── */
function mostrarToast(msg, tipo) {
  tipo = tipo || 'info';
  let cont = document.querySelector('.toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }
  const t = document.createElement('div');
  t.className = 'toast toast-' + tipo;
  t.textContent = msg;
  cont.appendChild(t);
  setTimeout(function () { t.style.opacity = '0'; setTimeout(function(){ t.remove(); }, 300); }, 2800);
}
