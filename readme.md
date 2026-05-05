# Apostila.ai — Frontend

Interface web da plataforma educacional **Apostila.ai**, um repositório compartilhado para turmas gerarem apostilas, simulados, mapas mentais e flashcards com IA.

## Stack

- **React 18** + Vite
- **Supabase** — autenticação e banco de dados compartilhado
- Deploy: **Vercel**

## Funcionalidades

### Autenticação
- Login e cadastro com e-mail e senha via Supabase Auth
- Repositório compartilhado — todos os usuários da turma veem os mesmos dados

### Matérias
Matérias fixas pré-configuradas: **Programação, UX, Orientação, Liderança, Negócios, Matemática**

### Autoestudos
- Adicionar autoestudos com título, semana, tipo, link ou PDF
- Leitura automática de links (web scraping via backend)
- Extração de texto de PDFs (até 50.000 caracteres)
- Upload automático do PDF original para o Google Drive (`Matéria → Semana → Autoestudo → arquivo.pdf`)
- Campo **Notas para a IA** — instruções específicas para o gerador
- Editar autoestudos existentes clicando no card
- Busca por título e ordenação por semana, data, nome ou tipo
- Visualização em grade (⊞) ou por semana (☰)
- Quem adicionou cada conteúdo (nome do usuário)
- Confirmação antes de deletar

### Geração de Materiais com IA
Seis modos de geração, sempre filtrando por semana:

| Modo | Descrição |
|------|-----------|
| 📋 Apostila Completa | Resumo organizado e didático |
| 🗺️ Mapa Mental | Estrutura visual de conceitos |
| 🎯 Simulado Objetiva | 12 questões com somatório (padrão faculdade) |
| ✍️ Simulado Dissertativo | 6 questões com critérios de correção detalhados |
| 🃏 Flashcards | 20 cards de revisão ativa |
| 🚨 Desespero para Prova | Revisão intensiva de última hora |

Após gerar:
- Preview do material na tela
- **⬇ Baixar PDF** — gera PDF formatado com capa colorida
- **💾 Salvar** — salva no Supabase para baixar depois
- **📁 Enviar para Drive** — envia PDF para o Google Drive compartilhado da turma

### Calendário
- Grade mensal navegável
- Adicionar eventos com tipo (Prova, Trabalho, Apresentação, Evento), matéria, data e horário
- Painel lateral com abas **Próximos** e **Passados**
- Badge na sidebar com contagem de eventos futuros

### Calculadora de Notas
- Tela exclusiva por usuário (dados em localStorage por user ID)
- Importa HTML exportado do Adalove
- Dashboard com métricas por tipo de atividade
- Simulação de nota final com participação (A-E) e multiplicadores configuráveis
- Calcula nota necessária na prova para atingir a meta
- Tabela de atividades filtrável por semana com edição de notas

## Configuração

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=https://seu-backend.railway.app
```

### Instalação

```bash
npm install
npm run dev
```

### Build para produção

```bash
npm run build
```

## Deploy (Vercel)

1. Conecte o repositório ao Vercel
2. Configure a variável de ambiente `VITE_API_URL`
3. O deploy é automático a cada push na branch `main`

## Estrutura de arquivos

```
apostila-frontend/
├── src/
│   ├── App.jsx          # Aplicação completa (componente único)
│   └── main.jsx         # Entry point
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

## Banco de dados (Supabase)

Tabelas compartilhadas entre todos os usuários:

| Tabela | Descrição |
|--------|-----------|
| `subjects` | Matérias (seed automático no primeiro login) |
| `items` | Autoestudos |
| `cal_events` | Eventos do calendário |
| `saved_materials` | Materiais gerados e salvos |
| `usage_log` | Log de uso da API Anthropic |

> Notas da calculadora ficam no `localStorage` do navegador, separadas por `userId`.
