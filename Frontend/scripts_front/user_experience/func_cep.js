function mascararCEP(evento) {
    let campo = evento.target;
    let valor = campo.value.replace(/\D/g, ""); // Remove tudo o que não for número

    if (valor.length > 8) {
        valor = valor.substring(0, 8); // Limita a 8 dígitos
    }

    if (valor.length > 5) {
        // Formata para 00000-000
        campo.value = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    } else {
        campo.value = valor;
    }
}

function buscaCep() {
    let campoCEP = document.getElementById('CEP');
    if (!campoCEP) return;

    //remove hífen ou caractere que não seja número
    let cep = campoCEP.value.replace(/\D/g, "");

    if (cep !== "") {
        //valida se tem 8 dígitos
        if (cep.length !== 8) {
            alert("O CEP deve conter 8 dígitos.");
            return;
        }

        let url = "https://brasilapi.com.br/api/cep/v1/" + cep;
        let req = new XMLHttpRequest();
        req.open("GET", url);
        req.send();

        //tratar resposta da requisição
        req.onload = function () {
            if (req.status === 200) {
                let endereco = JSON.parse(req.response);
                
                // Preenche os campos do formulário com os dados retornados
                if (document.getElementById("Logradouro")) document.getElementById("Logradouro").value = endereco.street || "";
                if (document.getElementById("Bairro")) document.getElementById("Bairro").value = endereco.neighborhood || "";
                if (document.getElementById("cidade")) document.getElementById("cidade").value = endereco.city || "";
                if (document.getElementById("uf")) document.getElementById("uf").value = endereco.state || "";
            } else if (req.status === 404) {
                alert("CEP não encontrado.");
            } else {
                alert("Erro ao fazer a requisição.");
            }
        };
    }
}

function inicializarEventoCEP() {
    let campoCEP = document.getElementById("CEP");
    if (campoCEP) {
        campoCEP.setAttribute("maxlength", "9"); // Limita tamanho máximo do input
        
        // Ativa a máscara dinâmica ao digitar
        campoCEP.addEventListener("input", mascararCEP);
        
        // Ativa a busca ao perder o foco (blur)
        campoCEP.addEventListener("blur", buscaCep);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarEventoCEP);
} else {
    inicializarEventoCEP();
}