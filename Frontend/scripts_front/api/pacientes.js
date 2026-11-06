//coleta de dados do formulário
async function coletarDados(event) {
    event.preventDefault();

    console.log("Iniciando coleta de dados do formulário...");

    const dadosPaciente = {
        nome_completo: document.getElementById("nome_completo").value,
        cpf: document.getElementById("cpf").value,
        rg: document.getElementById("rg").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        sexo: document.getElementById("sexo").value,
        nome_mae: document.getElementById("nome_mae").value,
        nome_pai: document.getElementById("nome_pai").value,
        telefone: document.getElementById("telefone").value,
        endereco_cep: document.getElementById("endereco_cep").value,
        endereco_logradouro: document.getElementById("endereco_logradouro").value,
        endereco_numero: document.getElementById("endereco_numero").value,
        endereco_complemento: document.getElementById("endereco_complemento").value,
        endereco_bairro: document.getElementById("endereco_bairro").value,
        endereco_cidade: document.getElementById("endereco_cidade").value,
        endereco_estado: document.getElementById("endereco_estado").value,
        responsavel_legal_nome: document.getElementById("responsavel_legal_nome").value,
        responsavel_legal_parentesco: document.getElementById("responsavel_legal_parentesco").value,
        tipo_sanguineo: document.getElementById("tipo_sanguineo").value,
        alergias: document.getElementById("alergias").value,
        convenio_nome: document.getElementById("convenio_nome").value,
        convenio_numero: document.getElementById("convenio_numero").value,
        convenio_plano: document.getElementById("convenio_plano").value,
        contato_emerg_nome: document.getElementById("contato_emerg_nome").value,
        contato_emerg_parentesco: document.getElementById("contato_emerg_parentesco").value,
        contato_emerg_tel: document.getElementById("contato_emerg_tel").value
    };


    try {
        const resultado = await enviarPaciente(dadosPaciente);
        alert("Paciente cadastrado com sucesso! ID: " + resultado.id);
        formularioPaciente.reset();
    }
    catch (erro) {
        alert("Erro ao cadastrar paciente: " + erro.message);
    }   
};




//chamadas a api
async function enviarPaciente(dadosPaciente) {
    const resposta = await fetch("http://localhost:3000/pacientes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosPaciente)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(resultado.erro || "Erro ao cadastrar paciente");
    }

    return resultado;
}