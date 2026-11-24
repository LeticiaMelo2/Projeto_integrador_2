const inputRg = document.getElementById("rg");

function aplicarMascaraRg(valor) {
  // Mantém apenas dígitos e permite 'X' somente na última posição
  const limpo = valor.toUpperCase().replace(/[^0-9X]/g, "");
  const corpo = limpo.replace(/X/g, "").slice(0, 8);
  const ultimo = limpo.length > 8 && limpo[8] === "X" ? "X" : "";
  const combinado = (corpo + ultimo).slice(0, 9);

  if (combinado.length <= 2) {
    return combinado;
  }
  if (combinado.length <= 5) {
    return combinado.replace(/^(\d{2})(\d+)/, "$1.$2");
  }
  if (combinado.length <= 8) {
    return combinado.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  }
  return combinado.replace(/^(\d{2})(\d{3})(\d{3})([0-9X])/, "$1.$2.$3-$4");
}

function validarFormatoRg(rg) {
  const limpo = rg.toUpperCase().replace(/[^0-9X]/g, "");
  return /^[0-9]{6,8}[0-9X]$/.test(limpo);
}

if (inputRg) {
  inputRg.addEventListener("input", (event) => {
    event.target.value = aplicarMascaraRg(event.target.value);
  });

  inputRg.addEventListener("blur", (event) => {
    const valor = event.target.value;
    if (!valor) {
      event.target.setCustomValidity("");
      return;
    }

    const valido = validarFormatoRg(valor);
    event.target.setCustomValidity(valido ? "" : "RG inválido");
  });
}