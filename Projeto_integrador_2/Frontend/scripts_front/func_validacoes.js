function mascararTelefone(evento) {
    let campo = evento.target;
    let valor = campo.value.replace(/\D/g, ""); // Remove tudo o que não for número

    if (valor.length > 11) valor = valor.substring(0, 11);

    if (valor.length > 7) {
        campo.value = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    } else if (valor.length > 2) {
        //formata enquanto digita os primeiros dígitos
        campo.value = valor.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
        campo.value = valor;
    }
}

function mascararCPF(evento) {
    let campo = evento.target;
    let valor = campo.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.substring(0, 11);

    campo.value = valor
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascararRG(evento) {
    let campo = evento.target;
    let valor = campo.value.replace(/\D/g, "");

    if (valor.length > 9) valor = valor.substring(0, 9);

    campo.value = valor
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1})$/, "$1-$2");
}

// Inicialização 
function inicializarMascarasDiversas() {
    let campoTelefone = document.getElementById("Telefone") || document.getElementById("telefone");
    let campoCPF = document.getElementById("cpf") || document.getElementById("CPF");
    let campoRG = document.getElementById("rg") || document.getElementById("RG");

    if (campoTelefone) {
        campoTelefone.setAttribute("maxlength", "15");
        campoTelefone.addEventListener("input", mascararTelefone);
    }

    if (campoCPF) {
        campoCPF.setAttribute("maxlength", "14");
        campoCPF.addEventListener("input", mascararCPF);
    }

    if (campoRG) {
        campoRG.setAttribute("maxlength", "12");
        campoRG.addEventListener("input", mascararRG);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarMascarasDiversas);
} else {
    inicializarMascarasDiversas();
}