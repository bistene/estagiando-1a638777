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

  setTimeout(() => {
    alerta.style.display = 'none';
  }, 4000);
}

const vagasIniciais = [
  {
    id: 1,
    titulo: 'Estágio em Desenvolvimento Web',
    empresa: 'TechBrasil Ltda.',
    area: 'tecnologia',
    estado: 'SP',
    cidade: 'São Paulo',
    bolsa: 800,
    cargaHoraria: '20h/semana',
    descricao: 'Estágio em desenvolvimento front-end com HTML, CSS e JavaScript. Ambiente jovem e descontraído!',
    candidatos: []
  },
  {
    id: 2,
    titulo: 'Estágio em Enfermagem',
    empresa: 'Hospital São Lucas',
    area: 'saude',
    estado: 'RJ',
    cidade: 'Rio de Janeiro',
    bolsa: 700,
    cargaHoraria: '30h/semana',
    descricao: 'Acompanhamento de procedimentos, apoio à equipe médica e atendimento ao paciente.',
    candidatos: []
  },
  {
    id: 3,
    titulo: 'Estágio em Design Gráfico',
    empresa: 'Agência Criativa',
    area: 'design',
    estado: 'MG',
    cidade: 'Belo Horizonte',
    bolsa: 750,
    cargaHoraria: '20h/semana',
    descricao: 'Criação de peças visuais para redes sociais, identidade visual e materiais gráficos.',
    candidatos: []
  },
  {
    id: 4,
    titulo: 'Estágio em Administração',
    empresa: 'Contabilidade Express',
    area: 'negocios',
    estado: 'PR',
    cidade: 'Curitiba',
    bolsa: 650,
    cargaHoraria: '20h/semana',
    descricao: 'Suporte administrativo, controle de planilhas, atendimento e organização de documentos.',
    candidatos: []
  },
  {
    id: 5,
    titulo: 'Estágio em Suporte de TI',
    empresa: 'InfoSoluções',
    area: 'tecnologia',
    estado: 'RS',
    cidade: 'Porto Alegre',
    bolsa: 900,
    cargaHoraria: '30h/semana',
    descricao: 'Suporte técnico a usuários, instalação de softwares, manutenção de computadores.',
    candidatos: []
  },
  {
    id: 6,
    titulo: 'Estágio em Marketing Digital',
    empresa: 'StartUp Conecta',
    area: 'negocios',
    estado: 'SP',
    cidade: 'Campinas',
    bolsa: 850,
    cargaHoraria: '20h/semana',
    descricao: 'Gestão de redes sociais, criação de conteúdo, análise de métricas e campanhas online.',
    candidatos: []
  }
];

function obterVagas() {
  const salvas = localStorage.getItem('estagiando-vagas');
  return salvas ? JSON.parse(salvas) : vagasIniciais;
}

function salvarVagas(vagas) {
  localStorage.setItem('estagiando-vagas', JSON.stringify(vagas));
}

function inicializarVagas() {
  if (!localStorage.getItem('estagiando-vagas')) {
    salvarVagas(vagasIniciais);
  }
}

inicializarVagas();

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
