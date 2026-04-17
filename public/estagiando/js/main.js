/* ==========================================================
   ESTAGIANDO — JavaScript Principal
   Arquivo: js/main.js
   Descrição: Funções compartilhadas por todas as páginas:
              dark mode, sessão de usuário e notificações.
   ========================================================== */

/* ----------------------------------------------------------
   1. DARK MODE
   Verifica se o usuário já escolheu um tema antes
   (salvo no localStorage) e aplica na abertura da página.
   ---------------------------------------------------------- */

// Roda assim que o arquivo JS é carregado
(function aplicarTemaInicial() {
  const temaSalvo = localStorage.getItem('estagiando-tema');
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
  }
})();

/**
 * alternarTema()
 * Chamada pelo botão de lua/sol na navbar.
 * Adiciona ou remove a classe "dark-mode" do body
 * e salva a preferência no localStorage.
 */
function alternarTema() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('estagiando-tema', isDark ? 'dark' : 'light');
}

/* ----------------------------------------------------------
   2. SESSÃO SIMPLES (simulação sem banco de dados)
   Usamos o localStorage para simular um sistema de login.
   Em um projeto real, isso seria feito com um servidor.
   ---------------------------------------------------------- */

/**
 * obterUsuarioLogado()
 * Retorna o objeto do usuário logado, ou null se não há sessão.
 */
function obterUsuarioLogado() {
  const dados = localStorage.getItem('estagiando-usuario');
  return dados ? JSON.parse(dados) : null;
}

/**
 * salvarSessao(usuario)
 * Salva os dados do usuário logado.
 * @param {Object} usuario - Objeto com nome, tipo, email etc.
 */
function salvarSessao(usuario) {
  localStorage.setItem('estagiando-usuario', JSON.stringify(usuario));
}

/**
 * encerrarSessao()
 * Remove os dados do usuário e redireciona para o login.
 */
function encerrarSessao() {
  localStorage.removeItem('estagiando-usuario');
  // Detecta se estamos na raiz ou dentro de /pages/
  const emPages = window.location.pathname.includes('/pages/');
  window.location.href = emPages ? 'login.html' : 'pages/login.html';
}

/* ----------------------------------------------------------
   3. NOTIFICAÇÕES (Alertas visuais na tela)
   ---------------------------------------------------------- */

/**
 * mostrarAlerta(mensagem, tipo, elementoId)
 * Exibe uma caixa de alerta colorida dentro de um elemento.
 * @param {string} mensagem - Texto a exibir
 * @param {string} tipo - 'sucesso' ou 'erro'
 * @param {string} elementoId - ID do elemento HTML do alerta
 */
function mostrarAlerta(mensagem, tipo, elementoId) {
  const alerta = document.getElementById(elementoId);
  if (!alerta) return;

  // Remove classes antigas e adiciona a nova
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  alerta.style.display = 'block';

  // Esconde automaticamente após 4 segundos
  setTimeout(() => {
    alerta.style.display = 'none';
  }, 4000);
}

/* ----------------------------------------------------------
   4. VAGAS (simulação de banco de dados em memória)
   Em um projeto real, esses dados viriam de uma API.
   Aqui usamos um array de objetos JavaScript.
   ---------------------------------------------------------- */

// Vagas já cadastradas para demonstração
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

/**
 * obterVagas()
 * Retorna todas as vagas (do localStorage ou as iniciais).
 */
function obterVagas() {
  const salvas = localStorage.getItem('estagiando-vagas');
  return salvas ? JSON.parse(salvas) : vagasIniciais;
}

/**
 * salvarVagas(vagas)
 * Persiste o array de vagas no localStorage.
 */
function salvarVagas(vagas) {
  localStorage.setItem('estagiando-vagas', JSON.stringify(vagas));
}

/**
 * inicializarVagas()
 * Garante que as vagas iniciais existam no localStorage.
 */
function inicializarVagas() {
  if (!localStorage.getItem('estagiando-vagas')) {
    salvarVagas(vagasIniciais);
  }
}

// Inicializa as vagas ao carregar qualquer página
inicializarVagas();

/* ----------------------------------------------------------
   5. FORMATAÇÃO AUXILIAR
   ---------------------------------------------------------- */

/**
 * formatarMoeda(valor)
 * Formata número para moeda brasileira. Ex: 800 → "R$ 800,00"
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * labelArea(area)
 * Converte o código da área para texto legível.
 */
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

/**
 * classTag(area)
 * Retorna a classe CSS da tag de acordo com a área.
 */
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
