# Fluxo de execução do projeto

## Inicialização

O processo único é iniciado por `npm start`, que executa `Backend/scripts_integracao/server.js`. O Express carrega as variáveis de ambiente, disponibiliza os arquivos de `Frontend/` e registra as rotas da API. O cadastro deve ser aberto por HTTP em `/src/cadastro.html`; abrir o arquivo HTML diretamente pelo sistema de arquivos não faz parte do fluxo integrado.

```mermaid
flowchart TD
    A[ npm start ] --> B[ server.js carrega .env ]
    B --> C[ app.js configura Express ]
    C --> D[ Publica Frontend/ como arquivos estáticos ]
    C --> E[ Registra rotas REST ]
    D --> F[ Navegador abre /src/cadastro.html ]
    F --> G[ JavaScript coleta e valida campos ]
    G --> H{ Operação escolhida }

    H -->|POST /pacientes| I[ Rota chama incluirPaciente ]
    I --> J[ Repository/feature abre conexão MySQL ]
    J --> K[ INSERT parametrizado em PACIENTES ]
    K --> L{ Gravou? }
    L -->|Sim| M[ Commit e resposta 201 com ID ]
    L -->|Não| N[ Rollback e resposta JSON de erro ]
    M --> O[ Interface confirma e limpa o formulário ]
    N --> P[ Interface informa erro e preserva os campos ]

    H -->|GET /pacientes| Q[ listarPacientes ]
    H -->|GET /pacientes/:id| R[ consultarPaciente ]
    H -->|PATCH /pacientes/:id| S[ validar campos permitidos e atualizar ]
    Q --> T[ MySQL devolve lista ]
    R --> U[ MySQL devolve registro ou vazio ]
    S --> V[ MySQL devolve registro atualizado ou vazio ]
    T --> W[ JSON para o navegador ]
    U --> W
    V --> W

    H -->|Atendimentos / prontuários| X[ Rotas existem, mas regras ainda não implementadas ]
    X --> Y[ Completar funções de domínio, persistência e telas antes de integrar ]
```

## Contrato atual de pacientes

| Método e caminho | Resultado esperado |
| --- | --- |
| `POST /pacientes` | `201` com `{ id, mensagem }` após inclusão |
| `GET /pacientes` | `200` com uma lista de pacientes |
| `GET /pacientes/:id` | `200` com um paciente; `404` quando não existe |
| `PATCH /pacientes/:id` | `200` com o paciente atualizado; `404` quando não existe |

O backend usa os nomes de colunas atuais da tabela `PACIENTES` e `id` como identificador. A confirmação do esquema real do MySQL ainda é necessária. Os campos de e-mail e tipo de atendimento apresentados pela tela não têm colunas/entidade correspondentes no SQL atual; a seleção do tipo não é persistida como um atendimento. Alergias, dados do responsável e contato de emergência também não existem no formulário atual, portanto são enviados como `null` nesta tela.

## Situação de atendimento e prontuário

As rotas REST de atendimentos e prontuários estão declaradas, mas as funções de consulta, inclusão, edição, listagem e histórico estão vazias ou lançam erro de “não implementada”. O painel de triagem ainda usa linhas estáticas e `sessionStorage`, sem carregar pacientes/atendimentos da API. Essas partes aparecem como pendência no fluxo Mermaid: não devem ser consideradas integrações funcionais ainda.

## Limites da verificação

O diagrama descreve o código e os ajustes feitos. A conexão, os nomes reais das colunas e constraints do MySQL dependem do banco local e precisam ser conferidos nesse ambiente. As funções de atendimento/prontuário não são cobertas como fluxos concluídos.
