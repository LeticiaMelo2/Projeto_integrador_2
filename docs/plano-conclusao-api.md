# Plano de conclusão da API e integração com o front

Análise do código local em 26/10/2026. Este documento descreve o que existe, o que falta e a sequência sugerida de implementação. Os endpoints, arquivos e campos indicados como propostas ainda precisam ser implementados. Nenhuma mudança de código ou banco foi executada nesta análise.

## 1. Diagnóstico do projeto

O projeto utiliza JavaScript com ES Modules (`"type": "module"`). Há código de Express e MySQL, mas o `package.json` e o lockfile não declaram as dependências importadas. O front utiliza HTML, CSS e JavaScript, sem framework.

| Área | Evidência no código | Pendência / impacto |
| --- | --- | --- |
| Inicialização | `app.js` na raiz e `Backend/scripts_features/app.js` repetem a API de pacientes | Escolher uma única entrada; ambos têm imports incompatíveis com os caminhos existentes |
| Dependências e execução | Imports de `express`, `dotenv/config` e `mysql2/promise`; não há dependências declaradas | Instalação reproduzível e comandos de execução ainda precisam ser definidos |
| Banco | `Backend/scripts_integracao/conexao_banco.js` exporta `getConnection` como export nomeado | Funções de pacientes e atendimentos importam um `default` que não existe |
| Pacientes | Express declara `POST /pacientes` e `GET /pacientes/:id` | São implementações parciais; não comprovam funcionamento devido aos bloqueios de inicialização |
| Validação | Validação de CPF está comentada no cadastro Express | A função existente mistura retorno booleano e objeto; precisa de contrato consistente |
| Cadastro alternativo | `func_paciente.js` possui outro INSERT | Há import inexistente, vírgula final inválida no SQL, uso de `sql` em vez de `sqlPaciente`, execução fora da conexão da transação e ausência de rollback/encerramento |
| Endereço | Express espera `endereco_logradouro` etc. na raiz; o front envia `endereco: { logradouro, ... }` | Dados podem ser ignorados; escolher um único formato público e mapear no back |
| Atendimentos | `func_atendimento.js` usa banco em memória e contador global | Falta persistência MySQL, API HTTP e numeração segura contra concorrência/reinício |
| Assincronicidade | `criacaoNumAtendimento` é `async`, mas sua chamada não usa `await` | `num_atendimento` recebe uma Promise no fluxo atual |
| Data de nascimento | Cadastro usa `data_nascimento`; atendimento consulta `data_nasc` e idade espera `DD/MM/AAAA` | Unificar o campo e o formato para evitar idade incorreta ou erro |
| Prontuários | Não foram encontrados módulos, rotas ou persistência para prontuários | Implementar o recurso e seu histórico |
| Servidor alternativo | `scripts_integracao/server.js` usa `http` na porta 3001 | Usa `req.body` sem parser, `res.json` fora do Express e variáveis `nome`/`email` não definidas; não atende o contrato do front |
| Mapa de rotas | `rotas.js` referencia `enviarPaciente` sem import e não exporta/monta um router | O mapa não constitui uma rota HTTP funcional; também aponta para `index.html` inexistente |
| Chamada do front | `script.js` chama `POST http://localhost:3001/cadastrar-paciente`; Express usa porta 3000 por padrão | URL, porta e rota precisam ser alinhadas |
| Evento de cadastro | HTML tem `cadastrar()` global que apenas exibe sucesso; `script.js` é carregado como módulo | O botão usa a função inline e não a função do módulo que faz o fetch |
| Submit | Formulário usa `onsubmit="payloaodPaciente()"`, função não encontrada | Corrigir associação de evento e impedir envio padrão |
| Campos adicionais | Front coleta `email` e `tipo_atendimento`, mas o INSERT Express não os inclui | Definir destino desses dados antes de prometer persistência |
| Listagem visual | `cadastro.html` contém linha estática de paciente | Substituir por consulta e renderização da resposta real |
| Login | `login.html` apenas mostra alerta no submit | Autenticação e autorização ainda não estão integradas |
| Testes | `teste_funcionalidades.js` não cria paciente: a expressão entre parênteses resulta na última string | Reescrever como teste real; há imports quebrados nas dependências; `npm test` é somente placeholder |
| Esquema do banco | Não foram encontrados DDL, migrations ou scripts SQL | A estrutura real, tipos, índices e constraints não foram confirmados |

**Configuração:** `.env.example` contém senha preenchida. Substituir por placeholder e trocar a credencial caso seja real. Não copiar esse valor para novos documentos. O `.gitignore` atual ignora apenas `node_modules`; adicionar `.env` antes de criar configuração local com segredos. `DB_PORT` está no exemplo, mas não é usado na conexão. O comentário sobre `startup.js` não corresponde a arquivo encontrado.

**Trabalho local existente:** foram encontradas alterações não commitadas em `Backend/scripts_features/app.js` e `Backend/scripts_integracao/conexao_banco.js`. Preservá-las ao implementar as próximas etapas.

## 2. Organização proposta: back e front

Manter as duas categorias principais já existentes. Dentro do front, CSS cuida da aparência; JavaScript de interface cuida de eventos e estados visuais; JavaScript de API cuida de HTTP. Não é necessário introduzir framework para concluir estes fluxos.

Estrutura sugerida, a criar gradualmente:

```text
Backend/
  scripts_integracao/
    server.js                  # única inicialização HTTP
    app.js                     # configura Express, JSON, rotas e erros
    rotas.js                   # registra endpoints
    conexao_banco.js            # conexão MySQL
  scripts_features/
    func_cpf.js                # validação reutilizável
    func_paciente.js            # regras de pacientes
    func_atendimento.js         # regras e transições de atendimentos
    func_prontuario.js          # regras de prontuários e revisões
  repositories/
    paciente_repository.js     # SQL de pacientes/endereço
    atendimento_repository.js  # SQL de atendimentos
    prontuario_repository.js   # SQL de prontuários/histórico
  database/
    migrations/                # evolução versionada do esquema
  tests/                       # testes; banco_teste.js pertence ao apoio de testes
Frontend/
  src/                         # telas HTML
  style/                       # CSS existente e estilos por tela quando necessário
  scripts_front/
    api/
      cliente.js               # base URL, fetch, JSON e erros
      pacientes_api.js
      atendimentos_api.js
      prontuarios_api.js
    ui/
      cadastro_ui.js           # etapas, validação visual, loading e mensagens
      pacientes_ui.js          # busca, tabela e formulário de edição
      atendimentos_ui.js
      prontuarios_ui.js
docs/
  plano-conclusao-api.md
```

Esses nomes são propostas, não arquivos já presentes. Os módulos de rotas podem chamar as funções existentes como handlers; separar controllers somente se o tamanho justificar. A pequena camada repository evita misturar HTTP, regra e SQL, reaproveitando os módulos atuais.

Fluxo esperado:

```text
Usuário -> evento da tela -> coleta/validação visual -> módulo de API
        -> rota Express -> validação/autorização -> regra -> repository -> MySQL
        <- renderização <- resposta JSON <- resultado confirmado no banco
```

O front solicita operações e fornece valores. O back determina campos permitidos, permissões, IDs, autor, datas, status e persistência. O front nunca envia SQL, nomes arbitrários de tabela ou credenciais de banco.

## 3. Etapa 1 — Consolidar inicialização e configuração

1. Escolher o Express como servidor da API, aproveitando o que já existe em `Backend/scripts_features/app.js`.
2. Transferir a configuração do app para o local definido acima e deixar somente `server.js` chamar `listen`. Não executar três servidores concorrentes para o mesmo fluxo.
3. Corrigir imports conforme o caminho final, especialmente `conexao.js` para o módulo real e import nomeado de `getConnection`.
4. Declarar as dependências efetivamente usadas (`express`, `mysql2`, `dotenv`) e atualizar o lockfile na implementação. Não escolher versões sem verificar compatibilidade com o ambiente.
5. Adicionar scripts de `start` e `test`. Exemplo de entrada futura: `"start": "node Backend/scripts_integracao/server.js"`. O script de teste deve executar testes reais.
6. Sanitizar `.env.example`, proteger `.env` no Git e documentar `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. Validar configuração obrigatória na inicialização, sem imprimir senha.
7. Consumir `DB_PORT` como número quando informado. Escolher entre conexão individual com `end()` e pool com `release()`; não misturar contratos. Manter conexão individual inicialmente é compatível com o helper atual.
8. Preferir servir o front e a API na mesma origem HTTP, montando somente o diretório `Frontend` como estático. Nunca expor a raiz do projeto, `.env` ou `Backend`. Usar `/pacientes` etc. como URLs relativas no front.
9. Se o front ficar em outra origem, definir URL base por ambiente e permitir apenas as origens necessárias, incluindo tratamento de preflight. Não abrir os HTML por `file://` como ambiente de integração.
10. Centralizar JSON inválido, rota inexistente e erros internos em respostas JSON consistentes.

**Concluída quando:** uma instalação limpa consegue iniciar uma única API; a tela é servida por HTTP; uma consulta de diagnóstico confirma a conexão com banco de teste sem escrever dados de pacientes.

## 4. Etapa 2 — Confirmar e versionar o banco

Antes de gerar DDL, obter a definição real das tabelas, tipos, PKs, FKs, índices e engine transacional. O código não prova que as colunas utilizadas já existem. Usar um banco de desenvolvimento com dados sintéticos e preparar migrações revisáveis antes de qualquer alteração estrutural.

Modelo mínimo **proposto**, sujeito à comparação com o esquema real:

| Entidade | Responsabilidade | Campos / vínculos propostos |
| --- | --- | --- |
| `PACIENTES` | Cadastro duradouro | `id_paciente`, dados pessoais/contato existentes, CPF normalizado, `email` se aprovado, datas e `versao` |
| Endereço do paciente | Endereço atual | Escolher colunas em `PACIENTES` ou tabela própria; não manter duas fontes concorrentes |
| `ATENDIMENTOS` | Cada passagem do paciente pelo serviço | `id_atendimento`, FK de paciente, `num_atendimento`, `tipo_atendimento`, `status`, abertura, encerramento e `versao` |
| `PRONTUARIOS` | Registro clínico daquele atendimento | `id_prontuario`, FK de atendimento, conteúdo definido com a equipe, autor, estado, datas e `versao` |
| Revisões de prontuário | Rastreabilidade de alterações clínicas | FK de prontuário, versão anterior/nova, alteração, motivo, autor autenticado e data |
| Histórico de atendimento | Rastreabilidade do fluxo | FK de atendimento, status anterior/novo, autor e data |

Proposta inicial: um paciente tem vários atendimentos; um atendimento tem zero ou um prontuário principal; um prontuário tem várias revisões. Para essa opção, criar unicidade da FK de atendimento em prontuários. Se o requisito for múltiplas evoluções independentes por atendimento, revisar essa cardinalidade antes de implementar.

Passo a passo:

1. Confirmar se endereço fica na própria tabela ou em tabela relacionada. O INSERT Express sugere a primeira opção; o código comentado de `func_paciente.js` sugere a segunda. Resolver a divergência com o banco real.
2. Definir CPF como texto normalizado, com unicidade no banco quando obrigatório. Definir política para pacientes sem CPF antes de expandir o cadastro atual.
3. Definir datas de nascimento como data civil; timestamps operacionais devem seguir convenção documentada de fuso, preferencialmente UTC com apresentação local no front.
4. Definir enums/valores aceitos para sexo, tipo de atendimento, status e estado do prontuário. Compatibilizar com os valores reais do HTML, incluindo `nao_informar` e `SUS`.
5. Manter `tipo_atendimento` no atendimento, pois pode mudar em cada visita. Se o formulário cadastrar paciente e já abrir atendimento, realizar duas operações explícitas ou criar futuramente um comando transacional específico.
6. Definir limites de tamanho e nulabilidade dos campos a partir do esquema e dos formulários.
7. Criar PKs, FKs e unicidade de número de atendimento. Prever índices a partir das consultas: paciente, status/data de abertura e vínculos de prontuários.
8. Acrescentar controle de versão para edição concorrente e tabelas de histórico conforme o contrato escolhido.
9. Não configurar exclusão em cascata de registros clínicos como padrão. Exclusão não faz parte do escopo solicitado.
10. Versionar as mudanças em migrations e validar aplicação em banco vazio e em cópia de teste do esquema atual. Fazer backup e revisão antes de migrar dados existentes.

**Concluída quando:** o esquema pode ser reproduzido, os vínculos são validados pelo banco e a decisão de cardinalidade/endereço está documentada.

## 5. Etapa 3 — Fixar o contrato entre front e back

Usar a mesma nomenclatura no JSON de entrada, resposta e mapeamento de formulário. Manter as rotas `/pacientes` já declaradas como base evita uma troca desnecessária de convenção. Todos os endpoints abaixo são o contrato alvo, não uma lista de recursos funcionais hoje.

| Operação | Método e rota propostos | Ação do front |
| --- | --- | --- |
| Cadastrar paciente | `POST /pacientes` | Enviar cadastro; guardar ID retornado |
| Consultar paciente | `GET /pacientes/:id` | Preencher detalhes/formulário de edição |
| Alterar paciente | `PATCH /pacientes/:id` | Enviar somente campos alterados e versão |
| Listar pacientes | `GET /pacientes` | Enviar filtros e paginação |
| Abrir atendimento | `POST /atendimentos` | Enviar paciente selecionado e tipo |
| Consultar atendimento | `GET /atendimentos/:id` | Preencher tela do atendimento |
| Alterar atendimento | `PATCH /atendimentos/:id` | Solicitar transição/correção permitida |
| Listar atendimentos | `GET /atendimentos` | Solicitar fila, período ou paciente |
| Histórico do atendimento | `GET /atendimentos/:id/historico` | Mostrar mudanças autorizadas |
| Criar prontuário | `POST /atendimentos/:id/prontuarios` | Enviar conteúdo clínico inicial |
| Consultar prontuário | `GET /prontuarios/:id` | Abrir leitura ou edição |
| Alterar prontuário | `PATCH /prontuarios/:id` | Enviar campos alterados, versão e motivo quando exigido |
| Listar prontuários | `GET /prontuarios` | Solicitar registros por paciente/atendimento/período |
| Histórico do prontuário | `GET /prontuarios/:id/historico` | Mostrar revisões para perfil autorizado |

Padronização proposta de resposta de detalhe/criação/edição:

```json
{
  "dados": { "id_paciente": 123, "nome_completo": "Paciente de exemplo", "versao": 1 },
  "mensagem": "Paciente cadastrado com sucesso."
}
```

Detalhe retorna um objeto; listagem retorna array. Não retornar o array bruto do MySQL em `GET /pacientes/:id`. Listas vazias são `200` com `dados: []`; detalhe inexistente é `404`.

```json
{
  "erro": {
    "codigo": "VALIDACAO",
    "mensagem": "Revise os campos informados.",
    "campos": { "cpf": "CPF inválido." }
  }
}
```

Convenção sugerida: `201` criação; `200` leitura/edição com corpo; `400` JSON, parâmetros ou campos inválidos; `401` sem autenticação; `403` sem permissão; `404` recurso ausente; `409` duplicidade, edição concorrente ou transição incompatível; `500` falha inesperada. Não retornar SQL, stack trace ou detalhes de conexão ao cliente.

**Concluída quando:** os responsáveis pelo front e back utilizam o mesmo contrato, incluindo campos obrigatórios, exemplos, erros e filtros. Registrar o contrato em OpenAPI quando os campos forem confirmados.

## 6. Etapa 4 — Concluir cadastro e consulta de pacientes

1. Manter um único fluxo de cadastro: rota -> função de paciente -> repository. Remover duplicação somente depois de migrar os consumidores.
2. Receber o JSON do front; rejeitar propriedades desconhecidas. Nunca espalhar `req.body` diretamente em SQL ou em campos internos.
3. Validar nome, CPF e RG como já exigido pelo Express, ajustando obrigatoriedade após decisão de negócio. Harmonizar com nascimento, nome da mãe e UF, exigidos no HTML, mas não no back atual.
4. Padronizar `validarCPF` para um retorno estável; validar tipo antes de `.replace`, rejeitar sequências repetidas e retirar logs do documento. Um objeto `{ sucesso: false }` é truthy: não validar apenas com `if (!validarCPF(cpf))` se o retorno continuar sendo objeto.
5. Normalizar CPF/CEP/telefone como texto sem máscara; validar datas reais em `YYYY-MM-DD`, incluindo nascimento futuro. Não passar data de input HTML pela máscara `DD/MM/AAAA` antes de salvar no MySQL.
6. Mapear endereço aninhado para as colunas ou tabela escolhidas. Validar `email` se enviado e implementá-lo no esquema antes de persistir.
7. Usar SQL parametrizado. Tratar duplicidade de CPF como `409`, apoiada por constraint de banco, inclusive em requisições simultâneas.
8. Se houver múltiplos INSERTs, executá-los na mesma conexão dentro de transação; em erro, rollback; em qualquer saída, encerrar/devolver conexão. Propagar a falha em vez de apenas fazer `console.error`.
9. Retornar `201` com ID e dados confirmados. Implementar detalhe com ID inteiro positivo, seleção explícita de colunas e `404` quando ausente.

Payload alvo de paciente, com campos opcionais omitidos:

```json
{
  "nome_completo": "Paciente de exemplo",
  "cpf": "<CPF sintético válido no ambiente de teste>",
  "rg": "RG-DE-TESTE",
  "data_nascimento": "1995-08-15",
  "nome_mae": "Responsável de exemplo",
  "sexo": "nao_informar",
  "telefone": "11999990000",
  "email": "paciente@example.com",
  "endereco": {
    "cep": "01001000",
    "logradouro": "Rua de exemplo",
    "numero": "100",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}
```

O marcador de CPF não é um valor aceito pela API; substituí-lo por fixture sintética válida. `email` e o formato aninhado são propostas de contrato, não suporte confirmado no banco.

**Concluída quando:** cadastrar e consultar o mesmo paciente preserva todos os campos contratados e nenhum erro gera mensagem de sucesso.

## 7. Etapa 5 — Alterar e enriquecer informações do paciente

1. Ao clicar em editar, o front busca `GET /pacientes/:id` e preenche o formulário com a resposta atual, incluindo `versao`.
2. O usuário altera campos existentes; o front compara o formulário com os dados carregados.
3. Enviar apenas diferenças por `PATCH`. Campo omitido preserva o valor; `null` limpa campo opcional; string vazia deve ser normalizada ou rejeitada conforme o campo. Não converter automaticamente todo campo vazio em apagamento.
4. No objeto `endereco`, aplicar atualização por propriedade: enviar somente telefone não altera endereço; enviar somente `endereco.numero` não apaga logradouro. Rejeitar `endereco: null` neste contrato; limpar componentes opcionais explicitamente.
5. O back valida uma lista fixa de campos editáveis. IDs, datas internas, permissões e autoria não podem vir como alterações do cliente.
6. Usar versão em atualização condicional, por exemplo `WHERE id_paciente = ? AND versao = ?`, incrementando a versão no mesmo UPDATE. Diferenciar recurso inexistente de versão antiga; versão antiga retorna `409`.
7. Após sucesso, substituir os dados/versão locais pela resposta e atualizar a linha da tabela. Se houver conflito, oferecer recarga sem descartar silenciosamente a edição do usuário.

```json
{
  "telefone": "11988880000",
  "email": "novo@example.com",
  "endereco": { "numero": "200" },
  "versao": 1
}
```

Não permitir que o front crie colunas no banco. Enriquecer um registro significa preencher campos previstos no contrato; informação nova exige revisão do esquema, migração e validação no back antes de ser coletada pela tela.

**Concluída quando:** editar um campo preserva os demais, limpar opcional funciona e duas telas editando a mesma versão não sobrescrevem dados silenciosamente.

## 8. Etapa 6 — Cadastrar e consultar atendimentos

1. Após localizar/cadastrar o paciente, o front envia `POST /atendimentos` com seu ID. Reutilizar o paciente em visitas posteriores, sem cadastrar outra pessoa para cada atendimento.
2. O back confirma existência e permissão de acesso ao paciente, consulta sua data de nascimento e calcula os dados derivados. Não confiar em idade ou nome enviados para substituir o cadastro.
3. Persistir no MySQL, retirando o banco em memória do caminho de produção e corrigindo imports para que testes não impeçam a aplicação de iniciar.
4. Gerar ID e número de atendimento no back com unicidade garantida no banco. Não usar contador global: ele reinicia e conflita entre processos. Uma opção simples é compor a identificação a partir do ID persistido; definir se os prefixos atuais serão mantidos.
5. Separar número estável de atendimento da etapa atual. Passar de recepção para triagem não deve alterar a identidade do atendimento. A política atual baseada em idade é apenas regra do protótipo e deve ser confirmada com a equipe.
6. Atribuir status inicial e datas no servidor. Autor virá da sessão autenticada.
7. Retornar `201` com o atendimento e implementar `GET /atendimentos/:id`.
8. Definir se pode existir mais de um atendimento aberto por paciente. Se não puder, garantir a regra com mecanismo transacional/constraint adequado, além da validação da aplicação.

```json
{
  "id_paciente": 123,
  "tipo_atendimento": "SUS"
}
```

O cadastro de paciente pode ter sucesso e a abertura do atendimento falhar. Nesse caso, o front mantém o ID cadastrado e permite repetir somente a abertura. Não mostrar falha de cadastro nem reenviar o paciente automaticamente. Para repetição de abertura após timeout, prever chave de idempotência persistida e associada ao comando antes de habilitar retry automático de POST.

**Concluída quando:** um paciente pode ter atendimentos persistentes, identificadores não se repetem sob concorrência e reiniciar o servidor não perde registros.

## 9. Etapa 7 — Alterar atendimentos e controlar o fluxo

Fluxo inicial **proposto**, a validar com as telas e a equipe:

```text
AGUARDANDO_TRIAGEM -> EM_TRIAGEM -> AGUARDANDO_ATENDIMENTO
                   -> EM_ATENDIMENTO -> FINALIZADO
```

A sequência acima é linear: `AGUARDANDO_ATENDIMENTO` segue para `EM_ATENDIMENTO`. `CANCELADO` deve ser alternativa somente nos estados e perfis permitidos. Qualquer reabertura precisa de regra própria, motivo e histórico; não aceitar qualquer troca de status.

1. Definir a matriz de origem/destino/perfil e a condição para encerrar atendimento.
2. O front consulta o atendimento atual e mostra apenas ações possíveis; o back sempre revalida.
3. Receber por `PATCH /atendimentos/:id` status, versão e campos administrativos autorizados, como correção do tipo de atendimento.
4. Não permitir trocar `id_paciente` livremente em atendimento existente. Correção de vínculo exige fluxo específico e análise de impacto no prontuário.
5. Validar versão e transição em atualização atômica. Salvar alteração e histórico na mesma transação.
6. Gerar abertura/encerramento no servidor. Atualizar fila/tela após confirmação; em `409`, recarregar o estado.

```json
{
  "status": "EM_TRIAGEM",
  "versao": 1
}
```

**Concluída quando:** transições válidas atualizam fila e histórico; transições inválidas, perfil incorreto e versão antiga são bloqueados sem mudanças parciais.

## 10. Etapa 8 — Cadastrar prontuários

1. Confirmar os campos clínicos necessários com as telas e responsáveis. `queixa_principal`, `anamnese` e `conduta` abaixo são exemplos propostos; não são campos encontrados no projeto.
2. Criar migration e repository para o modelo aprovado. Não substituir dados clínicos por um JSON sem contrato apenas para evitar modelagem.
3. Ao abrir a tela, carregar o atendimento selecionado, a identificação do paciente e o prontuário existente, se houver.
4. Enviar conteúdo a `POST /atendimentos/:id/prontuarios`. Derivar o paciente do atendimento no back, evitando aceitar um segundo ID conflitante no corpo.
5. Validar existência, status do atendimento, conteúdo permitido e perfil do usuário. Registrar autor autenticado, timestamps e estado inicial `RASCUNHO` no back.
6. Garantir a cardinalidade escolhida no banco. No modelo de um prontuário por atendimento, segunda criação retorna `409`; o front deve abrir o recurso existente.
7. Persistir registro e primeira revisão de forma transacional e retornar ID/versão. Não usar dados clínicos reais nas fixtures.

```json
{
  "queixa_principal": "Conteúdo fictício para teste",
  "anamnese": "Descrição sintética",
  "conduta": "Conduta de exemplo"
}
```

**Concluída quando:** um perfil autorizado cria e consulta o prontuário vinculado ao atendimento correto, com autoria e versão fornecidas pelo servidor.

## 11. Etapa 9 — Alterar prontuários sem perder histórico

1. O front carrega o prontuário por ID, conserva a versão e oferece campos editáveis de acordo com seu estado.
2. Definir os estados `RASCUNHO` e `FINALIZADO` e quem pode finalizar. A finalização pode ser solicitada no PATCH, mas precisa de regra explícita no back.
3. Durante o rascunho, aceitar alterações parciais validadas, sempre registrando revisão.
4. Após finalizado, propor correção com motivo obrigatório e histórico preservado. O PATCH pode atualizar a representação atual, mas deve manter a versão anterior integralmente recuperável; não apagar a informação original.
5. Rejeitar alteração de autoria original, atendimento e identificadores. Gerar autor da revisão e data com a sessão do servidor.
6. Gravar nova versão e histórico na mesma transação com checagem atômica da versão anterior. Caso uma parte falhe, fazer rollback de tudo.
7. Retornar nova versão; atualizar a tela somente após confirmação. Não fazer reenvio automático de alteração clínica em conflito.
8. Disponibilizar histórico paginado apenas para perfis autorizados.

```json
{
  "conduta": "Complemento fictício para teste",
  "motivo_alteracao": "Complementação do registro",
  "versao": 2
}
```

**Concluída quando:** a edição mantém autoria e versões anteriores, exige motivo após finalização e detecta concorrência sem perder conteúdo.

## 12. Etapa 10 — Implementar listagens conforme a necessidade do front

Criar filtros explícitos para cada tela. O front escolhe valores de parâmetros conhecidos; o back escolhe SQL, joins e colunas. Não criar endpoint que recebe SQL, nome de tabela, cláusula WHERE ou colunas arbitrárias.

| Tela / solicitação | Exemplo de consulta alvo | Resposta necessária |
| --- | --- | --- |
| Buscar paciente | `GET /pacientes?nome=Maria&pagina=1&limite=20` | ID, nome e resumo cadastral autorizado |
| Localizar por CPF | `GET /pacientes?cpf=<cpf_normalizado>` | Busca exata, sem incluir documento desnecessário no retorno |
| Histórico de visitas | `GET /atendimentos?id_paciente=123&pagina=1&limite=20` | Número, datas, tipo e status |
| Fila de triagem | `GET /atendimentos?status=AGUARDANDO_TRIAGEM&ordenar=abertura&direcao=asc` | Identificação mínima e dados da fila |
| Atendimentos por período | `GET /atendimentos?data_inicio=2026-10-01&data_fim=2026-10-26&tipo_atendimento=SUS` | Resumo administrativo, sem conteúdo clínico |
| Prontuários do paciente | `GET /prontuarios?id_paciente=123&pagina=1&limite=20` | IDs, atendimento, datas, estado e autor autorizado |
| Prontuário do atendimento | `GET /prontuarios?id_atendimento=456` | Resumo do registro vinculado |

Passo a passo:

1. Definir para cada endpoint a lista fechada de filtros, tipos, tamanho máximo e combinações aceitas. Rejeitar parâmetros desconhecidos para detectar erro de integração.
2. Definir paginação comum: `pagina` padrão 1, `limite` padrão 20 e máximo 100; rejeitar valores fora do intervalo.
3. Parametrizar valores. Nomes de coluna e direção de ordenação devem vir de mapa fixo no servidor, pois placeholders de valores não tornam identificadores SQL seguros.
4. Dar ordenação estável: por exemplo, abertura e ID como desempate. Não implementar prioridade clínica só por ordenação alfabética do prefixo.
5. Definir datas: filtros de atendimento consideram abertura; de prontuário, criação. Interpretar datas civis no fuso combinado do serviço e consultar intervalo com início inclusivo e fim exclusivo do dia seguinte.
6. Buscar prontuários por paciente com JOIN pelo atendimento, mantendo o vínculo único definido no modelo.
7. Usar colunas explícitas e DTO de resumo. Buscar conteúdo clínico completo somente no detalhe autorizado; evitar `SELECT *` nas tabelas de interface.
8. Retornar total usando os mesmos filtros e escopo de permissão aplicados aos dados.
9. Configurar logs para não registrar CPF ou filtros sensíveis completos, especialmente quando estiverem na query string.
10. No front, montar a query com `URLSearchParams`, reiniciar página ao mudar filtro e evitar respostas fora de ordem com cancelamento ou identificação da requisição atual.

```json
{
  "dados": [],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 0,
    "total_paginas": 0
  }
}
```

**Concluída quando:** filtros combinados, paginação, lista vazia e ordenação são previsíveis; cada perfil recebe somente os registros e campos permitidos.

## 13. Etapa 11 — Conectar o front aos fluxos reais

### 13.1 Módulos de chamada da API

1. Extrair de `script.js` o fetch para `api/cliente.js`, centralizando base URL, headers, tratamento de JSON, resposta sem corpo e erros HTTP/rede.
2. Criar funções específicas: `criarPaciente`, `obterPaciente`, `alterarPaciente`, `listarPacientes`, e equivalentes de atendimentos/prontuários.
3. Essas funções recebem valores e devolvem dados ou erro; não exibem `alert`, não acessam DOM e não possuem regras de aparência.
4. Se a sessão usar cookie, configurar envio de credenciais conforme a origem escolhida e proteção de requisições de escrita. Manter a decisão de autenticação centralizada.
5. Não repetir POST/PATCH automaticamente após timeout: a gravação pode ter sido concluída sem a resposta chegar. Definir reconciliação/idempotência para comandos que precisem de repetição segura.

### 13.2 Scripts de interface e CSS

1. Mover a navegação por etapas do HTML para `ui/cadastro_ui.js`, preservando IDs/classes necessários e aparência atual.
2. Remover handlers inline duplicados após ligar os eventos com `addEventListener`. O módulo de UI importa as funções de API; não depende de função do módulo exposta automaticamente no `window`.
3. Associar um único fluxo ao `submit` do formulário e usar `preventDefault`. Transformar o botão final em submit, preservando os botões de navegação como `type="button"`.
4. Validar as duas etapas, inclusive preenchimentos ainda ocultos. Se houver erro na etapa escondida, mostrar essa etapa antes de focar o campo. Corrigir divergências entre asterisco visual, `required` e contrato do back.
5. Montar o payload canônico e chamar `criarPaciente`. Exibir sucesso somente após resposta de criação; impedir clique duplicado enquanto aguarda e restaurar controles em `finally`.
6. Renderizar texto retornado com `textContent` e criação segura de elementos, sem concatenar valores do paciente em `innerHTML`.
7. Trocar a linha estática por `listarPacientes` e implementar ações de seleção/edição por ID persistido. Guardar versão e ID no estado da tela.
8. Criar telas ou áreas de atendimentos e prontuários reaproveitando os estilos existentes. Cada ação segue consulta -> formulário -> comando -> resposta -> atualização visual.
9. Prever carregamento, lista vazia, validação por campo, indisponibilidade da API e conflito de versão. Em erro, manter o que o usuário digitou para correção.
10. Não manter prontuários, documentos ou senha em `localStorage`, URL de navegação ou logs. Estado temporário de formulário fica em memória durante a interação.

CSS continua em `Frontend/style`; JS de UI apenas alterna classes/estados quando necessário. O comentário atual de “scripts de estilo” inclui validação e navegação, que são comportamento de interface.

**Concluída quando:** o botão realmente chama a API, a tabela reflete o banco, editar preserva os campos não alterados e falhas não produzem falso sucesso.

## 14. Etapa 12 — Autenticação, permissões e rastreabilidade

O login atual não autentica usuários. Antes de liberar registros reais, implementar ou integrar o mecanismo de autenticação escolhido pelo projeto; não gerar autoria a partir de `id_usuario` enviado no corpo.

1. Definir os perfis necessários, por exemplo recepção, triagem e profissional responsável, como proposta a validar com a equipe.
2. Especificar quais perfis podem cadastrar/editar paciente, abrir/transicionar atendimento e ler/criar/corrigir prontuário.
3. Proteger todas as rotas no back, inclusive detalhe, listagem e histórico; validar acesso ao registro, não apenas se existe login.
4. Derivar usuário e permissões da sessão autenticada. Não considerar CORS como mecanismo de autenticação.
5. Registrar autoria e alterações administrativas/clínicas com identificadores e timestamps, sem imprimir o conteúdo dos prontuários em logs operacionais.
6. Restringir a conta de banco às operações necessárias e manter segredos fora do front e do repositório. Para uso publicado, configurar HTTPS e as proteções da sessão escolhida.
7. Usar somente dados sintéticos até que autenticação, permissões e trilha de alterações estejam validadas.

**Concluída quando:** usuários sem sessão/permissão não leem nem alteram registros por troca de ID ou filtros, e cada escrita possui autoria verificável.

## 15. Etapa 13 — Validar a conclusão

Substituir o teste demonstrativo atual por verificações com asserções. Banco em memória pode apoiar regra isolada; não comprova SQL, constraints, rollback ou funcionamento MySQL.

| Nível | Casos mínimos | Resultado esperado |
| --- | --- | --- |
| Regras isoladas | CPF válido/inválido/repetido/tipo incorreto; datas; aniversário; campos editáveis | Retornos estáveis e validação previsível |
| Pacientes + MySQL | Criar, consultar, editar parcialmente, limpar opcional, duplicar CPF, ID ausente | Persistência correta, `409`/`404` adequados e preservação dos demais campos |
| Atendimentos + MySQL | Paciente ausente; duas aberturas concorrentes; reinício; transições | FKs/unicidade válidas e persistência sem contador em memória |
| Prontuários + MySQL | Criar, revisar, finalizar/corrigir, consultar histórico, conflito de versão | Histórico íntegro, autor correto e bloqueio de sobrescrita |
| Transações | Induzir falha na segunda gravação de operação composta | Nenhuma gravação parcial permanece |
| Listagens | Filtros combinados, período, paginação, empate, lista vazia, parâmetro inválido | Resultado estável e restrito ao contrato |
| Autorização | Sem sessão, perfil inadequado, troca de ID e filtros | `401`/`403` conforme a situação e nenhuma exposição indevida |
| Navegador + API | Cadastro real, editar, abrir atendimento, prontuário e listas | Network confirma URL, método, corpo e status; tela apresenta o resultado persistido |
| Falhas de integração | API indisponível, erro de validação, timeout, clique duplo, duas abas | Sem falso sucesso, duplicidade evitada e conteúdo digitado preservado |

Depois de configurar os scripts, executar `npm test` e `npm start` no ambiente de desenvolvimento. Build/lint somente se forem adicionados ao projeto; hoje não há scripts correspondentes. Separar no relatório: análise estática, teste automatizado, teste MySQL e teste no navegador.

## 16. Ordem prática de entregas

Cada item deve ser implementado e validado antes de avançar aos dependentes. Conforme sua orientação, apresentar os arquivos e impactos e obter confirmação antes de iniciar cada etapa de implementação; este documento não autoriza alterações futuras de código ou banco.

1. **Base executável:** dependências, imports, servidor único, configuração e proteção de segredos.
2. **Modelo e contrato:** conferir banco real, aprovar cardinalidades/campos, preparar migrations e alinhar JSON.
3. **Autenticação e autorização:** definir identidade e permissões antes da liberação das rotas com dados reais; usar fixtures durante o desenvolvimento.
4. **Pacientes:** cadastro, detalhe, PATCH e listagem com testes MySQL.
5. **Primeira integração vertical:** formulário atual -> API -> banco -> tabela -> edição de paciente.
6. **Atendimentos:** criação, detalhe, transições, histórico, filtros e integração das telas.
7. **Prontuários:** criação, detalhe, revisão, histórico, filtros e integração das telas.
8. **Fechamento:** concorrência, rollback, falhas de rede, permissões e validação ponta a ponta.

Decisões ainda necessárias: esquema real do banco, armazenamento do endereço, campos clínicos, cardinalidade do prontuário, matriz de status/perfis, política de atendimento aberto e mecanismo de autenticação. Resolva cada uma antes da implementação que dependa dela.

## 17. Checklist de encerramento

- [ ] Instalação reproduzível, scripts funcionais e uma única API inicializável.
- [ ] Banco documentado e migrations validadas em ambiente de teste.
- [ ] Cadastro, consulta, alteração e listagem de pacientes completos.
- [ ] Criação, consulta, alteração e listagem de atendimentos completos.
- [ ] Criação, consulta, revisão e listagem de prontuários completos.
- [ ] Histórico e concorrência tratados para alterações.
- [ ] Campos enviados pelo front possuem destino, validação e retorno definidos.
- [ ] Front separado entre CSS, comportamento de interface e chamadas HTTP.
- [ ] Login/permissões implementados no servidor e integrados ao front.
- [ ] Nenhum sucesso visual sem confirmação da API.
- [ ] Testes de regras, MySQL e navegador executados e registrados separadamente.
- [ ] Contrato final de endpoints e configuração atualizado para a equipe.

## 18. Limites desta análise

Foram lidos os arquivos de back, front, configuração, manifesto e lockfile presentes no repositório. Não houve conexão com MySQL, alteração de esquema, instalação de dependências ou execução da API no navegador. O esquema e a disponibilidade do banco não foram confirmados.

O Node respondeu à consulta de versão (`v20.18.1`), mas a tentativa de consultar a versão do npm falhou com `EPERM` ao resolver `C:\Users\User` no ambiente restrito. Não foi executado `npm test`; o script atual é um placeholder que termina com erro. A documentação descreve verificações a realizar, não resultados de testes funcionais já concluídos.
