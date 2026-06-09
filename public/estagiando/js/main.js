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
  if (t.includes('it-') || l.includes('ti') || l.includes('tecnolog') || l.includes('software')) return 'tecnologia';
  if (t.includes('healthcare') || l.includes('saúde') || l.includes('saude') || l.includes('enferm') || l.includes('médic')) return 'saude';
  if (t.includes('design') || t.includes('creative') || l.includes('design') || l.includes('criativ')) return 'design';
  if (t.includes('admin') || t.includes('sales') || t.includes('finance') || t.includes('hr-') || t.includes('marketing') || t.includes('consult') ||
      l.includes('admin') || l.includes('vendas') || l.includes('marketing') || l.includes('financ') || l.includes('rh') || l.includes('negóc')) return 'negocios';
  return 'outros';
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
    negocios: 'Negócios',
    outros: 'Outros'
  };
  return mapa[area] || 'Outros';
}

function classTag(area) {
  const mapa = {
    tecnologia: 'tag-tech',
    saude: 'tag-saude',
    design: 'tag-design',
    negocios: 'tag-negocio',
    outros: 'tag-outro'
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
