// Implementar lógica de validação de CPF

function validarPrimDigito(cpfList) {
    let cont = 0, soma = 0;

    for (let i = 10; i >= 2; i--) {
        soma += parseInt(cpfList[cont]) * i;
        /*console.log("cpf num: " + parseInt(cpfList[cont]));
        console.log("indice: " + i);console.log("soma: " + soma);*/
        cont++;
    }

    let digito = 11 - (soma % 11);
    //console.log("primeiro digito: " + digito);
    return verificaCPF(digito, cpfList, 1);
}


function validarSegDigito(cpfList) {
    let cont = 0, soma = 0;

    for (let i = 11; i >= 2; i--) {
        soma += parseInt(cpfList[cont]) * i;
        /*console.log("cpf num: " + parseInt(cpfList[cont]));
        console.log("indice: " + i);
        console.log("soma: " + soma); */
        cont++;
    }
    let digito = 11 - (soma % 11);
    // console.log("segundo digito: " + digito);
    return verificaCPF(digito, cpfList, 2);
}

function verificaCPF(dig, listCpf, ordemDig) {
    let digitoCpf;
    if (dig == 10 || dig == 11) {
        digitoCpf = 0;
    } else {
        digitoCpf = dig;
    }

    //-------------

    // if (ordemDig == 1) {
    //     if (listCpf[9] == digitoCpf) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // } else {
    //     if (listCpf[10] == digitoCpf) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    if (ordemDig == 1) {
        return listCpf[9] == digitoCpf;
    } else {
        return listCpf[10] == digitoCpf;
    }
}

function validarCPF(cpf) {
    // Remove qualquer caractere que não seja número
    cpf = cpf.replace(/\D/g, "");

    // CPF precisa ter exatamente 11 números
    if (cpf.length !== 11) {
        console.log("CPF inválido: quantidade de dígitos incorreta.");
        return false;
    }

    let listCpf = cpf.split("");
    console.log("lista cpf: " + listCpf + " - " + typeof listCpf[0]);

    let primValido = validarPrimDigito(listCpf);
    let segValido = validarSegDigito(listCpf);

    if (primValido && segValido) {
        return {
            sucesso: true,
            dados: listCpf.join("") // transforma o CPF validado como uma string
        };
    } else {
        return {
            sucesso: false,
            erro: "CPF inválido"
        };
    }
}

export { validarCPF };
