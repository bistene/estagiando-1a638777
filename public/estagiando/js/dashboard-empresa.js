/* ==========================================================
   ESTAGIANDO — JavaScript do Dashboard da Empresa
   Arquivo: js/dashboard-empresa.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const usuario = obterUsuarioLogado();
  if (!usuario || usuario.tipo !== 'empresa') {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('empresa-nome').textContent  = usuario.nome;
  document.getElementById('empresa-email').textContent = usuario.email;

  renderizarVagasEmpresa(usuario);
});

function renderizarVagasEmpresa(usuario) {
  const vagas       = obterVagas();
  const minhasVagas = vagas.filter(function (v) { return v.empresa === usuario.nome; });

  // Atualiza estatísticas
  document.getElementById('stat-vagas').textContent = minhasVagas.length;
  const totalCandidatos = minhasVagas.reduce(function (acc, v) { return acc + v.candidatos.length; }, 0);
  document.getElementById('stat-candidatos').textContent = totalCandidatos;

  const lista = document.getElementById('lista-vagas-empresa');

  if (minhasVagas.length === 0) {
    lista.innerHTML = `
      <div class="dash-vazio">
        <span>📋</span>
        <p>Você ainda não publicou nenhuma vaga. Use o formulário acima!</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = minhasVagas.map(function (vaga) {
    const candidatos = vaga.candidatos;
    const candidatosHtml = candidatos.length === 0
      ? '<p style="color:var(--texto-secundario);font-size:0.85rem">Nenhum candidato ainda.</p>'
      : candidatos.map(function (c) {
          const iniciais = c.nome.split(' ').map(function (p) { return p[0]; }).join('').substring(0, 2).toUpperCase();
          return `
            <div class="candidato-empresa-item">
              <div class="candidato-avatar">${iniciais}</div>
              <div>
                <div class="cand-nome">${c.nome}</div>
                ${c.mensagem ? `<div class="cand-msg">"${c.mensagem}"</div>` : ''}
              </div>
              <span style="margin-left:auto;font-size:0.8rem;color:var(--texto-secundario)">${c.data || ''}</span>
            </div>
          `;
        }).join('');

    return `
      <div class="card empresa-vaga-card">
        <div class="empresa-vaga-header">
          <div>
            <div class="empresa-vaga-titulo">${vaga.titulo}</div>
            <div class="empresa-vaga-meta">
              📍 ${vaga.cidade}, ${vaga.estado} &nbsp;·&nbsp;
              ⏱ ${vaga.cargaHoraria} &nbsp;·&nbsp;
              💰 ${formatarMoeda(vaga.bolsa)}/mês
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem">
            <span class="tag ${classTag(vaga.area)}">${labelArea(vaga.area)}</span>
            <span style="font-size:0.8rem;color:var(--texto-secundario)">
              👥 ${candidatos.length} candidato${candidatos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div class="empresa-candidatos">
          <h4>Candidatos inscritos</h4>
          ${candidatosHtml}
        </div>
      </div>
    `;
  }).join('');
}

function publicarVaga() {
  const usuario = obterUsuarioLogado();
  const titulo    = document.getElementById('vaga-titulo').value.trim();
  const bolsa     = parseFloat(document.getElementById('vaga-bolsa').value);
  const area      = document.getElementById('vaga-area').value;
  const carga     = document.getElementById('vaga-carga').value;
  const estado    = document.getElementById('vaga-estado').value;
  const cidade    = document.getElementById('vaga-cidade').value.trim();
  const descricao = document.getElementById('vaga-descricao').value.trim();

  // Validações
  if (!titulo || !bolsa || !area || !carga || !estado || !cidade || !descricao) {
    mostrarAlerta('Preencha todos os campos obrigatórios!', 'erro', 'alerta-vaga');
    return;
  }

  if (bolsa <= 0) {
    mostrarAlerta('O valor da bolsa deve ser maior que zero.', 'erro', 'alerta-vaga');
    return;
  }

  const vagas = obterVagas();

  // Gera um ID único: maior ID existente + 1
  const novoId = Math.max(...vagas.map(function (v) { return v.id; }), 0) + 1;

  const novaVaga = {
    id:           novoId,
    titulo:       titulo,
    empresa:      usuario.nome,
    area:         area,
    estado:       estado,
    cidade:       cidade,
    bolsa:        bolsa,
    cargaHoraria: carga,
    descricao:    descricao,
    candidatos:   []
  };

  vagas.push(novaVaga);
  salvarVagas(vagas);

  mostrarAlerta('Vaga publicada com sucesso! 🎉 Estudantes já podem se candidatar.', 'sucesso', 'alerta-vaga');

  // Limpa o formulário
  ['vaga-titulo','vaga-bolsa','vaga-area','vaga-carga','vaga-estado','vaga-cidade','vaga-descricao'].forEach(function (id) {
    document.getElementById(id).value = '';
  });

  // Atualiza a listagem
  renderizarVagasEmpresa(usuario);
}
