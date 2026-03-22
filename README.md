# zicao.dev — IA de Programação

> Motor cascata com DNA do Claude: Claude → Groq → Gemini → Mistral → OpenRouter → xAI

---

## 🚀 Deploy no Vercel (10 minutos)

### Passo 1 — Criar conta no GitHub
1. Acesse **github.com** e crie uma conta (se não tiver)
2. Clique em **New repository**
3. Nome: `zicao-dev` → **Create repository**

### Passo 2 — Subir os arquivos
Após criar o repositório, faça upload de todos os arquivos desta pasta:
- `vercel.json`
- `package.json`
- `.gitignore`
- `api/chat.js`
- `public/index.html`

Clique em **uploading an existing file** na página do repositório.

### Passo 3 — Conectar ao Vercel
1. Acesse **vercel.com** e crie uma conta (use o GitHub para entrar)
2. Clique em **Add New → Project**
3. Selecione o repositório `zicao-dev`
4. Clique em **Deploy** (sem mexer em nada)

### Passo 4 — Adicionar as chaves de API
No Vercel, acesse: **seu projeto → Settings → Environment Variables**

Adicione as chaves (pelo menos Groq + Gemini para uso grátis):

| Nome da variável | Onde pegar | Custo |
|---|---|---|
| `CLAUDE_API_KEY` | console.anthropic.com | Pago (opcional, mas recomendado) |
| `GROQ_API_KEY` | console.groq.com | **GRÁTIS** |
| `GEMINI_API_KEY` | aistudio.google.com | **GRÁTIS** |
| `MISTRAL_API_KEY` | console.mistral.ai | **GRÁTIS** |
| `OPENROUTER_API_KEY` | openrouter.ai/keys | **GRÁTIS** |
| `XAI_API_KEY` | console.x.ai | $25 grátis |

### Passo 5 — Redeploy
Após adicionar as variáveis:
1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**

✅ **Pronto!** Sua IA estará online em `zicao-dev.vercel.app`

---

## ⚡ Como funciona o motor cascata

```
Você digita
    ↓
Vercel (servidor seguro)
    ↓
1. Tenta Claude Sonnet    → sucesso? Responde
2. Se falhar → Groq       → sucesso? Responde
3. Se falhar → Gemini     → sucesso? Responde
4. Se falhar → Mistral    → sucesso? Responde
5. Se falhar → OpenRouter → sucesso? Responde
6. Se falhar → xAI Grok   → sucesso? Responde
```

As chaves ficam **seguras no servidor** — nunca aparecem no navegador.

---

## 🧠 DNA do Claude

Todos os modelos de fallback recebem o mesmo system prompt do Claude:
- Responde em português brasileiro fluente
- Código sempre completo, nunca cortado
- Raciocínio explicado quando relevante
- Sem enrolação, direto ao ponto
- Qualidade acima de tudo

---

## 🌐 Acesso

Após o deploy, acesse de qualquer lugar:
- **PC:** `zicao-dev.vercel.app`
- **Celular:** mesmo link
- **Tablet:** mesmo link
- **Qualquer navegador:** Chrome, Firefox, Safari, Edge

---

Feito com 🔥 por zicao.dev
