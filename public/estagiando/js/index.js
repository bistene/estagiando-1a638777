document.addEventListener('DOMContentLoaded', function () {
  
  verificarSessaoNavbar();

  renderizarVagas(obterVagas());

  document.getElementById('total-vagas').textContent = obterVagas().length;
});

function verificarSessaoNavbar() {
  const usuario = obterUsuarioLogado();

  if (usuario) {
    
    document.getElementById('link-login').style.display = 'none';
    document.getElementById('link-dashboard').style.display = 'block';
    document.getElementById('link-sair').style.display = 'block';

    const linkArea = document.getElementById('link-area-usuario');
    linkArea.href = 'pages/dashboard-estudante.html';
    linkArea.textContent = '🎓 Meu Perfil';
  }
}

function renderizarVagas(vagas) {
  const lista    = document.getElementById('lista-vagas');
  const vazio    = document.getElementById('vagas-vazio');
  const contador = document.getElementById('contador-vagas');

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

  vagas.forEach(function (vaga, indice) {
    const card = criarCardVaga(vaga, indice);
    lista.appendChild(card);
  });
}

function criarCardVaga(vaga, indice) {
  
  const div = document.createElement('div');

  div.style.animationDelay = `${indice * 0.08}s`;
  div.style.opacity = '0';         
  div.className = 'card vaga-card animar-entrada';

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

function aplicarFiltros() {
  const estado = document.getElementById('filtro-estado').value;
  const area   = document.getElementById('filtro-area').value;

  let vagas = obterVagas();

  if (estado) {
    vagas = vagas.filter(function (v) {
      return v.estado === estado;
    });
  }

  if (area) {
    vagas = vagas.filter(function (v) {
      return v.area === area;
    });
  }

  renderizarVagas(vagas);
}

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

    <div class="candidatura-form">
      ${usuario ? `
        <h3>🚀 Candidate-se diretamente com a empresa</h3>
        <p style="color:var(--texto-secundario);font-size:0.9rem;margin:0.5rem 0 1rem">
          O processo seletivo é conduzido pela própria empresa. Clique abaixo para acessar a página oficial da vaga e seguir as instruções de inscrição.
        </p>
        <a href="${vaga.linkExterno}" target="_blank" rel="noopener noreferrer" class="btn btn-primario" style="width:100%">
          Acessar site da empresa ↗
        </a>
      ` : `
        <h3>🔒 Entre para acessar a vaga</h3>
        <p style="color:var(--texto-secundario);font-size:0.9rem;margin:0.5rem 0 1rem">
          Faça login ou crie sua conta gratuita para acessar o site da empresa e se candidatar.
        </p>
        <a href="pages/login.html" class="btn btn-primario" style="width:100%">
          Entrar / Cadastrar
        </a>
      `}
    </div>
  `;

  document.getElementById('modal-overlay').classList.add('ativo');

  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('ativo');
  document.body.style.overflow = '';
  vagaAtualId = null;
}

// Fecha o modal ao pressionar a tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fecharModal();
});
