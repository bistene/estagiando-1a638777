/* ==========================================================
   ESTAGIANDO — JavaScript da Página Principal
   Arquivo: js/index.js
   Descrição: Carrega as vagas, aplica filtros e controla o modal.
              Depende de: js/main.js (deve ser carregado antes)
   ========================================================== */

/* ----------------------------------------------------------
   1. INICIALIZAÇÃO DA PÁGINA
   A função init() é chamada assim que a página termina de
   carregar (evento DOMContentLoaded).
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  // Verifica sessão para ajustar links da navbar
  verificarSessaoNavbar();

  // Carrega e exibe todas as vagas
  renderizarVagas(obterVagas());

  // Atualiza o contador do hero
  document.getElementById('total-vagas').textContent = obterVagas().length;
});

/* ----------------------------------------------------------
   2. NAVBAR — Ajuste dinâmico conforme o usuário logado
   ---------------------------------------------------------- */
function verificarSessaoNavbar() {
  const usuario = obterUsuarioLogado();

  if (usuario) {
    // Usuário logado: esconde botão de entrar, mostra "Minha Área" e "Sair"
    document.getElementById('link-login').style.display = 'none';
    document.getElementById('link-dashboard').style.display = 'block';
    document.getElementById('link-sair').style.display = 'block';

    // Define para onde vai o link "Minha Área"
    const linkArea = document.getElementById('link-area-usuario');
    if (usuario.tipo === 'empresa') {
      linkArea.href = 'pages/dashboard-empresa.html';
      linkArea.textContent = '🏢 Minha Empresa';
    } else {
      linkArea.href = 'pages/dashboard-estudante.html';
      linkArea.textContent = '🎓 Meu Perfil';
    }
  }
}

/* ----------------------------------------------------------
   3. RENDERIZAR VAGAS
   Recebe um array de vagas e cria os cards HTML dinamicamente.
   ---------------------------------------------------------- */
function renderizarVagas(vagas) {
  const lista    = document.getElementById('lista-vagas');
  const vazio    = document.getElementById('vagas-vazio');
  const contador = document.getElementById('contador-vagas');

  // Limpa o conteúdo anterior
  lista.innerHTML = '';

  // Atualiza o contador
  contador.textContent = `${vagas.length} vaga${vagas.length !== 1 ? 's' : ''}`;

  // Se não há vagas, mostra mensagem de vazio
  if (vagas.length === 0) {
    lista.style.display = 'none';
    vazio.style.display = 'block';
    return;
  }

  lista.style.display = 'grid';
  vazio.style.display = 'none';

  // Cria um card para cada vaga
  vagas.forEach(function (vaga, indice) {
    const card = criarCardVaga(vaga, indice);
    lista.appendChild(card);
  });
}

/**
 * criarCardVaga(vaga, indice)
 * Cria e retorna um elemento <div> com as informações da vaga.
 * Usamos createElement para ter controle total sobre o HTML gerado.
 */
function criarCardVaga(vaga, indice) {
  // Elemento raiz do card
  const div = document.createElement('div');

  // Delay na animação: cada card entra levemente depois do anterior
  div.style.animationDelay = `${indice * 0.08}s`;
  div.style.opacity = '0';         // Começa invisível
  div.className = 'card vaga-card animar-entrada';

  // Monta o HTML interno do card
  div.innerHTML = `
    <div class="vaga-card-topo">
      <div>
        <div class="vaga-titulo">${vaga.titulo}</div>
        <div class="vaga-empresa">🏢 ${vaga.empresa}</div>
      </div>
      <span class="tag ${classTag(vaga.area)}">${labelArea(vaga.area)}</span>
    </div>

    <p class="vaga-descricao">${vaga.descricao}</p>

    <div class="vaga-info">
      <span class="vaga-info-item">📍 ${vaga.cidade}, ${vaga.estado}</span>
      <span class="vaga-info-item">⏱ ${vaga.cargaHoraria}</span>
      <span class="vaga-info-item">👥 ${vaga.candidatos.length} candidato${vaga.candidatos.length !== 1 ? 's' : ''}</span>
    </div>

    <div class="vaga-rodape">
      <div>
        <div class="vaga-bolsa">
          ${formatarMoeda(vaga.bolsa)}
          <span>/ mês</span>
        </div>
      </div>
      <button class="btn btn-primario btn-sm" onclick="abrirModal(${vaga.id})">
        Ver vaga →
      </button>
    </div>
  `;

  return div;
}

/* ----------------------------------------------------------
   4. FILTROS
   ---------------------------------------------------------- */

/**
 * aplicarFiltros()
 * Lê os valores dos selects e filtra o array de vagas.
 * Chamada automaticamente quando o usuário muda um filtro (onchange).
 */
function aplicarFiltros() {
  const estado = document.getElementById('filtro-estado').value;
  const area   = document.getElementById('filtro-area').value;

  let vagas = obterVagas();

  // Filtra por estado (se algum estado estiver selecionado)
  if (estado) {
    vagas = vagas.filter(function (v) {
      return v.estado === estado;
    });
  }

  // Filtra por área (se alguma área estiver selecionada)
  if (area) {
    vagas = vagas.filter(function (v) {
      return v.area === area;
    });
  }

  renderizarVagas(vagas);
}

/**
 * limparFiltros()
 * Reseta os selects para o valor vazio e recarrega todas as vagas.
 */
function limparFiltros() {
  document.getElementById('filtro-estado').value = '';
  document.getElementById('filtro-area').value = '';
  renderizarVagas(obterVagas());
}

/* ----------------------------------------------------------
   5. MODAL
   ---------------------------------------------------------- */
let vagaAtualId = null; // Guarda qual vaga está aberta no modal

/**
 * abrirModal(idVaga)
 * Busca a vaga pelo id e preenche o modal com suas informações.
 */
function abrirModal(idVaga) {
  const vagas   = obterVagas();
  const vaga    = vagas.find(function (v) { return v.id === idVaga; });
  vagaAtualId   = idVaga;

  if (!vaga) return;

  const usuario = obterUsuarioLogado();

  // Verifica se o estudante já se candidatou
  const jaCandidatou = usuario &&
    usuario.tipo === 'estudante' &&
    vaga.candidatos.some(function (c) { return c.email === usuario.email; });

  // Monta o conteúdo do modal
  const conteudo = document.getElementById('modal-conteudo');
  conteudo.innerHTML = `
    <span class="tag ${classTag(vaga.area)}" style="margin-bottom:0.8rem">${labelArea(vaga.area)}</span>
    <h2 class="modal-titulo">${vaga.titulo}</h2>
    <p class="modal-empresa">🏢 ${vaga.empresa} · 📍 ${vaga.cidade}, ${vaga.estado}</p>

    <div class="modal-destaque">
      <div>
        <div style="font-size:0.8rem;font-weight:700;color:var(--texto-secundario);margin-bottom:0.2rem">BOLSA MENSAL</div>
        <div class="modal-destaque-bolsa">${formatarMoeda(vaga.bolsa)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:0.8rem;font-weight:700;color:var(--texto-secundario);margin-bottom:0.2rem">CARGA HORÁRIA</div>
        <div style="font-weight:700;font-size:1.1rem">⏱ ${vaga.cargaHoraria}</div>
      </div>
    </div>

    <div class="divisor"></div>

    <div class="modal-secao">
      <div class="modal-secao-titulo">Sobre a vaga</div>
      <p>${vaga.descricao}</p>
    </div>

    <!-- Seção de candidatura -->
    <div class="candidatura-form" id="area-candidatura">
      ${montarAreaCandidatura(usuario, jaCandidatou, vaga)}
    </div>

    <!-- Lista de candidatos (visível para todos) -->
    <div class="candidatos-lista">
      <div class="modal-secao-titulo" style="margin-bottom:0.8rem">
        👥 Candidatos (${vaga.candidatos.length})
      </div>
      ${montarListaCandidatos(vaga.candidatos)}
    </div>
  `;

  // Exibe o modal
  document.getElementById('modal-overlay').classList.add('ativo');

  // Impede rolagem da página por trás
  document.body.style.overflow = 'hidden';
}

/**
 * montarAreaCandidatura(usuario, jaCandidatou, vaga)
 * Retorna o HTML da área de candidatura conforme o estado do usuário.
 */
function montarAreaCandidatura(usuario, jaCandidatou, vaga) {
  // Usuário não logado
  if (!usuario) {
    return `
      <h3>🎓 Quer se candidatar?</h3>
      <p style="color:var(--texto-secundario);font-size:0.9rem;margin-bottom:1rem">
        Faça login como estudante para se candidatar a esta vaga.
      </p>
      <a href="pages/login.html" class="btn btn-primario" style="width:100%">
        Entrar / Cadastrar
      </a>
    `;
  }

  // Usuário logado como empresa (não pode se candidatar)
  if (usuario.tipo === 'empresa') {
    return `<p style="color:var(--texto-secundario);font-size:0.9rem">
      Você está logado como empresa. Apenas estudantes podem se candidatar.
    </p>`;
  }

  // Estudante já candidatado
  if (jaCandidatou) {
    return `
      <h3>✅ Candidatura enviada!</h3>
      <p style="color:var(--texto-secundario);font-size:0.9rem;margin-top:0.5rem">
        Você já se candidatou a esta vaga. A empresa será notificada.
      </p>
    `;
  }

  // Estudante ainda não candidatado: mostra formulário
  return `
    <h3>🚀 Candidatar-se a esta vaga</h3>
    <div id="alerta-candidatura" class="alerta"></div>
    <div class="form-grupo mt-2">
      <label class="form-label" for="input-mensagem">Mensagem para a empresa (opcional)</label>
      <textarea
        class="form-input"
        id="input-mensagem"
        rows="3"
        placeholder="Apresente-se brevemente e diga por que você tem interesse..."
        style="resize:vertical"
      ></textarea>
    </div>
    <button class="btn btn-primario" style="width:100%" onclick="candidatar()">
      Enviar candidatura 🚀
    </button>
  `;
}

/**
 * montarListaCandidatos(candidatos)
 * Retorna HTML da lista de candidatos.
 */
function montarListaCandidatos(candidatos) {
  if (candidatos.length === 0) {
    return '<p style="color:var(--texto-secundario);font-size:0.9rem">Nenhum candidato ainda. Seja o primeiro!</p>';
  }

  return candidatos.map(function (c) {
    // Pega as iniciais do nome para o avatar
    const iniciais = c.nome.split(' ').map(function (p) { return p[0]; }).join('').substring(0, 2).toUpperCase();
    return `
      <div class="candidato-item">
        <div class="candidato-avatar">${iniciais}</div>
        <span>${c.nome}</span>
      </div>
    `;
  }).join('');
}

/**
 * candidatar()
 * Registra a candidatura do estudante na vaga atual.
 */
function candidatar() {
  const usuario = obterUsuarioLogado();
  if (!usuario || usuario.tipo !== 'estudante') return;

  const vagas = obterVagas();
  const indice = vagas.findIndex(function (v) { return v.id === vagaAtualId; });

  if (indice === -1) return;

  const mensagem = document.getElementById('input-mensagem').value;

  // Adiciona o candidato ao array da vaga
  vagas[indice].candidatos.push({
    nome:      usuario.nome,
    email:     usuario.email,
    mensagem:  mensagem,
    data:      new Date().toLocaleDateString('pt-BR')
  });

  // Salva as vagas atualizadas
  salvarVagas(vagas);

  // Mostra mensagem de sucesso
  mostrarAlerta('Candidatura enviada com sucesso! 🎉 A empresa foi notificada.', 'sucesso', 'alerta-candidatura');

  // Recarrega o modal após 1.5s para refletir as mudanças
  setTimeout(function () {
    abrirModal(vagaAtualId);
  }, 1500);
}

/**
 * fecharModal()
 * Fecha o modal e restaura a rolagem da página.
 */
function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('ativo');
  document.body.style.overflow = '';
  vagaAtualId = null;
}

// Fecha o modal ao pressionar a tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharModal();
});
