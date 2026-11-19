//aguarda todo o HTML carregar antes de rodar o código
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const btnOlho = document.getElementById('btnOlho');
    const campoSenha = document.getElementById('senha');
    const msgErro = document.getElementById('msgErro');

    //mostrar ou ocultar a senha ao clicar no olho
    if (btnOlho && campoSenha) {
        btnOlho.addEventListener('click', () => {
           const icone = btnOlho.querySelector('i');

            if (campoSenha.type === 'password') {
                // se for senha (bolinhas), muda para texto visível
                campoSenha.type = 'text';

                // troca o ícone para o olho cortado
                if (icone) {
                    icone.classList.remove('fa-eye');
                    icone.classList.add('fa-eye-slash');
                }
            } else {
                //se for texto visível, volta para senha (bolinhas)
                campoSenha.type = 'password';

                // Troca o ícone para o olho aberto
                if (icone) {
                    icone.classList.remove('fa-eye-slash');
                    icone.classList.add('fa-eye');
                }
            }
        });
    }

    //envia o formulário 
    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const email = document.getElementById('usuario').value;
        const senha = campoSenha.value;

        //limpa os campos
        if (msgErro) msgErro.innerText = '';

        try {
            const resposta = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    //avisa o servidor que os dados estão sendo enviados no formato JSON
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha }) // Converte os dados digitados para texto JSON
            });
            
            //aguarda o servidor responder e converte o JSON recebido para um objeto JavaScript
            const dados = await resposta.json();

            if (resposta.ok) {
                //localStorage: É um pequeno "banco de dados" interno do próprio navegador. Tudo o que você salva nele continua guardado mesmo se a página for atualizada ou fechada.

                //.setItem('usuarioLogado', ...): Cria uma chave chamada 'usuarioLogado' para armazenar as credenciais/dados do usuário retornado pelo servidor.

                // JSON.stringify(dados.usuario): Como o localStorage só aceita guardar texto, transformamos o objeto do usuário de volta em texto JSON para conseguir salvar.

                //salva as informações do usuário na memória local do navegador
                localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));
                //redireciona o usuário para a tela principal
                window.location.href = 'cadastro.html';

    } else {
                //exibe a mensagem de erro do html na tela ou via alerta 
                if (msgErro) {
                    msgErro.innerText = dados.erro;
                } else {
                    alert(dados.erro); //caso não ache a mensagem no html cria um alert
                }
            }

        } catch (erro) {
            console.error('Erro ao conectar com o servidor:', erro);
            const mensagem = 'Servidor indisponível. Certifique-se de que o backend está ativo.';
            if (msgErro) { //se tiver tag no html de erro
                msgErro.innerText = mensagem;
            } else {
                alert(mensagem);
            }
        }
    });
});