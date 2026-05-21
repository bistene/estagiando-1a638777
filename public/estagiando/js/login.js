/* ==========================================================
   ESTAGIANDO — JavaScript da Página de Login
   Arquivo: js/login.js
   Descrição: Controla o seletor de perfil, as abas, e as
              funções de login e cadastro (simuladas via localStorage).
   ========================================================== */

/* ----------------------------------------------------------
   ESTADO LOCAL DA PÁGINA
   ---------------------------------------------------------- */
// Apenas estudantes podem se cadastrar/entrar nesta plataforma.
const perfilAtual = 'estudante';

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
   3. LOGIN
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

  // Busca o usuário nos cadastros salvos
  const usuarios = obterUsuarios();
  const usuario  = usuarios.find(function (u) {
    return u.email === email && u.senha === senha && u.tipo === 'estudante';
  });

  if (!usuario) {
    mostrarAlerta('E-mail ou senha incorretos. Verifique seus dados.', 'erro', 'alerta-login');
    return;
  }

  // Login bem-sucedido: salva sessão e redireciona
  salvarSessao(usuario);
  mostrarAlerta('Login realizado! Redirecionando...', 'sucesso', 'alerta-login');

  setTimeout(function () {
    window.location.href = 'dashboard-estudante.html';
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

  // Validações básicas de preenchimento
  if (!nome || !email || !senha) {
    mostrarAlerta('Preencha todos os campos obrigatórios.', 'erro', 'alerta-login');
    return;
  }

  // Validação de e-mail (exige nome@dominio.extensao)
  if (!validarEmail(email)) {
    mostrarAlerta('Digite um e-mail válido. Ex: nome@gmail.com', 'erro', 'alerta-login');
    document.getElementById('cad-email').focus();
    return;
  }

  if (senha.length < 6) {
    mostrarAlerta('A senha deve ter pelo menos 6 caracteres.', 'erro', 'alerta-login');
    return;
  }

  // Validação de CPF
  const cpf = document.getElementById('cad-cpf').value;
  if (!cpf) {
    mostrarAlerta('O CPF é obrigatório.', 'erro', 'alerta-login');
    document.getElementById('cad-cpf').focus();
    return;
  }
  if (!validarCpf(cpf)) {
    mostrarAlerta('CPF inválido. Verifique os números digitados.', 'erro', 'alerta-login');
    document.getElementById('cad-cpf').focus();
    return;
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
    tipo:  'estudante'
  };

  novoUsuario.area = document.getElementById('cad-area').value;
  novoUsuario.cpf  = document.getElementById('cad-cpf').value;
  novoUsuario.candidaturas = []; // Lista de vagas que se candidatou

  // Endereço (comum para estudante e empresa)
  novoUsuario.endereco = {
    cep:         document.getElementById('cad-cep').value,
    rua:         document.getElementById('cad-rua').value,
    numero:      document.getElementById('cad-numero').value,
    complemento: document.getElementById('cad-complemento').value,
    bairro:      document.getElementById('cad-bairro').value,
    cidade:      document.getElementById('cad-cidade').value,
    uf:          document.getElementById('cad-uf').value
  };

  // Salva o novo usuário
  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);

  // Faz login automaticamente
  salvarSessao(novoUsuario);

  mostrarAlerta('Conta criada com sucesso! Redirecionando...', 'sucesso', 'alerta-login');

  setTimeout(function () {
    window.location.href = 'dashboard-estudante.html';
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
    window.location.href = 'dashboard-estudante.html';
  }
});

/* ----------------------------------------------------------
   6. VALIDAÇÃO DE E-MAIL
   ---------------------------------------------------------- */

/**
 * validarEmail(email)
 * Verifica se o e-mail tem formato válido: algo@dominio.extensao
 * Rejeita entradas como "teste", "teste@", "teste@x", etc.
 */
function validarEmail(email) {
  // Exige: caracteres @ dominio . extensao com pelo menos 2 letras
  var regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * validarEmailAoDigitar(input)
 * Dá feedback visual em tempo real enquanto o usuário digita o e-mail.
 */
function validarEmailAoDigitar(input) {
  var feedback = document.getElementById('feedback-email');
  var valor = input.value.trim();

  if (valor.length === 0) {
    feedback.style.display = 'none';
    input.style.borderColor = '';
    return;
  }

  if (validarEmail(valor)) {
    feedback.textContent = '✅ E-mail válido';
    feedback.style.color = '#1a6040';
    input.style.borderColor = '#34c77a';
  } else {
    feedback.textContent = '❌ E-mail inválido. Ex: nome@gmail.com';
    feedback.style.color = '#a02020';
    input.style.borderColor = '#e74c3c';
  }
  feedback.style.display = 'block';
}

/* ----------------------------------------------------------
   7. VALIDAÇÃO E MÁSCARA DE CPF
   ---------------------------------------------------------- */

/**
 * mascararCpf(input)
 * Aplica a máscara 000.000.000-00 enquanto o usuário digita.
 */
function mascararCpf(input) {
  var v = input.value.replace(/\D/g, '').substring(0, 11);
  if (v.length > 9) {
    v = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6, 9) + '-' + v.substring(9);
  } else if (v.length > 6) {
    v = v.substring(0, 3) + '.' + v.substring(3, 6) + '.' + v.substring(6);
  } else if (v.length > 3) {
    v = v.substring(0, 3) + '.' + v.substring(3);
  }
  input.value = v;

  // Feedback em tempo real
  var feedback = document.getElementById('feedback-cpf');
  var digits = input.value.replace(/\D/g, '');

  if (digits.length === 0) {
    feedback.style.display = 'none';
    input.style.borderColor = '';
    return;
  }

  if (digits.length === 11) {
    if (validarCpf(input.value)) {
      feedback.textContent = '✅ CPF válido';
      feedback.style.color = '#1a6040';
      input.style.borderColor = '#34c77a';
    } else {
      feedback.textContent = '❌ CPF inválido. Verifique os números.';
      feedback.style.color = '#a02020';
      input.style.borderColor = '#e74c3c';
    }
    feedback.style.display = 'block';
  } else {
    feedback.style.display = 'none';
    input.style.borderColor = '';
  }
}

/**
 * validarCpf(cpf)
 * Valida o CPF pelos dígitos verificadores (algoritmo oficial da Receita Federal).
 * Rejeita sequências repetidas como 111.111.111-11.
 */
function validarCpf(cpf) {
  var nums = cpf.replace(/\D/g, '');

  if (nums.length !== 11) return false;

  // Rejeita sequências de dígitos iguais (000...0, 111...1, etc.)
  if (/^(\d)\1{10}$/.test(nums)) return false;

  // Calcula 1º dígito verificador
  var soma = 0;
  for (var i = 0; i < 9; i++) {
    soma += parseInt(nums[i]) * (10 - i);
  }
  var resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(nums[9])) return false;

  // Calcula 2º dígito verificador
  soma = 0;
  for (var i = 0; i < 10; i++) {
    soma += parseInt(nums[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(nums[10])) return false;

  return true;
}

