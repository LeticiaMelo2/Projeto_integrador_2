const inputCpf = document.getElementById("cpf");

function aplicarMascaraCpf(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  return digitos
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function validarCpf(cpf) {
  const digitos = cpf.replace(/\D/g, "");

  if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(digitos[i]) * (10 - i);
  }
  let primeiroDigito = (soma * 10) % 11;
  if (primeiroDigito === 10) primeiroDigito = 0;
  if (primeiroDigito !== Number(digitos[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(digitos[i]) * (11 - i);
  }
  let segundoDigito = (soma * 10) % 11;
  if (segundoDigito === 10) segundoDigito = 0;
  if (segundoDigito !== Number(digitos[10])) return false;

  return true;
}

if (inputCpf) {
  inputCpf.addEventListener("input", (event) => {
    event.target.value = aplicarMascaraCpf(event.target.value);
  });

  inputCpf.addEventListener("blur", (event) => {
    const valor = event.target.value;
    if (!valor) return;

    const valido = validarCpf(valor);
    event.target.setCustomValidity(valido ? "" : "CPF inválido");
  });
}

