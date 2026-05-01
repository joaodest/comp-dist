# Voxel Royale

## 📂 Estrutura do Projeto

```text
/voxel-royale
├── proto/              # Contratos do sistema (.proto) - A "fonte da verdade"
├── gen/                # Código Go gerado automaticamente (NÃO EDITAR)
├── services/           # Lógica de implementação dos serviços (gateway, lobby, game)
├── Makefile            # Automação de compilação
├── go.mod              # Gerenciamento de dependências
└── README.md           # Este arquivo
```

## 🚀 Como Começar

### 1. Clone o repositório

```bash
git clone <URL_DO_SEU_REPO>
cd voxel-royale
```

### 2. Inicialize as dependências

```bash
go mod download
```

### 3. Gerar o código gRPC

Sempre que alterar qualquer arquivo dentro da pasta `proto/`, execute na raiz:

```bash
make gen-proto
```

Isso atualizará os arquivos na pasta `gen/` automaticamente.

### 4. Rodar os serviços

(Instruções específicas para cada serviço serão adicionadas conforme o desenvolvimento avançar).

## 📜 Regras de Colaboração (Time de 9 pessoas)

Para mantermos o projeto organizado e funcional, seguimos estas regras estritas:

- **Contratos primeiro:** Qualquer mudança na comunicação entre serviços deve ser feita primeiro no arquivo `.proto`. Não crie rotas ou campos manualmente no código Go sem atualizar o contrato.
- **Não edite a pasta gen/:** Esta pasta é gerada automaticamente pelo compilador. Qualquer alteração manual aqui será perdida na próxima compilação.
- **Commits:** Inclua sempre o arquivo `.proto` modificado e o arquivo gerado correspondente em `gen/` no mesmo commit.
- **Makefile:** O `make gen-proto` é a forma padrão de compilar os contratos. Evite comandos manuais longos no terminal.
- **Formatação:** Utilize o "Format on Save" do VS Code (com a extensão `vscode-proto3`) para garantir que todos os arquivos `.proto` sigam o mesmo padrão visual.

## 🤝 Contato

Responsáveis pela arquitetura: **Victor Souza Lima** e equipe de **TI5**.
