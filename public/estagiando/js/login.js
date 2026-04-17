/* ==========================================================
   ESTAGIANDO — JavaScript da Página de Login
   Arquivo: js/login.js
   Descrição: Controla o seletor de perfil, as abas, e as
              funções de login e cadastro (simuladas via localStorage).
   ========================================================== */

/* ----------------------------------------------------------
   ESTADO LOCAL DA PÁGINA
   ---------------------------------------------------------- */
let perfilAtual = 'estudante'; // 'estudante' ou 'empresa'

/* ----------------------------------------------------------
   1. SELETOR DE PERFIL
   ---------------------------------------------------------- */

/**
 * selecionarPerfil(perfil)
 * Troca entre o formulário de estudante e empresa.
 * Mostra/esconde campos específicos de cada perfil.
 */
function selecionarPerfil(perfil) {
  perfilAtual = perfil;

  // Atualiza os botões do seletor
  document.getElementById('btn-estudante').classList.toggle('ativo', perfil === 'estudante');
  document.getElementById('btn-empresa').classList.toggle('ativo', perfil === 'empresa');

  // Atualiza o label do nome
  const labelNome = document.getElementById('label-nome');
  if (perfil === 'empresa') {
    labelNome.textContent = 'Nome da empresa';
    document.getElementById('cad-nome').placeholder = 'Razão social ou nome fantasia';
  } else {
    labelNome.textContent = 'Nome completo';
    document.getElementById('cad-nome').placeholder = 'Seu nome';
  }

  // Mostra/esconde campos exclusivos
  document.getElementById('campo-area').style.display  = perfil === 'estudante' ? 'flex' : 'none';
  document.getElementById('campo-cnpj').style.display  = perfil === 'empresa'   ? 'flex' : 'none';
}

/* ----------------------------------------------------------
   2. ABAS (Login / Cadastro)
   ---------------------------------------------------------- */

/**
 * mostrarAba(aba)
 * Troca entre o formulário de login e de cadastro.
 */
function mostrarAba(aba) {
  // Atualiza estilos das abas
  document.getElementById('aba-login').classList.toggle('ativo', aba === 'login');
  document.getElementById('aba-cadastro').classList.toggle('ativo', aba === 'cadastro');

  // Mostra/esconde formulários
  document.getElementById('form-login').style.display    = aba === 'login'    ? 'block' : 'none';
  document.getElementById('form-cadastro').style.display = aba === 'cadastro' ? 'block' : 'none';

  // Limpa alertas ao trocar de aba
  document.getElementById('alerta-login').style.display = 'none';
}

/* ----------------------------------------------------------
   3. VALIDADORES
   ---------------------------------------------------------- */

/**
 * validarEmail(email)
 * Verifica se o e-mail tem um formato válido (ex: nome@dominio.com).
 */
function validarEmail(email) {
  // Regex simples e segura para a maioria dos e-mails reais
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
}

/**
 * validarSenhaForte(senha)
 * Regras: mínimo 8 caracteres, ao menos 1 letra maiúscula,
 *         1 letra minúscula e 1 número.
 * Retorna { ok: boolean, mensagem: string }
 */
function validarSenhaForte(senha) {
  if (senha.length < 8) {
    return { ok: false, mensagem: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(senha)) {
    return { ok: false, mensagem: 'A senha deve conter pelo menos uma letra maiúscula.' };
  }
  if (!/[a-z]/.test(senha)) {
    return { ok: false, mensagem: 'A senha deve conter pelo menos uma letra minúscula.' };
  }
  if (!/[0-9]/.test(senha)) {
    return { ok: false, mensagem: 'A senha deve conter pelo menos um número.' };
  }
  return { ok: true, mensagem: '' };
}

/**
 * validarCNPJ(cnpj)
 * Valida se o CNPJ tem 14 dígitos (após remover pontuação).
 */
function validarCNPJ(cnpj) {
  const apenasNumeros = cnpj.replace(/\D/g, '');
  return apenasNumeros.length === 14;
}

/* ----------------------------------------------------------
   4. LOGIN
   ---------------------------------------------------------- */

/**
 * fazerLogin()
 * Busca o usuário no localStorage e, se encontrar, inicia a sessão.
 * Em um projeto real, isso seria uma requisição a uma API.
 */
function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;

  // Validação básica
  if (!email || !senha) {
    mostrarAlerta('Preencha o e-mail e a senha.', 'erro', 'alerta-login');
    return;
  }

  // Validação de formato de e-mail
  if (!validarEmail(email)) {
    mostrarAlerta('E-mail inválido. Use o formato: nome@dominio.com', 'erro', 'alerta-login');
    return;
  }

  // Busca o usuário nos cadastros salvos
  const usuarios = obterUsuarios();
  const usuario  = usuarios.find(function (u) {
    return u.email === email && u.senha === senha && u.tipo === perfilAtual;
  });

  if (!usuario) {
    mostrarAlerta('E-mail ou senha incorretos. Verifique seus dados.', 'erro', 'alerta-login');
    return;
  }

  // Login bem-sucedido: salva sessão e redireciona
  salvarSessao(usuario);
  mostrarAlerta('Login realizado! Redirecionando...', 'sucesso', 'alerta-login');

  setTimeout(function () {
    if (usuario.tipo === 'empresa') {
      window.location.href = 'dashboard-empresa.html';
    } else {
      window.location.href = 'dashboard-estudante.html';
    }
  }, 1000);
}

/* ----------------------------------------------------------
   4. CADASTRO
   ---------------------------------------------------------- */

/**
 * fazerCadastro()
 * Valida os campos e cria um novo usuário no localStorage.
 */
function fazerCadastro() {
  const nome  = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;

  // Validações
  if (!nome || !email || !senha) {
    mostrarAlerta('Preencha todos os campos obrigatórios.', 'erro', 'alerta-login');
    return;
  }

  if (nome.length < 2) {
    mostrarAlerta('O nome deve ter pelo menos 2 caracteres.', 'erro', 'alerta-login');
    return;
  }

  if (!validarEmail(email)) {
    mostrarAlerta('E-mail inválido. Use o formato: nome@dominio.com', 'erro', 'alerta-login');
    return;
  }

  const checagemSenha = validarSenhaForte(senha);
  if (!checagemSenha.ok) {
    mostrarAlerta(checagemSenha.mensagem, 'erro', 'alerta-login');
    return;
  }

  // Validação extra para empresa: CNPJ
  if (perfilAtual === 'empresa') {
    const cnpj = document.getElementById('cad-cnpj').value;
    if (!validarCNPJ(cnpj)) {
      mostrarAlerta('CNPJ inválido. Deve conter 14 dígitos.', 'erro', 'alerta-login');
      return;
    }
  }

  // Validação extra para estudante: área de interesse
  if (perfilAtual === 'estudante') {
    const area = document.getElementById('cad-area').value;
    if (!area) {
      mostrarAlerta('Selecione sua área de interesse.', 'erro', 'alerta-login');
      return;
    }
  }

  // Verifica se o e-mail já está cadastrado
  const usuarios = obterUsuarios();
  if (usuarios.some(function (u) { return u.email === email; })) {
    mostrarAlerta('Este e-mail já está cadastrado. Faça login.', 'erro', 'alerta-login');
    return;
  }

  // Monta o objeto do novo usuário
  const novoUsuario = {
    nome:  nome,
    email: email,
    senha: senha,
    tipo:  perfilAtual
  };

  // Campos extras conforme o tipo
  if (perfilAtual === 'estudante') {
    novoUsuario.area = document.getElementById('cad-area').value;
    novoUsuario.candidaturas = []; // Lista de vagas que se candidatou
  } else {
    novoUsuario.cnpj = document.getElementById('cad-cnpj').value;
  }

  // Salva o novo usuário
  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);

  // Faz login automaticamente
  salvarSessao(novoUsuario);

  mostrarAlerta('Conta criada com sucesso! Redirecionando...', 'sucesso', 'alerta-login');

  setTimeout(function () {
    if (perfilAtual === 'empresa') {
      window.location.href = 'dashboard-empresa.html';
    } else {
      window.location.href = 'dashboard-estudante.html';
    }
  }, 1000);
}

/* ----------------------------------------------------------
   5. GERENCIAMENTO DE USUÁRIOS
   (simula um banco de dados usando localStorage)
   ---------------------------------------------------------- */

/**
 * obterUsuarios()
 * Retorna a lista de todos os usuários cadastrados.
 */
function obterUsuarios() {
  const salvo = localStorage.getItem('estagiando-usuarios');
  return salvo ? JSON.parse(salvo) : [];
}

/**
 * salvarUsuarios(usuarios)
 * Salva a lista atualizada de usuários.
 */
function salvarUsuarios(usuarios) {
  localStorage.setItem('estagiando-usuarios', JSON.stringify(usuarios));
}

/* ----------------------------------------------------------
   INICIALIZAÇÃO
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const usuario = obterUsuarioLogado();
  if (usuario) {
    if (usuario.tipo === 'empresa') {
      window.location.href = 'dashboard-empresa.html';
    } else {
      window.location.href = 'dashboard-estudante.html';
    }
  }
});
