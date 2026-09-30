# PRISMA — código completo do site

Exportação da versão 5 do ChatGPT Sites, publicada em 27/09/2026.
Commit de origem: 51e58fa0ce836f28a7b30f7cf32895edcb037e49.
Site: https://prisma.kaijvs.chatgpt.site

## Conteúdo

Inclui páginas, estilos, imagens, eventos, painéis de administrador e colaborador, propostas de cidades, bilheteria fictícia, controle de manutenção, servidor, esquema do banco, migrações e testes.

Não inclui senhas reais, sessões, banco de produção, contratos enviados por usuários, pedidos, dados de visitantes, dependências instaladas ou histórico Git. As imagens do design original estão em public/. Arquivos enviados pelo painel ficam no armazenamento do Sites e não integram este código-fonte.

## Colocar no GitHub

1. Extraia este ZIP.
2. Coloque o conteúdo extraído na raiz do repositório, preservando as pastas e os arquivos ocultos .gitignore, .env.example e .openai/hosting.json.
3. Não envie somente o ZIP: o código precisa estar extraído para ser editado no GitHub.
4. O repositório pode permanecer privado.

Enviar ou editar o código no GitHub não atualiza automaticamente o site hospedado no Sites.

## Executar no computador

Requer Node.js 24 ou superior e npm. Dentro da pasta extraída, execute:

```sh
npm ci
npm run build
npm run dev
```

Abra http://127.0.0.1:4173.

O ambiente local usa arquivos na pasta .local/, ignorada pelo Git. Logins exclusivos de teste local:

- Administrador: 111111 / 123456
- Colaborador: 222222 / 654321

Esses acessos não são os do site publicado. O servidor de desenvolvimento deve ficar restrito ao computador local.

Para executar os testes:

```sh
npm test
```

## Pastas

- public/: páginas, estilos, imagens e código do navegador.
- src/: servidor, autenticação e APIs.
- db/: definição das tabelas.
- drizzle/: migrações e histórico do esquema, sem registros dos usuários.
- scripts/: geração, preparação e execução local.
- tests/: testes de autenticação, ingressos e manutenção.
- .openai/hosting.json: identificação e recursos do projeto no Sites.

## Hospedagem

O projeto usa um Worker compatível com Cloudflare, D1 (DB), R2 (BUCKET) e arquivos estáticos (ASSETS). O Sites configura esses serviços. GitHub Pages sozinho não executa o servidor, os logins e o banco deste projeto. Para outro provedor, será necessário configurar recursos equivalentes e adaptar a publicação.

As variáveis de produção necessárias estão listadas, sem valores, em .env.example. Os logins e hashes reais ficam no ambiente de hospedagem. Não os coloque no GitHub.

## Pendência conhecida

O código contém o modo de manutenção, e os testes locais passaram. Foi relatado que o aviso não aparecia para visitantes no site publicado. A configuração de produção estava ativada na última verificação, mas o diagnóstico da resposta sem login foi interrompido. Esta exportação preserva o código publicado; não apresenta essa falha como corrigida.
