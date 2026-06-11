document.addEventListener('DOMContentLoaded', async function () {
  const usuario = obterUsuarioLogado();
  if (!usuario || usuario.tipo !== 'estudante') {
    window.location.href = 'login.html';
    return;
  }

  await carregarVagas();
  renderizarPerfil(usuario);
  renderizarRecomendadas(usuario);
});

function renderizarPerfil(usuario) {
  
  const iniciais = usuario.nome.split(' ').map(function (p) { return p[0]; }).join('').substring(0, 2).toUpperCase();
  document.getElementById('perfil-avatar').textContent = iniciais;
  document.getElementById('perfil-nome').textContent  = usuario.nome;
  document.getElementById('perfil-email').textContent = usuario.email;

  const tagArea = document.getElementById('perfil-area-tag');
  if (usuario.area) {
    tagArea.textContent  = labelArea(usuario.area);
    tagArea.className    = `tag ${classTag(usuario.area)}`;
  } else {
    tagArea.style.display = 'none';
  }

  const vagas = obterVagas();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('stat-vagas-disponiveis', vagas.length);
  set('stat-rj',       vagas.filter(v => v.estado === 'RJ').length);
  set('stat-estagios', vagas.filter(v => /est[áa]gi|intern|trainee/i.test(v.titulo + ' ' + (v.descricao||''))).length);

  const loading = document.getElementById('dash-loading');
  if (loading) loading.style.display = 'none';
}

function renderizarRecomendadas(usuario) {
  const vagas = obterVagas();
  let recomendadas = vagas;

  // Filtra pela área de interesse, se o usuário tem uma
  if (usuario.area) {
    recomendadas = vagas.filter(function (v) {
      return v.area === usuario.area;
    });
  }

  // Pega no máximo 3 recomendadas
  recomendadas = recomendadas.slice(0, 3);

  const container = document.getElementById('vagas-recomendadas');

  if (recomendadas.length === 0) {
    container.innerHTML = `
      <div class="dash-vazio">
        <span>⭐</span>
        <p>Nenhuma vaga encontrada para sua área. <a href="../index.html">Ver todas as vagas</a>.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recomendadas.map(function (vaga) {
    return `
      <div class="card" style="display:flex;flex-direction:column;gap:0.8rem">
        <div>
          <span class="tag ${classTag(vaga.area)}">${labelArea(vaga.area)}</span>
          <div style="font-weight:700;margin-top:0.5rem">${vaga.titulo}</div>
          <div style="font-size:0.85rem;color:var(--texto-secundario)">🏢 ${vaga.empresa}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:0.8rem;border-top:1px solid var(--borda-cor)">
          <span style="font-weight:800;color:var(--cor-acento)">${formatarMoeda(vaga.bolsa)}<small style="font-weight:600;color:var(--texto-secundario)">/mês</small></span>
          <a href="${vaga.linkExterno}" target="_blank" rel="noopener noreferrer" class="btn btn-primario btn-sm">Acessar ↗</a>
        </div>
      </div>
    `;
  }).join('');
}
