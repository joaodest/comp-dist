## 📂 Estrutura do Projeto

```text
/voxel-royale
├── cmd/                # Pontos de entrada dos executáveis
│   ├── gateway/        # Reverse Proxy (Tradutor HTTP -> gRPC)
│   └── server/         # Core Server (Lógica gRPC)
├── proto/              # Contratos (.proto) - A "Fonte da Verdade"
├── gen/                # Código Go autogerado (NÃO EDITAR)
├── services/           # Implementação da lógica de negócio
├── third_party/        # Dependências de terceiros (Google APIs)
├── Makefile            # Automação de builds e execução
├── go.mod              # Módulo Go e dependências
└── README.md           # Documentação principal

🛠 Pré-requisitos
Para compilar e rodar o projeto, você precisará de:

Go (1.22+)

Protobuf Compiler (protoc): Baixe no site oficial ou via gerenciador de pacotes.

Plugins Go para Protoc:

Bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
go install [github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest](https://github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@latest)

📦 Google APIs (Dependências Externas)

O projeto utiliza anotações do Google para mapear chamadas gRPC para rotas HTTP (REST). Essas definições não vêm por padrão no compilador e precisam estar presentes na pasta third_party.

Como configurar:
Caso a pasta third_party/googleapis esteja vazia, você deve baixar os arquivos necessários do repositório oficial do Google:

Bash
mkdir -p third_party
cd third_party
git clone --depth 1 [https://github.com/googleapis/googleapis](https://github.com/googleapis/googleapis)
Por que isso é necessário?
O arquivo match.proto importa google/api/annotations.proto. Sem esses arquivos locais, o protoc não consegue gerar o arquivo match.pb.gw.go responsável pelo funcionamento do Gateway.

🚀 Como Começar

1. Inicializar o Módulo
Bash
go mod tidy

2. Gerar Código (Sempre que alterar o .proto)
Bash
make gen-proto

3. Rodar o Sistema
Abra dois terminais na raiz do projeto:

Terminal 1 (Backend gRPC):

Bash
make run-server
Terminal 2 (API Gateway HTTP):

Bash
make run-gateway
O servidor estará aceitando conexões gRPC na porta :50051 e o Gateway estará ouvindo requisições HTTP na porta :8080.
```
