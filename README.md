Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Voxel Royale  Sistema de backend escalável e distribuído para o projeto **Voxel Royale**. A arquitetura utiliza **gRPC** para comunicação interna de alta performance e **gRPC-Gateway** para expor endpoints RESTful compatíveis com clientes Web e Mobile.  ## 📂 Estrutura do Projeto  ```text  /voxel-royale  ├── cmd/                # Pontos de entrada dos executáveis  │   ├── gateway/        # Reverse Proxy (Tradutor HTTP -> gRPC)  │   └── server/         # Core Server (Lógica gRPC)  ├── proto/              # Contratos (.proto) - A "Fonte da Verdade"  ├── gen/                # Código Go autogerado (NÃO EDITAR)  ├── services/           # Implementação da lógica de negócio  ├── third_party/        # Dependências de terceiros (Google APIs)  ├── Makefile            # Automação de builds e execução  ├── go.mod              # Módulo Go e dependências  └── README.md           # Documentação principal   `

🛠 Pré-requisitos
-----------------

Para compilar e rodar o projeto, você precisará de:

1.  **Go (1.22+)**
    
2.  **Protobuf Compiler (protoc)**: Baixe no site oficial ou via gerenciador de pacotes.
    
3.  **Plugins Go para Protoc**:
    

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   go install google.golang.org/protobuf/cmd/protoc-gen-go@latest  go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest  go install [github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@l   `

📦 Google APIs (Dependências Externas)
--------------------------------------

O projeto utiliza anotações do Google para mapear chamadas gRPC para rotas HTTP (REST). Essas definições não vêm por padrão no compilador e precisam estar presentes na pasta third\_party.

### Como configurar:

Caso a pasta third\_party/googleapis esteja vazia, você deve baixar os arquivos necessários do repositório oficial do Google:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   mkdir -p third_party  cd third_party  git clone --depth 1 [https://github.com/googleapis/googleapis](https://github.com/googleapis/googleapis)   `

**Por que isso é necessário?**O arquivo match.proto importa google/api/annotations.proto. Sem esses arquivos locais, o protoc não consegue gerar o arquivo match.pb.gw.go responsável pelo funcionamento do Gateway.

🚀 Como Começar
---------------

### 1\. Inicializar o Módulo

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   go mod tidy   `

### 2\. Gerar Código (Sempre que alterar o .proto)

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   make gen-proto   `

### 3\. Rodar o Sistema

Abra dois terminais na raiz do projeto:

*   Bashmake run-server
    
*   Bashmake run-gateway
    

O servidor estará aceitando conexões gRPC na porta :50051 e o Gateway estará ouvindo requisições HTTP na porta :8080.