
//coleta e tratamento dos valores do formulário
function obterValor(id) {
  const campo = document.getElementById(id);
  if (!campo) return null;

  const valor = campo.value.trim();
  return valor === "" ? null : valor;
}

function montarPayloadPaciente() {
  return {
    nome_completo: obterValor("name"),
    data_nascimento: obterValor("dataNascimento"),
    rg: obterValor("rg"),
    cpf: obterValor("cpf"),
    nome_mae: obterValor("nome-mae"),
    nome_pai: obterValor("nome-pai"),
    sexo: obterValor("sexo"),
    telefone: obterValor("telefone"),
    email: obterValor("email"),
    tipo_atendimento: obterValor("atendimento"),

    endereco: {
      cep: obterValor("CEP"),
      logradouro: obterValor("Logradouro"),
      numero: obterValor("numero"),
      bairro: obterValor("Bairro"),
      cidade: obterValor("cidade"),
      estado: obterValor("uf")
    }
  };

}

async function enviarDados(dados) {
  try {
    //fetch faz requisição ao servidor
    const resposta = await fetch(
      //Rota de leitura do back
      "http://localhost:3001/cadastrar-paciente",
      {
        method: "POST", //POST => enviar 
        headers: {
          "Content-Type": "application/json" //Formato
        },
        //transforma os dados do formulário em um JSON
        body: JSON.stringify(dados)
      }
    );

    const resul = await resposta.json();

    //lança um erro no fetch
    if(!resposta.ok){
      throw new Error(
        resul.mensagem || "Não foi possível cadastrar o paciente"
      )
    }
    alert(resul.mensagem);
    console.log(("paciente cadastrado: ", resul));

  } catch(e){
    console.error("Erro no cadastro: ", e);
    alert("Falha no cadastro: " + e.message);
  }

}

//serve de garçom dos dados
async function cadastrar() {
  const payload = montarPayloadPaciente();
  console.log("dados enviados: ", payload);
  await enviarDados(payload);  
}