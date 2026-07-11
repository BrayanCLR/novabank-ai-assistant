export type Locale = 'es' | 'en' | 'pt';

export const locales: { code: Locale; label: string }[] = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

type LandingContent = {
  nav: { features: string; how: string; about: string; cta: string };
  hero: {
    eyebrow: string;
    headline: string;
    subhead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string;
    mockupQuestion: string;
    mockupAnswer: string;
  };
  about: {
    eyebrow: string;
    title: string;
    novabankTitle: string;
    novabankBody: string;
    novabankAiTitle: string;
    novabankAiBody: string;
  };
  how: {
    eyebrow: string;
    title: string;
    steps: { title: string; body: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  footer: { rights: string; credit: string };
};

export const content: Record<Locale, LandingContent> = {
  es: {
    nav: {
      features: 'Características',
      how: 'Cómo funciona',
      about: 'Quiénes somos',
      cta: 'Iniciar chat',
    },
    hero: {
      eyebrow: '// asistente corporativo',
      headline: 'Cada política de NovaBank, a una pregunta de distancia.',
      subhead:
        'Un agente con RAG real que busca en tu documentación interna y responde citando la fuente exacta.',
      ctaPrimary: 'Iniciar chat',
      ctaSecondary: 'Cómo funciona',
      trust: '9 formatos soportados · búsqueda semántica · respuestas citadas',
      mockupQuestion: '¿Límite diario de una cuenta empresarial?',
      mockupAnswer: '$400.000.000 COP según Limites_Transaccionales.xlsx',
    },
    about: {
      eyebrow: '// quiénes somos',
      title: 'Una fintech seria, respaldada por IA seria.',
      novabankTitle: 'NovaBank',
      novabankBody:
        'NovaBank es una entidad fintech digital que opera bajo estrictos estándares de cumplimiento normativo, prevención de fraude y protección de datos financieros. Cada proceso — desde la apertura de cuentas hasta la validación de transacciones — sigue protocolos documentados de KYC, AML y gestión de riesgo.',
      novabankAiTitle: 'NovaBank AI',
      novabankAiBody:
        'NovaBank AI es el asistente de inteligencia corporativa que conecta a cada colaborador con esa documentación en segundos. No es un chatbot genérico: usa búsqueda semántica real sobre la base de conocimiento interna y cita la fuente exacta de cada respuesta, para que nunca tengas que confiar a ciegas.',
    },
    how: {
      eyebrow: '// cómo funciona',
      title: 'De la pregunta a la respuesta, en cuatro pasos.',
      steps: [
        { title: 'Preguntas en lenguaje natural', body: 'Sin comandos ni sintaxis especial. Escribes como le preguntarías a un compañero.' },
        { title: 'Búsqueda semántica real', body: 'El agente embebe tu pregunta y busca los fragmentos más relevantes en la base vectorial, no por palabra clave.' },
        { title: 'Respuesta generada y citada', body: 'Gemini construye la respuesta usando solo esos fragmentos, y siempre indica de qué documento salió.' },
        { title: 'Memoria de la conversación', body: 'Las preguntas de seguimiento heredan el contexto — no repites todo desde cero.' },
      ],
    },
    features: {
      eyebrow: '// qué resuelve',
      title: 'Cuatro piezas, un solo agente.',
      items: [
        { title: 'Búsqueda semántica', body: 'Embeddings reales, no coincidencia de palabras clave.' },
        { title: '9 formatos', body: 'PDF, DOCX, XLSX, PPTX, CSV, JSON, TXT, HTML, MD.' },
        { title: 'Memoria real', body: 'Recuerda la conversación, no solo la última pregunta.' },
        { title: 'Siempre citado', body: 'Cada respuesta señala el documento exacto de origen.' },
      ],
    },
    footer: { rights: '© 2026 NovaBank AI', credit: 'Hecho por Brayan López' },
  },
  en: {
    nav: {
      features: 'Features',
      how: 'How it works',
      about: 'About',
      cta: 'Start chat',
    },
    hero: {
      eyebrow: '// corporate assistant',
      headline: 'Every NovaBank policy, one question away.',
      subhead:
        'A real RAG agent that searches your internal documentation and answers citing the exact source.',
      ctaPrimary: 'Start chat',
      ctaSecondary: 'How it works',
      trust: '9 formats supported · semantic search · cited answers',
      mockupQuestion: 'Daily limit for a business account?',
      mockupAnswer: '$400,000,000 COP per Limites_Transaccionales.xlsx',
    },
    about: {
      eyebrow: '// about us',
      title: 'A serious fintech, backed by serious AI.',
      novabankTitle: 'NovaBank',
      novabankBody:
        'NovaBank is a digital fintech operating under strict regulatory compliance, fraud prevention, and financial data protection standards. Every process — from account opening to transaction validation — follows documented KYC, AML, and risk management protocols.',
      novabankAiTitle: 'NovaBank AI',
      novabankAiBody:
        'NovaBank AI is the corporate intelligence assistant that connects every employee to that documentation in seconds. It is not a generic chatbot: it runs real semantic search over the internal knowledge base and cites the exact source of every answer, so you never have to take it on faith.',
    },
    how: {
      eyebrow: '// how it works',
      title: 'From question to answer, in four steps.',
      steps: [
        { title: 'Ask in plain language', body: 'No commands, no special syntax. Write like you would ask a colleague.' },
        { title: 'Real semantic search', body: 'The agent embeds your question and retrieves the most relevant chunks from the vector store, not keyword matches.' },
        { title: 'Cited, generated answer', body: 'Gemini builds the answer using only those chunks, and always names the source document.' },
        { title: 'Conversation memory', body: 'Follow-up questions inherit context — you never start over.' },
      ],
    },
    features: {
      eyebrow: '// what it solves',
      title: 'Four pieces, one agent.',
      items: [
        { title: 'Semantic search', body: 'Real embeddings, not keyword matching.' },
        { title: '9 formats', body: 'PDF, DOCX, XLSX, PPTX, CSV, JSON, TXT, HTML, MD.' },
        { title: 'Real memory', body: 'Remembers the conversation, not just the last question.' },
        { title: 'Always cited', body: 'Every answer points to the exact source document.' },
      ],
    },
    footer: { rights: '© 2026 NovaBank AI', credit: 'Built by Brayan López' },
  },
  pt: {
    nav: {
      features: 'Recursos',
      how: 'Como funciona',
      about: 'Quem somos',
      cta: 'Iniciar chat',
    },
    hero: {
      eyebrow: '// assistente corporativo',
      headline: 'Cada política do NovaBank, a uma pergunta de distância.',
      subhead:
        'Um agente com RAG real que busca na sua documentação interna e responde citando a fonte exata.',
      ctaPrimary: 'Iniciar chat',
      ctaSecondary: 'Como funciona',
      trust: '9 formatos suportados · busca semântica · respostas citadas',
      mockupQuestion: 'Limite diário de uma conta empresarial?',
      mockupAnswer: '$400.000.000 COP conforme Limites_Transaccionales.xlsx',
    },
    about: {
      eyebrow: '// quem somos',
      title: 'Uma fintech séria, apoiada por IA séria.',
      novabankTitle: 'NovaBank',
      novabankBody:
        'NovaBank é uma fintech digital que opera sob rígidos padrões de conformidade regulatória, prevenção de fraude e proteção de dados financeiros. Cada processo — da abertura de contas à validação de transações — segue protocolos documentados de KYC, AML e gestão de risco.',
      novabankAiTitle: 'NovaBank AI',
      novabankAiBody:
        'NovaBank AI é o assistente de inteligência corporativa que conecta cada colaborador a essa documentação em segundos. Não é um chatbot genérico: usa busca semântica real sobre a base de conhecimento interna e cita a fonte exata de cada resposta, para que você nunca precise confiar cegamente.',
    },
    how: {
      eyebrow: '// como funciona',
      title: 'Da pergunta à resposta, em quatro passos.',
      steps: [
        { title: 'Pergunte em linguagem natural', body: 'Sem comandos nem sintaxe especial. Escreva como perguntaria a um colega.' },
        { title: 'Busca semântica real', body: 'O agente vetoriza sua pergunta e recupera os trechos mais relevantes da base vetorial, não por palavra-chave.' },
        { title: 'Resposta gerada e citada', body: 'O Gemini constrói a resposta usando apenas esses trechos, e sempre indica de qual documento saiu.' },
        { title: 'Memória da conversa', body: 'Perguntas de acompanhamento herdam o contexto — você nunca começa do zero.' },
      ],
    },
    features: {
      eyebrow: '// o que resolve',
      title: 'Quatro peças, um só agente.',
      items: [
        { title: 'Busca semântica', body: 'Embeddings reais, não correspondência de palavras-chave.' },
        { title: '9 formatos', body: 'PDF, DOCX, XLSX, PPTX, CSV, JSON, TXT, HTML, MD.' },
        { title: 'Memória real', body: 'Lembra da conversa, não só da última pergunta.' },
        { title: 'Sempre citado', body: 'Cada resposta aponta o documento exato de origem.' },
      ],
    },
    footer: { rights: '© 2026 NovaBank AI', credit: 'Feito por Brayan López' },
  },
};