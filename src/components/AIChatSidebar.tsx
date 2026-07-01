import React, { useState, useEffect, useRef } from 'react';
import { useApp, AVAILABLE_LANGUAGES, Category, Phrase } from '../context/AppContext';
import { 
  Sparkles, X, Send, Trash2, Plus, ArrowRight, Loader2, 
  FolderPlus, AlertCircle, Copy, Check, MessageSquare, BookOpen,
  Brain, ChevronDown, ChevronUp, History, Search, ArrowLeft, Layers,
  Folder, ListChecks, FilePlus2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

interface AIPrompt {
  id: string;
  name: string;
  category: string;
  promptText: string;
}

const DEFAULT_PROMPTS: AIPrompt[] = [
  {
    id: 'p1',
    name: 'Explicação Gramatical em Contexto',
    category: 'Gramática',
    promptText: 'Por favor, analise a seguinte frase em inglês no contexto de uma conversa diária: "[FRASE]". Destaque as estruturas gramaticais principais, explique o tempo verbal utilizado e forneça 3 frases alternativas semelhantes com explicações rápidas das diferenças.'
  },
  {
    id: 'p2',
    name: 'Nuances e Sinônimos',
    category: 'Vocabulário',
    promptText: 'Como um falante nativo diferencia as palavras "[PALAVRA_1]" e "[PALAVRA_2]" no inglês falado informal? Forneça exemplos práticos de diálogos onde uma é preferida em relação à outra, explicando a nuance de tom.'
  },
  {
    id: 'p3',
    name: 'Conexões de Pronúncia (Connected Speech)',
    category: 'Pronúncia',
    promptText: 'Descreva os fenômenos de pronúncia conectada (linking, reductions, e flapped sounds) que ocorrem ao falar a frase "[FRASE]" em velocidade natural. Forneça uma transcrição fonética simplificada e dicas de articulação.'
  },
  {
    id: 'p4',
    name: 'Reescrita Natural e Fluidez',
    category: 'Escrita',
    promptText: 'Reescreva o seguinte texto em inglês para torná-lo 100% natural, imitando a fala de um nativo de forma fluida. Classifique a reescrita em duas versões (informal/amigos e neutra/trabalho) e comente brevemente o que foi modificado e o porquê: "[TEXTO]"'
  },
  {
    id: 'p5',
    name: 'Criação de Diálogos Situacionais',
    category: 'Prática',
    promptText: 'Crie um diálogo curto e realista (de 4 a 6 linhas) em inglês usando a palavra/expressão "[EXPRESSÃO]". O cenário deve ser "[CENÁRIO]" (ex. cafeteria, aeroporto, reunião). Traduza o diálogo para o português e destaque os chunks mais importantes.'
  }
];

export const AIChatSidebar: React.FC = () => {
  const { 
    categories, 
    addCustomPhrase, 
    addCustomCategory, 
    targetLanguage,
    phrases, // Existing phrases in user islands
    activeTab
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'sessions'>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active AI Model selection directly in Sidebar Header
  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('hl_deepseek_model') || 'deepseek-ai/deepseek-v4-pro';
  });

  // Batch Selection Mode states
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showBatchSaveForm, setShowBatchSaveForm] = useState(false);
  const [batchResourceName, setBatchResourceName] = useState('');
  const [batchResourceCategory, setBatchResourceCategory] = useState('Gramática');
  const [batchResourceText, setBatchResourceText] = useState('');

  // States for importing phrases to islands
  const [activeImportMsgId, setActiveImportMsgId] = useState<string | null>(null);
  const [importOriginal, setImportOriginal] = useState('');
  const [importTranslation, setImportTranslation] = useState('');
  const [importExplanation, setImportExplanation] = useState('');
  const [importDifficulty, setImportDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [importCategoryId, setImportCategoryId] = useState('');
  
  // Custom Category creation in import form
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Copy indicator for message snippets
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [successImportMsgId, setSuccessImportMsgId] = useState<string | null>(null);

  // Expanded state for reasoning blocks
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  // States for Bringing Phrases/Prompts into Chat (Hierarchical Structured Workflow)
  const [isIslandsPanelOpen, setIsIslandsPanelOpen] = useState(false);
  const [activeFooterTab, setActiveFooterTab] = useState<'islands' | 'prompts'>('islands');
  
  // Bring from Islands sub-states
  const [selectedCategoryForBring, setSelectedCategoryForBring] = useState<Category | null>(null);
  const [islandSearchQuery, setIslandSearchQuery] = useState('');
  const [selectedIslandPhrase, setSelectedIslandPhrase] = useState<Phrase | null>(null);

  // Bring from Prompts sub-states
  const [promptsLibrary, setPromptsLibrary] = useState<AIPrompt[]>([]);
  const [promptSearchQuery, setPromptSearchQuery] = useState('');
  const [selectedPromptForBring, setSelectedPromptForBring] = useState<AIPrompt | null>(null);
  const [promptPlaceholderValues, setPromptPlaceholderValues] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load target language details
  const activeLang = AVAILABLE_LANGUAGES.find(l => l.id === targetLanguage) || AVAILABLE_LANGUAGES[0];

  // Auto-close chat if active tab changes to non-supported one
  useEffect(() => {
    if (activeTab !== 'resources' && activeTab !== 'islands') {
      setIsOpen(false);
    }
  }, [activeTab]);

  // Load chat sessions from localStorage
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(`hl_chat_sessions_${targetLanguage}`);
      const storedActiveId = localStorage.getItem(`hl_active_session_id_${targetLanguage}`);
      
      let parsedSessions: ChatSession[] = [];
      if (storedSessions) {
        parsedSessions = JSON.parse(storedSessions);
      }

      if (parsedSessions.length === 0) {
        // Create an initial default session
        const initialSession: ChatSession = {
          id: 'session_' + Math.random().toString(36).substring(2, 9),
          title: 'Conversa Inicial',
          messages: [],
          timestamp: Date.now()
        };
        parsedSessions = [initialSession];
        localStorage.setItem(`hl_chat_sessions_${targetLanguage}`, JSON.stringify(parsedSessions));
      }

      setSessions(parsedSessions);

      const activeId = storedActiveId && parsedSessions.some(s => s.id === storedActiveId)
        ? storedActiveId 
        : parsedSessions[0].id;
      
      setActiveSessionId(activeId);
      localStorage.setItem(`hl_active_session_id_${targetLanguage}`, activeId);

      const activeSession = parsedSessions.find(s => s.id === activeId);
      if (activeSession) {
        setMessages(activeSession.messages);
      }
    } catch (e) {
      console.error('Failed to load chat sessions', e);
    }

    // Reset view states when targetLanguage changes
    setActiveImportMsgId(null);
    setExpandedReasoning({});
    setIsIslandsPanelOpen(false);
    setSelectedCategoryForBring(null);
    setSelectedIslandPhrase(null);
    setSelectedPromptForBring(null);
    setViewMode('chat');
    setIsBatchMode(false);
    setSelectedMessageIds(new Set());
    setShowBatchSaveForm(false);
  }, [targetLanguage]);

  // Load custom prompts from local storage
  useEffect(() => {
    const stored = localStorage.getItem('hl_study_prompts');
    if (stored) {
      try {
        setPromptsLibrary(JSON.parse(stored));
      } catch (e) {
        setPromptsLibrary(DEFAULT_PROMPTS);
      }
    } else {
      setPromptsLibrary(DEFAULT_PROMPTS);
    }
  }, [isIslandsPanelOpen]); // Reload when panel opens to get latest additions

  // Save current messages to active session in state and localStorage
  const updateSessionMessages = (updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    
    const updatedSessions = sessions.map(session => {
      if (session.id === activeSessionId) {
        // Dynamically rename chat session if title is default and user sent first message
        let newTitle = session.title;
        if (session.title === 'Conversa Inicial' && updatedMessages.length > 0) {
          const firstUserMsg = updatedMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.length > 25 
              ? firstUserMsg.content.substring(0, 22) + '...'
              : firstUserMsg.content;
          }
        }
        return {
          ...session,
          title: newTitle,
          messages: updatedMessages,
          timestamp: Date.now()
        };
      }
      return session;
    });

    setSessions(updatedSessions);
    localStorage.setItem(`hl_chat_sessions_${targetLanguage}`, JSON.stringify(updatedSessions));
  };

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Set default category when categories list loads or changes
  useEffect(() => {
    if (categories.length > 0 && !importCategoryId) {
      const def = categories.find(c => c.id.includes('shadowing-vocab')) || categories[0];
      setImportCategoryId(def.id);
    }
  }, [categories, importCategoryId]);

  // Toggle reasoning view
  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Model switching in header
  const handleSwitchModel = (modelName: string) => {
    setActiveModel(modelName);
    localStorage.setItem('hl_deepseek_model', modelName);
  };

  // Sessions management actions
  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: 'session_' + Math.random().toString(36).substring(2, 9),
      title: 'Conversa ' + (sessions.length + 1),
      messages: [],
      timestamp: Date.now()
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    localStorage.setItem(`hl_chat_sessions_${targetLanguage}`, JSON.stringify(nextSessions));
    
    setActiveSessionId(newSession.id);
    localStorage.setItem(`hl_active_session_id_${targetLanguage}`, newSession.id);
    
    setMessages([]);
    setViewMode('chat');
    setActiveImportMsgId(null);
    setIsIslandsPanelOpen(false);
    setIsBatchMode(false);
    setSelectedMessageIds(new Set());
    setShowBatchSaveForm(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    localStorage.setItem(`hl_active_session_id_${targetLanguage}`, sessionId);
    
    const targetSession = sessions.find(s => s.id === sessionId);
    if (targetSession) {
      setMessages(targetSession.messages);
    }
    setViewMode('chat');
    setActiveImportMsgId(null);
    setIsIslandsPanelOpen(false);
    setIsBatchMode(false);
    setSelectedMessageIds(new Set());
    setShowBatchSaveForm(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert('Você precisa manter pelo menos uma conversa ativa no histórico.');
      return;
    }

    if (confirm('Deseja realmente apagar esta conversa?')) {
      const nextSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(nextSessions);
      localStorage.setItem(`hl_chat_sessions_${targetLanguage}`, JSON.stringify(nextSessions));

      if (activeSessionId === sessionId) {
        const fallbackSession = nextSessions[0];
        setActiveSessionId(fallbackSession.id);
        localStorage.setItem(`hl_active_session_id_${targetLanguage}`, fallbackSession.id);
        setMessages(fallbackSession.messages);
      }
    }
  };

  const handleClearChat = () => {
    if (confirm('Deseja realmente apagar o histórico de mensagens desta conversa?')) {
      updateSessionMessages([]);
      setActiveImportMsgId(null);
      setErrorMsg(null);
      setExpandedReasoning({});
    }
  };

  const getSuggestions = (): { text: string; label: string }[] => {
    const langName = activeLang.name;
    switch (targetLanguage) {
      case 'en':
        return [
          { text: "Diferença entre 'look for' e 'look after'", label: "Diferenças" },
          { text: "Crie frases com o chunk 'in trouble' no contexto escolar", label: "Chunks" },
          { text: "Escreva um diálogo curto sobre fazer check-in num hotel em Nova York", label: "Diálogos" },
          { text: "Explique como usar a expressão 'make up your mind'", label: "Expressões" }
        ];
      case 'es':
        return [
          { text: "Explique a diferença entre 'por' e 'para'", label: "Diferenças" },
          { text: "Gere 3 frases de exemplo com a expressão 'echar de menos'", label: "Expressões" },
          { text: "Escreva um diálogo informal pedindo comida em um restaurante", label: "Diálogos" },
          { text: "Como usar os pronomes de complemento direto e indireto juntos?", label: "Gramática" }
        ];
      case 'fr':
        return [
          { text: "Diferença entre 'connaître' e 'savoir' com exemplos", label: "Diferenças" },
          { text: "Escreva um diálogo formal comprando uma passagem de trem na estação", label: "Diálogos" },
          { text: "Gere 3 frases com o chunk 'avoir besoin de'", label: "Chunks" },
          { text: "Explique o uso de 'y' e 'en'", label: "Gramática" }
        ];
      default:
        return [
          { text: `Gere 3 frases cotidianas úteis em ${langName} com tradução`, label: "Prática" },
          { text: `Escreva um diálogo básico de apresentação em ${langName}`, label: "Diálogo" },
          { text: `Quais são as expressões de cortesia mais comuns em ${langName}?`, label: "Vocabulário" },
          { text: `Explique a pronúncia dos sons mais difíceis em ${langName}`, label: "Pronúncia" }
        ];
    }
  };

  // Call DeepSeek/Nemotron API (via CORS proxy route /nvidia-proxy to make it work in browser!)
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    setErrorMsg(null);
    setInput('');

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: trimmed,
      timestamp: Date.now()
    };

    const newMsgs = [...messages, userMsg];
    updateSessionMessages(newMsgs);
    setIsLoading(true);

    const isNemotron = activeModel === 'nvidia/nemotron-3-ultra-550b-a55b';

    // Retrieve corresponding API key based on selected model
    let apiKey = '';
    if (isNemotron) {
      apiKey = localStorage.getItem('hl_nemotron_key') || '';
      if (!apiKey || apiKey.trim() === '' || apiKey === 'sua-chave-nemotron-aqui') {
        apiKey = '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';
      }
    } else {
      apiKey = localStorage.getItem('hl_deepseek_key') || '';
      if (!apiKey || apiKey.trim() === '' || apiKey === 'sua-chave-deepseek-aqui') {
        apiKey = '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';
      }
    }

    try {
      const url = '/nvidia-proxy/v1/chat/completions';
      const langName = activeLang.name;
      const systemPrompt = `Você é o Assistente de Idiomas especialista do LearnChunks. Seu objetivo principal é guiar o usuário no aprendizado do idioma ${langName}. 
Regras:
1. Responda de forma concisa, direta e muito amigável.
2. Forneça explicações gramaticais claras com exemplos originais formatados em markdown.
3. Destaque chunks, expressões úteis e construções nativas em negrito.
4. Sempre coloque traduções em português entre parênteses para todas as frases geradas no idioma de estudo.
5. Se for perguntado sobre gírias ou sotaque, apresente situações práticas e comuns do cotidiano.
6. Nunca responda com blocos inteiros sem quebras de linha. Use listas com marcadores e espaçamentos adequados.`;

      // Structure system prompt + history
      const formattedHistory = [
        { role: 'system', content: systemPrompt },
        ...newMsgs.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      // Formulate request body depending on model features
      const requestBody: any = {
        model: activeModel,
        messages: formattedHistory,
        temperature: 1,
        top_p: 0.95,
        stream: false
      };

      if (isNemotron) {
        requestBody.max_tokens = 16384;
        requestBody.chat_template_kwargs = { enable_thinking: true };
        requestBody.reasoning_budget = 16384;
      } else {
        requestBody.max_tokens = 4096;
        requestBody.chat_template_kwargs = { thinking: false };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || 'Não foi possível obter uma resposta válida.';
      
      // Extract reasoning/thinking if available (Nemotron support)
      const reasoning = data?.choices?.[0]?.message?.reasoning_content || 
                        data?.choices?.[0]?.message?.reasoning || 
                        undefined;

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content,
        reasoning,
        timestamp: Date.now()
      };

      updateSessionMessages([...newMsgs, assistantMsg]);
    } catch (err: any) {
      console.error('Chat API Error:', err);
      setErrorMsg(err.message || 'Houve um problema de conexão com a API da NVIDIA (CORS / Conexão).');
    } finally {
      setIsLoading(false);
    }
  };

  // Open the Import to Island Form
  const handleOpenImport = (msg: ChatMessage) => {
    setActiveImportMsgId(msg.id);
    setSuccessImportMsgId(null);

    // Clean up Markdown formatting from prefilled text
    const cleanText = msg.content
      .replace(/[\*\_]/g, '') // remove markdown bold/italics
      .substring(0, 150) // limit length
      .trim();

    setImportOriginal(cleanText);
    setImportTranslation('');
    setImportExplanation(`Gerado no Chat de IA do LearnChunks. Contexto original:\n"${msg.content.substring(0, 300)}..."`);
    setIsCreatingCategory(false);
    setNewCatName('');
    setNewCatDesc('');
    setCategoryError('');
  };

  // Handle Import Saving
  const handleSaveImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importOriginal.trim()) {
      alert('Por favor, informe a sentença ou palavra original.');
      return;
    }

    let finalCategoryId = importCategoryId;

    try {
      // Create new category if requested
      if (isCreatingCategory) {
        if (!newCatName.trim()) {
          setCategoryError('Nome da Ilha é obrigatório.');
          return;
        }
        setCategoryError('');
        const newId = await addCustomCategory(newCatName.trim(), newCatDesc.trim());
        finalCategoryId = newId;
        setImportCategoryId(newId);
        setIsCreatingCategory(false);
      }

      // Add to Island database
      await addCustomPhrase(
        importOriginal.trim(),
        importTranslation.trim() || 'Ver explicação detalhada',
        importExplanation.trim(),
        importDifficulty,
        'Fenrir', // Default voice
        1.0,      // Default speed
        finalCategoryId
      );

      setSuccessImportMsgId(activeImportMsgId);
      setTimeout(() => {
        setActiveImportMsgId(null);
        setSuccessImportMsgId(null);
      }, 2000);

    } catch (err: any) {
      console.error('Import error:', err);
      alert('Erro ao salvar frase na ilha.');
    }
  };

  // Interaction: Bring Phrase from Island into Chat
  const handleBringPhraseAction = (actionType: 'explain' | 'examples' | 'dialogue' | 'insert', phraseText: string, translationText: string) => {
    setIsIslandsPanelOpen(false);
    setSelectedIslandPhrase(null);
    setSelectedCategoryForBring(null);
    setIslandSearchQuery('');

    let prompt = '';
    if (actionType === 'explain') {
      prompt = `Por favor, explique a frase do meu vocabulário: "${phraseText}" (significa: "${translationText}"). Quais as nuances dela e como posso usá-la corretamente?`;
    } else if (actionType === 'examples') {
      prompt = `Crie 3 novos exemplos práticos no dia a dia usando a expressão "${phraseText}". Por favor, adicione a tradução de cada exemplo para o português.`;
    } else if (actionType === 'dialogue') {
      prompt = `Escreva um diálogo curto e informal em que duas pessoas usam a frase "${phraseText}" naturalmente na conversa. Forneça a tradução do diálogo.`;
    } else {
      // Just insert in input textarea
      setInput(prev => prev ? `${prev} ${phraseText}` : phraseText);
      return;
    }

    handleSendMessage(prompt);
  };

  // Interaction: Bring Saved Prompt into Chat and dynamically handle placeholder values
  const extractPlaceholders = (text: string): string[] => {
    const regex = /\[([^\]]+)\]/g;
    const placeholders: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      placeholders.push(match[1]);
    }
    return Array.from(new Set(placeholders)); // unique placeholders
  };

  const handleBringPromptAction = (prompt: AIPrompt) => {
    const placeholders = extractPlaceholders(prompt.promptText);
    
    if (placeholders.length > 0) {
      // Prompt has variables, show the placeholder input form step
      setSelectedPromptForBring(prompt);
      const initialVals: Record<string, string> = {};
      placeholders.forEach(ph => {
        initialVals[ph] = '';
      });
      setPromptPlaceholderValues(initialVals);
    } else {
      // No variables, send immediately
      setIsIslandsPanelOpen(false);
      setSelectedPromptForBring(null);
      handleSendMessage(prompt.promptText);
    }
  };

  const handleSendPromptWithValues = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromptForBring) return;

    let finalPrompt = selectedPromptForBring.promptText;
    const placeholders = extractPlaceholders(selectedPromptForBring.promptText);
    
    // Replace all placeholders
    placeholders.forEach(ph => {
      const val = promptPlaceholderValues[ph] || '';
      finalPrompt = finalPrompt.replace(new RegExp(`\\[${ph}\\]`, 'g'), val);
    });

    setIsIslandsPanelOpen(false);
    setSelectedPromptForBring(null);
    setPromptPlaceholderValues({});
    setPromptSearchQuery('');

    handleSendMessage(finalPrompt);
  };

  // Batch Saving Action: Save selected AI responses as a resource in resources library
  const handleOpenBatchSave = () => {
    if (selectedMessageIds.size === 0) {
      alert('Selecione pelo menos uma resposta da IA para salvar.');
      return;
    }

    // Combine all selected assistant messages text
    const selectedMsgs = messages.filter(m => selectedMessageIds.has(m.id));
    const combinedText = selectedMsgs.map(m => m.content).join('\n\n---\n\n');

    setBatchResourceName(`Explicação coletada no chat - ${activeLang.name}`);
    setBatchResourceCategory('Geral');
    setBatchResourceText(combinedText);
    setShowBatchSaveForm(true);
  };

  const handleSaveBatchResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchResourceName.trim()) {
      alert('Por favor, defina o nome do recurso.');
      return;
    }

    try {
      const stored = localStorage.getItem('hl_study_prompts');
      const currentPrompts: AIPrompt[] = stored ? JSON.parse(stored) : DEFAULT_PROMPTS;

      const newPrompt: AIPrompt = {
        id: 'p_chat_' + Math.random().toString(36).substring(2, 9),
        name: batchResourceName.trim(),
        category: batchResourceCategory.trim(),
        promptText: batchResourceText.trim()
      };

      const updated = [...currentPrompts, newPrompt];
      localStorage.setItem('hl_study_prompts', JSON.stringify(updated));
      setPromptsLibrary(updated);

      alert('Respostas salvas com sucesso na sua biblioteca de Recursos!');
      
      // Reset batch selection state
      setIsBatchMode(false);
      setSelectedMessageIds(new Set());
      setShowBatchSaveForm(false);
    } catch (err) {
      console.error('Failed to save batch prompts', err);
      alert('Erro ao salvar respostas em lote.');
    }
  };

  const toggleSelectMessage = (msgId: string) => {
    setSelectedMessageIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  // Extract clickable phrases and words from assistant messages to make imports magic
  const extractSnippets = (content: string): string[] => {
    const snippets = new Set<string>();
    
    // 1. Extract bold terms
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldRegex.exec(content)) !== null) {
      const term = match[1].trim();
      if (term && term.length > 2 && term.length < 80) {
        snippets.add(term);
      }
    }
    
    // 2. Extract lines or parts before colons/hyphens
    const lines = content.split('\n');
    lines.forEach(line => {
      const cleanLine = line.trim().replace(/^[\-\*\d\.\s]+/, ''); // remove bullet/number
      
      if (cleanLine.includes(':')) {
        const part = cleanLine.split(':')[0].trim().replace(/[\*\_]/g, '');
        if (part.length > 2 && part.length < 60) snippets.add(part);
      }
      
      if (cleanLine.includes(' - ')) {
        const part = cleanLine.split(' - ')[0].trim().replace(/[\*\_]/g, '');
        if (part.length > 2 && part.length < 60) snippets.add(part);
      }
      
      const textOnly = cleanLine.replace(/\([^)]+\)/g, '').trim().replace(/[\*\_]/g, '');
      if (textOnly.length > 5 && textOnly.length < 90 && !textOnly.includes('http')) {
        snippets.add(textOnly);
      }
    });

    return Array.from(snippets).slice(0, 6); // return top 6 unique snippets
  };

  // Utility to copy message to clipboard
  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Render markdown-like elements safely
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <div key={idx} style={{ height: '8px' }} />;
      
      // Handle list items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.replace(/^[\-\*]\s+/, '');
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'disc', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            {parseFormatting(text)}
          </li>
        );
      }

      // Handle numbers lists
      if (/^\d+\.\s+/.test(line.trim())) {
        const text = line.replace(/^\d+\.\s+/, '');
        return (
          <li key={idx} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'decimal', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            {parseFormatting(text)}
          </li>
        );
      }

      return (
        <p key={idx} style={{ marginBottom: '8px', fontSize: '0.88rem', lineHeight: '1.45', color: 'var(--text-primary)' }}>
          {parseFormatting(line)}
        </p>
      );
    });
  };

  const parseFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--accent)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      const subParts = part.split(/(\([^)]+\))/g);
      return subParts.map((subPart, j) => {
        if (subPart.startsWith('(') && subPart.endsWith(')')) {
          return <span key={j} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.9 }}>{subPart}</span>;
        }
        return subPart;
      });
    });
  };

  // Filter categories to show in selection step
  const getFilteredCategoriesForBring = () => {
    return categories.filter(c => {
      if (c.language_id !== targetLanguage) return false;
      if (!islandSearchQuery.trim()) return true;
      return c.name.toLowerCase().includes(islandSearchQuery.toLowerCase()) || 
             c.description.toLowerCase().includes(islandSearchQuery.toLowerCase());
    });
  };

  // Filter phrases within active category inside islands bring-in panel
  const getFilteredPhrasesForBring = () => {
    if (!selectedCategoryForBring) return [];
    return phrases.filter(p => {
      if (p.language_id !== targetLanguage) return false;
      if (p.category_id !== selectedCategoryForBring.id) return false;
      if (!islandSearchQuery.trim()) return true;
      return p.text.toLowerCase().includes(islandSearchQuery.toLowerCase()) || 
             p.translation.toLowerCase().includes(islandSearchQuery.toLowerCase());
    });
  };

  // Filter prompts library
  const getFilteredPromptsForBring = () => {
    return promptsLibrary.filter(p => {
      if (!promptSearchQuery.trim()) return true;
      return p.name.toLowerCase().includes(promptSearchQuery.toLowerCase()) || 
             p.promptText.toLowerCase().includes(promptSearchQuery.toLowerCase()) ||
             p.category.toLowerCase().includes(promptSearchQuery.toLowerCase());
    });
  };

  // Only render assistant button and panel if in 'resources' or 'islands' tabs
  if (activeTab !== 'resources' && activeTab !== 'islands') {
    return null;
  }

  return (
    <>
      {/* CSS Stylesheet Injector for Premium Look & Sidebar covering */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          z-index: 1200 !important; /* Keep left sidebar menu on top of the chat panel */
        }
        .chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, hsl(280, 85%, 60%) 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-fab:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 12px 35px rgba(124, 58, 237, 0.5);
        }
        .chat-fab:active {
          transform: scale(0.96);
        }
        .chat-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(8, 10, 20, 0.6);
          backdrop-filter: blur(5px);
          z-index: 1050;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .chat-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        @media (min-width: 769px) {
          .chat-overlay {
            display: none !important; /* Don't display layout dimming on desktop, let sidebar remain active */
          }
        }
        .chat-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 260px; /* Aligns exactly next to the left sidebar menu */
          background: rgba(12, 14, 27, 0.97);
          backdrop-filter: blur(25px);
          border-left: 1px solid var(--border);
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
          z-index: 1100;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s ease;
        }
        .sidebar-collapsed .chat-sidebar {
          left: 70px; /* Adjusts left margin to cover whole page when left sidebar collapses */
        }
        .chat-sidebar.open {
          transform: translateX(0);
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-message-row {
          display: flex;
          width: 100%;
        }
        .chat-message-row.user {
          justify-content: flex-end;
        }
        .chat-message-row.assistant {
          justify-content: flex-start;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          line-height: 1.45;
          position: relative;
          box-shadow: var(--shadow-sm);
        }
        .chat-message-row.user .chat-bubble {
          background: linear-gradient(135deg, var(--accent) 0%, hsl(252, 85%, 62%) 100%);
          color: white;
          border-bottom-right-radius: 2px;
        }
        .chat-message-row.assistant .chat-bubble {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
        }
        .chat-bubble-selectable {
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-bubble-selectable:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
        .chat-bubble-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 12px;
          align-self: center;
          background: transparent;
          transition: all 0.15s;
        }
        .chat-bubble-checkbox.selected {
          background: var(--accent);
          color: white;
        }
        .chat-reasoning-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          margin-bottom: 10px;
          transition: all 0.2s;
          width: fit-content;
        }
        .chat-reasoning-toggle:hover {
          color: var(--accent);
          border-color: rgba(124, 58, 237, 0.2);
          background: rgba(124, 58, 237, 0.03);
        }
        .chat-reasoning-box {
          font-size: 0.76rem;
          color: var(--text-secondary);
          line-height: 1.4;
          font-style: italic;
          background: rgba(255, 255, 255, 0.01);
          border-left: 2px solid rgba(255, 255, 255, 0.15);
          padding: 8px 12px;
          margin-bottom: 12px;
          border-radius: 0 4px 4px 0;
          white-space: pre-wrap;
        }
        .chat-msg-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .chat-msg-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 3px 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .chat-msg-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .chat-msg-btn.accent:hover {
          color: var(--accent);
          background: var(--accent-glow);
        }
        .chat-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          background: rgba(12, 14, 27, 0.98);
          position: relative;
        }
        .chat-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          transition: all 0.2s;
        }
        .chat-input-wrapper:focus-within {
          border-color: var(--border-focus);
          box-shadow: var(--shadow-glow);
        }
        .chat-textarea {
          flex: 1;
          background: none;
          border: none;
          resize: none;
          color: var(--text-primary);
          font-size: 0.88rem;
          line-height: 1.4;
          max-height: 120px;
          padding: 4px 0;
          outline: none;
        }
        .chat-send-btn {
          background: var(--accent);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-send-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.05);
        }
        .chat-send-btn:disabled {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .chat-footer-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .chat-footer-btn:hover {
          color: var(--accent);
          background: rgba(124, 58, 237, 0.08);
        }
        .chat-footer-btn.active {
          color: var(--accent);
          background: rgba(124, 58, 237, 0.12);
        }
        .suggestion-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .suggestion-card:hover {
          background: rgba(124, 58, 237, 0.05);
          border-color: rgba(124, 58, 237, 0.2);
          transform: translateY(-1px);
        }
        .badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          display: inline-block;
          margin-bottom: 6px;
        }
        .badge.accent {
          background: var(--accent-glow);
          color: var(--accent);
        }
        .badge.muted {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
        }
        .import-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-md);
          margin-top: 12px;
          padding: 14px;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .difficulty-pill {
          flex: 1;
          padding: 8px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          transition: all 0.2s;
        }
        .difficulty-pill.active.easy {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: #10b981;
        }
        .difficulty-pill.active.medium {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.4);
          color: #f59e0b;
        }
        .difficulty-pill.active.hard {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
        }
        .session-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .session-item:hover {
          background: rgba(124, 58, 237, 0.04);
          border-color: rgba(124, 58, 237, 0.15);
          transform: translateY(-1px);
        }
        .session-item.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 100%);
          border-color: rgba(124, 58, 237, 0.4);
        }
        /* Islands Drawer styling inside chat */
        .islands-slide-panel {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: #0c0e1b;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 -8px 30px rgba(0,0,0,0.6);
          max-height: 380px;
          overflow-y: auto;
          z-index: 10;
          display: flex;
          flex-direction: column;
          padding: 16px;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .island-bring-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          overflow-y: auto;
          max-height: 250px;
          padding-right: 4px;
        }
        .category-bring-card {
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .category-bring-card:hover {
          background: rgba(124, 58, 237, 0.05);
          border-color: rgba(124, 58, 237, 0.2);
          transform: translateX(2px);
        }
        .island-phrase-card {
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .island-phrase-card:hover {
          background: rgba(124, 58, 237, 0.05);
          border-color: rgba(124, 58, 237, 0.2);
        }
        .interactive-action-btn {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-primary);
        }
        .interactive-action-btn:hover {
          background: var(--accent);
          color: white;
          border-color: transparent;
        }
        @media (max-width: 768px) {
          .chat-sidebar {
            left: 0;
            width: 100vw;
          }
        }
      `}} />

      {/* Floating Action Button */}
      <button 
        className="chat-fab" 
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          background: isOpen 
            ? 'var(--bg-secondary)' 
            : 'linear-gradient(135deg, var(--accent) 0%, hsl(280, 85%, 60%) 100%)',
          color: isOpen ? 'var(--text-secondary)' : 'white',
          border: isOpen ? '1px solid var(--border)' : 'none'
        }}
        title="Assistente de Chat IA"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Backdrop overlay (Mobile only) */}
      <div 
        className={`chat-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Sidebar Panel */}
      <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="chat-header">
          {viewMode === 'chat' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <button 
                className="chat-msg-btn"
                onClick={() => setViewMode('sessions')}
                title="Histórico de conversas"
                style={{ padding: '6px' }}
              >
                <History size={16} />
              </button>
              
              {/* Active AI Model Switcher in Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', lineHeight: 1.1 }}>
                  Chat de IA ({activeLang.flag_emoji})
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => handleSwitchModel('deepseek-ai/deepseek-v4-pro')}
                    style={{
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: activeModel === 'deepseek-ai/deepseek-v4-pro' 
                        ? 'var(--accent)' 
                        : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  >
                    DeepSeek 🚀
                  </button>
                  <button
                    onClick={() => handleSwitchModel('nvidia/nemotron-3-ultra-550b-a55b')}
                    style={{
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: activeModel === 'nvidia/nemotron-3-ultra-550b-a55b' 
                        ? 'var(--accent)' 
                        : 'rgba(255,255,255,0.06)',
                      color: 'white',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  >
                    Nemotron 🧠
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="chat-msg-btn"
                onClick={() => setViewMode('chat')}
                title="Voltar para o chat"
                style={{ padding: '6px' }}
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Conversas Salvas</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Gerencie sessões de chat em {activeLang.name}
                </span>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'chat' && messages.length > 0 && (
              <>
                {/* Batch selection mode toggle button */}
                <button
                  className={`chat-msg-btn ${isBatchMode ? 'accent' : ''}`}
                  onClick={() => {
                    setIsBatchMode(!isBatchMode);
                    setSelectedMessageIds(new Set());
                    setShowBatchSaveForm(false);
                  }}
                  title={isBatchMode ? "Cancelar seleção em lote" : "Selecionar respostas em lote"}
                  style={{ padding: '6px', background: isBatchMode ? 'var(--accent-glow)' : 'none' }}
                >
                  <ListChecks size={16} />
                </button>

                <button 
                  className="chat-msg-btn"
                  onClick={handleClearChat}
                  title="Limpar mensagens desta conversa"
                  style={{ padding: '6px' }}
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
            {viewMode === 'sessions' && (
              <button 
                className="chat-msg-btn accent"
                onClick={handleCreateNewSession}
                title="Nova conversa"
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-glow)' }}
              >
                <Plus size={14} /> <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Nova</span>
              </button>
            )}
            <button 
              className="chat-msg-btn"
              onClick={() => setIsOpen(false)}
              style={{ padding: '6px' }}
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 1. SESSIONS LIST MODE */}
        {viewMode === 'sessions' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={handleCreateNewSession}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <Plus size={16} /> Iniciar Nova Conversa
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {sessions.map(s => {
                const isActive = s.id === activeSessionId;
                const formattedDate = new Date(s.timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div 
                    key={s.id} 
                    className={`session-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectSession(s.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                        <MessageSquare size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {s.messages.length} mensagens • {formattedDate}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="chat-msg-btn"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      title="Excluir conversa"
                      style={{ padding: '6px', color: 'rgba(239, 68, 68, 0.7)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. CHAT VIEW MODE */}
        {viewMode === 'chat' && (
          <div className="chat-messages">
            
            {/* Batch saving overlay/modal */}
            {showBatchSaveForm && (
              <div className="import-panel" style={{ margin: 0, marginBottom: '16px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                <form onSubmit={handleSaveBatchResource} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FilePlus2 size={15} /> Salvar Respostas em Recursos
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowBatchSaveForm(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Nome do Recurso / Título
                    </label>
                    <input 
                      type="text"
                      className="input-text"
                      value={batchResourceName}
                      onChange={(e) => setBatchResourceName(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      required
                      style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}
                      placeholder="Ex: Diferença de Say e Tell"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Categoria
                    </label>
                    <select
                      value={batchResourceCategory}
                      onChange={(e) => setBatchResourceCategory(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}
                    >
                      <option value="Gramática">Gramática</option>
                      <option value="Vocabulário">Vocabulário</option>
                      <option value="Pronúncia">Pronúncia</option>
                      <option value="Escrita">Escrita</option>
                      <option value="Prática">Prática</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Conteúdo do Recurso (Lote Selecionado)
                    </label>
                    <textarea
                      rows={5}
                      className="input-text"
                      value={batchResourceText}
                      onChange={(e) => setBatchResourceText(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      required
                      style={{ width: '100%', padding: '6px 8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowBatchSaveForm(false)}
                      style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                    >
                      Salvar Biblioteca
                    </button>
                  </div>
                </form>
              </div>
            )}

            {messages.length === 0 ? (
              // Empty / Welcome State
              <div style={{ 
                display: 'flex', flexDirection: 'column', height: '100%', 
                justifyContent: 'center', gap: '20px', padding: '0 8px' 
              }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <div style={{
                    display: 'inline-flex', padding: '14px', borderRadius: '50%',
                    background: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '12px'
                  }}>
                    <Sparkles size={32} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '6px' }}>
                    Conversa: {sessions.find(s => s.id === activeSessionId)?.title || 'Novo Chat'}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    Tire dúvidas, crie frases, analise chunks ou pratique diálogos utilizando os modelos integrados.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sugestões para iniciar
                  </span>
                  {getSuggestions().map((sug, i) => (
                    <button 
                      key={i}
                      className="suggestion-card"
                      onClick={() => handleSendMessage(sug.text)}
                    >
                      <span className="badge accent">{sug.label}</span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        "{sug.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages list
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isImportOpen = activeImportMsgId === msg.id;
                const isImportSuccess = successImportMsgId === msg.id;
                const isReasoningOpen = !!expandedReasoning[msg.id];
                
                const isMessageSelected = selectedMessageIds.has(msg.id);

                return (
                  <div key={msg.id} className="chat-message-container" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={`chat-message-row ${isUser ? 'user' : 'assistant'}`}>
                      
                      {/* Checkbox selector visible in Batch Mode (Only for assistant messages) */}
                      {isBatchMode && !isUser && (
                        <div 
                          className={`chat-bubble-checkbox ${isMessageSelected ? 'selected' : ''}`}
                          onClick={() => toggleSelectMessage(msg.id)}
                        >
                          {isMessageSelected && <Check size={12} style={{ strokeWidth: 3 }} />}
                        </div>
                      )}

                      <div 
                        className={`chat-bubble ${isBatchMode && !isUser ? 'chat-bubble-selectable' : ''}`}
                        onClick={() => {
                          if (isBatchMode && !isUser) {
                            toggleSelectMessage(msg.id);
                          }
                        }}
                      >
                        
                        {/* Raciocínio (Nemotron support) */}
                        {!isUser && msg.reasoning && (
                          <>
                            <div 
                              className="chat-reasoning-toggle"
                              onClick={() => toggleReasoning(msg.id)}
                            >
                              <Brain size={12} style={{ color: isReasoningOpen ? 'var(--accent)' : 'var(--text-muted)' }} />
                              <span>
                                {isReasoningOpen ? 'Ocultar Pensamento' : 'Visualizar Raciocínio'}
                              </span>
                              {isReasoningOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                            
                            {isReasoningOpen && (
                              <div className="chat-reasoning-box">
                                {msg.reasoning}
                              </div>
                            )}
                          </>
                        )}

                        {/* Main Message Text */}
                        {isUser ? (
                          <p style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        ) : (
                          renderMessageContent(msg.content)
                        )}

                        {/* Actions for Assistant message (Hidden in batch mode) */}
                        {!isUser && !isBatchMode && (
                          <div className="chat-msg-actions">
                            <button 
                              className="chat-msg-btn"
                              onClick={() => handleCopyText(msg.id, msg.content)}
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check size={12} style={{ color: 'var(--success)' }} />
                                  <span style={{ color: 'var(--success)' }}>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                            
                            <button 
                              className="chat-msg-btn accent"
                              onClick={() => handleOpenImport(msg)}
                            >
                              <FolderPlus size={12} />
                              <span>Importar para Ilha</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Form to Import Phrase directly below the clicked message */}
                    {isImportOpen && (
                      <div className="import-panel">
                        {isImportSuccess ? (
                          <div style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', 
                            justifyContent: 'center', gap: '8px', padding: '12px 0', color: 'var(--success)' 
                          }}>
                            <Check size={28} style={{ strokeWidth: 3 }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Salvo com sucesso na sua ilha!</span>
                          </div>
                        ) : (
                          <form onSubmit={handleSaveImport} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FolderPlus size={14} /> Importar Nova Frase
                              </span>
                              <button 
                                type="button" 
                                onClick={() => setActiveImportMsgId(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* EXTRACTION SUGGESTIONS CHIPS (Usability improvement) */}
                            {(() => {
                              const snippets = extractSnippets(msg.content);
                              if (snippets.length === 0) return null;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    ✨ Clique para preencher o termo:
                                  </span>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {snippets.map((snip, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => {
                                          setImportOriginal(snip);
                                          // Attempt to auto-extract translation
                                          const lines = msg.content.split('\n');
                                          const matchingLine = lines.find(l => l.includes(snip));
                                          if (matchingLine) {
                                            if (matchingLine.includes(':')) {
                                              const trans = matchingLine.split(':')[1].trim().replace(/\([^)]+\)/g, '').replace(/[\*\_]/g, '');
                                              setImportTranslation(trans.substring(0, 80));
                                            } else if (matchingLine.includes(' - ')) {
                                              const trans = matchingLine.split(' - ')[1].trim().replace(/\([^)]+\)/g, '').replace(/[\*\_]/g, '');
                                              setImportTranslation(trans.substring(0, 80));
                                            }
                                          }
                                        }}
                                        style={{
                                          background: 'rgba(255,255,255,0.04)',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          borderRadius: '4px',
                                          padding: '4px 8px',
                                          fontSize: '0.68rem',
                                          color: 'var(--text-primary)',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                      >
                                        {snip.length > 25 ? snip.substring(0, 22) + '...' : snip}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Original phrase/word */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                Termo / Frase Original ({activeLang.flag_emoji})
                              </label>
                              <textarea
                                className="input-text"
                                value={importOriginal}
                                onChange={(e) => setImportOriginal(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()} // Prevent shadowing shortcuts
                                required
                                rows={2}
                                style={{ 
                                  width: '100%', padding: '6px 8px', fontSize: '0.78rem', 
                                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', 
                                  borderRadius: '6px', color: 'white', resize: 'vertical' 
                                }}
                                placeholder="Frase em inglês ou palavra..."
                              />
                            </div>

                            {/* Translation in Portuguese */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                Tradução (PT-BR)
                              </label>
                              <input
                                type="text"
                                className="input-text"
                                value={importTranslation}
                                onChange={(e) => setImportTranslation(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()} // Prevent shadowing shortcuts
                                style={{ 
                                  width: '100%', padding: '6px 8px', fontSize: '0.78rem', 
                                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', 
                                  borderRadius: '6px', color: 'white' 
                                }}
                                placeholder="Tradução literal ou contextualizada..."
                              />
                            </div>

                            {/* Rich Explanation / Notes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                Explicação / Chunks / Exemplos
                              </label>
                              <textarea
                                className="input-text"
                                value={importExplanation}
                                onChange={(e) => setImportExplanation(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()} // Prevent shadowing shortcuts
                                rows={3}
                                style={{ 
                                  width: '100%', padding: '6px 8px', fontSize: '0.78rem', 
                                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', 
                                  borderRadius: '6px', color: 'white', resize: 'vertical' 
                                }}
                                placeholder="Notas extras, pronúncia, chunks relacionados..."
                              />
                            </div>

                            {/* Select Island / Category OR Create a new one */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                  Ilha de Destino (Categoria)
                                </label>
                                <button
                                  type="button"
                                  className="chat-msg-btn accent"
                                  style={{ padding: '0 4px', height: 'auto', fontSize: '0.65rem' }}
                                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                >
                                  {isCreatingCategory ? 'Voltar para lista' : '+ Criar Nova Ilha'}
                                </button>
                              </div>

                              {isCreatingCategory ? (
                                // Form to create custom category
                                <div style={{ 
                                  display: 'flex', flexDirection: 'column', gap: '6px', 
                                  padding: '8px', background: 'rgba(124, 58, 237, 0.04)', 
                                  border: '1px dashed rgba(124, 58, 237, 0.2)', borderRadius: '6px' 
                                }}>
                                  <input
                                    type="text"
                                    placeholder="Nome da nova Ilha (Ex: Viagem)"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    style={{ 
                                      width: '100%', padding: '4px 6px', fontSize: '0.75rem', 
                                      background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', 
                                      borderRadius: '4px', color: 'white' 
                                    }}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Descrição rápida (opcional)"
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    style={{ 
                                      width: '100%', padding: '4px 6px', fontSize: '0.75rem', 
                                      background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', 
                                      borderRadius: '4px', color: 'white' 
                                    }}
                                  />
                                  {categoryError && (
                                    <span style={{ fontSize: '0.65rem', color: 'var(--danger)' }}>{categoryError}</span>
                                  )}
                                </div>
                              ) : (
                                // Selector for existing categories
                                <select
                                  value={importCategoryId}
                                  onChange={(e) => setImportCategoryId(e.target.value)}
                                  onKeyDown={(e) => e.stopPropagation()}
                                  style={{ 
                                    width: '100%', padding: '6px 8px', fontSize: '0.78rem', 
                                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', 
                                    borderRadius: '6px', color: 'white', cursor: 'pointer' 
                                  }}
                                >
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id} style={{ background: '#0c0e1b', color: 'white' }}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Difficulty Level button pills */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                Nível de Dificuldade
                              </label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                                  <button
                                    key={diff}
                                    type="button"
                                    className={`difficulty-pill ${importDifficulty === diff ? `active ${diff}` : ''}`}
                                    onClick={() => setImportDifficulty(diff)}
                                  >
                                    {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Médio' : 'Difícil'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Form submit/cancel buttons */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setActiveImportMsgId(null)}
                                style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                              >
                                Salvar na Ilha
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chat-message-row assistant">
                <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                  <Loader2 size={16} className="spin" style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    IA está pensando...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message inside scroll view */}
            {errorMsg && (
              <div style={{ 
                display: 'flex', gap: '8px', padding: '12px', 
                background: 'var(--danger-glow)', border: '1px solid rgba(239, 68, 68, 0.15)', 
                borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.78rem' 
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Erro de Conexão</strong>
                  <span>{errorMsg}</span>
                  <p style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Certifique-se de configurar a chave de API correspondente na aba de <strong>Configurações</strong>.
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Batch selection bottom controller bar */}
        {viewMode === 'chat' && isBatchMode && (
          <div style={{ 
            padding: '16px', background: 'rgba(12, 14, 27, 0.99)', 
            borderTop: '1px solid var(--accent)', display: 'flex', 
            justifyContent: 'space-between', alignItems: 'center' 
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>
              {selectedMessageIds.size} resposta(s) selecionada(s)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedMessageIds(new Set());
                  setShowBatchSaveForm(false);
                }}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleOpenBatchSave}
                disabled={selectedMessageIds.size === 0}
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <FilePlus2 size={14} /> Salvar em Recursos
              </button>
            </div>
          </div>
        )}

        {/* Footer Area with Input Box and Islands/Prompts Integration Panel */}
        {viewMode === 'chat' && !isBatchMode && (
          <div className="chat-footer">
            
            {/* ISLAND BRING-IN SUB-PANEL (Slides Up above input) */}
            {isIslandsPanelOpen && (
              <div className="islands-slide-panel">
                
                {/* PANEL TAB SWITCHER */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '12px', paddingBottom: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFooterTab('islands');
                      setSelectedCategoryForBring(null);
                      setSelectedIslandPhrase(null);
                      setSelectedPromptForBring(null);
                      setIslandSearchQuery('');
                      setPromptSearchQuery('');
                    }}
                    style={{
                      flex: 1, padding: '6px 0', border: 'none', background: 'none',
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      borderBottom: activeFooterTab === 'islands' ? '2px solid var(--accent)' : '2px solid transparent',
                      color: activeFooterTab === 'islands' ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    🏝️ Ilhas de Idiomas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFooterTab('prompts');
                      setSelectedCategoryForBring(null);
                      setSelectedIslandPhrase(null);
                      setSelectedPromptForBring(null);
                      setIslandSearchQuery('');
                      setPromptSearchQuery('');
                    }}
                    style={{
                      flex: 1, padding: '6px 0', border: 'none', background: 'none',
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      borderBottom: activeFooterTab === 'prompts' ? '2px solid var(--accent)' : '2px solid transparent',
                      color: activeFooterTab === 'prompts' ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    💡 Biblioteca de Prompts
                  </button>
                </div>

                {/* TAB 1: ISLANDS BRING-IN FLOW */}
                {activeFooterTab === 'islands' && (
                  <>
                    {/* STEP 1: CHOOSE THE ISLAND */}
                    {selectedCategoryForBring === null ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                            Escolha uma Ilha de Linguagem:
                          </span>
                          <button 
                            className="chat-msg-btn"
                            onClick={() => { setIsIslandsPanelOpen(false); setSelectedIslandPhrase(null); }}
                            style={{ padding: '2px' }}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', marginBottom: '8px' }}>
                          <Search size={12} style={{ color: 'var(--text-muted)' }} />
                          <input 
                            type="text"
                            placeholder="Buscar ilha..."
                            value={islandSearchQuery}
                            onChange={(e) => setIslandSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', width: '100%', outline: 'none' }}
                          />
                        </div>

                        <div className="island-bring-grid">
                          {getFilteredCategoriesForBring().length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Nenhuma ilha encontrada.
                            </div>
                          ) : (
                            getFilteredCategoriesForBring().map(c => {
                              const count = phrases.filter(p => p.language_id === targetLanguage && p.category_id === c.id).length;
                              return (
                                <div 
                                  key={c.id}
                                  className="category-bring-card"
                                  onClick={() => {
                                    setSelectedCategoryForBring(c);
                                    setIslandSearchQuery('');
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Folder size={15} style={{ color: 'var(--accent)' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>{c.name}</span>
                                      {c.description && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {c.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="badge accent" style={{ margin: 0 }}>
                                    {count} termos
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
                      /* STEP 2: CHOOSE PHRASE OR APPLY ACTIONS */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <button
                            type="button"
                            className="chat-msg-btn accent"
                            onClick={() => {
                              setSelectedCategoryForBring(null);
                              setSelectedIslandPhrase(null);
                              setIslandSearchQuery('');
                            }}
                            style={{ fontSize: '0.7rem', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <ArrowLeft size={12} /> Ilhas
                          </button>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {selectedCategoryForBring.name}
                          </span>
                        </div>

                        {selectedIslandPhrase ? (
                          /* ACTION SHEET FOR PHRASE */
                          <div style={{ 
                            display: 'flex', flexDirection: 'column', gap: '8px', 
                            padding: '10px', background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--border)', borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'white' }}>
                                  {selectedIslandPhrase.text}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                  Trad: {selectedIslandPhrase.translation}
                                </span>
                              </div>
                              <button className="chat-msg-btn" onClick={() => setSelectedIslandPhrase(null)} style={{ fontSize: '0.65rem' }}>
                                Mudar
                              </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <button type="button" className="interactive-action-btn" onClick={() => handleBringPhraseAction('explain', selectedIslandPhrase.text, selectedIslandPhrase.translation)}>
                                🧠 Explique-me
                              </button>
                              <button type="button" className="interactive-action-btn" onClick={() => handleBringPhraseAction('examples', selectedIslandPhrase.text, selectedIslandPhrase.translation)}>
                                💡 3 Exemplos
                              </button>
                              <button type="button" className="interactive-action-btn" onClick={() => handleBringPhraseAction('dialogue', selectedIslandPhrase.text, selectedIslandPhrase.translation)}>
                                💬 Criar Diálogo
                              </button>
                              <button type="button" className="interactive-action-btn" onClick={() => handleBringPhraseAction('insert', selectedIslandPhrase.text, selectedIslandPhrase.translation)}>
                                ✍️ Copiar input
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* LIST PHRASES */
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', marginBottom: '8px' }}>
                              <Search size={12} style={{ color: 'var(--text-muted)' }} />
                              <input 
                                type="text"
                                placeholder={`Buscar em "${selectedCategoryForBring.name}"...`}
                                value={islandSearchQuery}
                                onChange={(e) => setIslandSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', width: '100%', outline: 'none' }}
                              />
                            </div>

                            <div className="island-bring-grid">
                              {getFilteredPhrasesForBring().length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Nenhum termo encontrado.
                                </div>
                              ) : (
                                getFilteredPhrasesForBring().map(p => (
                                  <div key={p.id} className="island-phrase-card" onClick={() => setSelectedIslandPhrase(p)}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', textAlign: 'left' }}>{p.text}</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textAlign: 'left' }}>{p.translation}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* TAB 2: SAVED PROMPTS LIBRARY FLOW */}
                {activeFooterTab === 'prompts' && (
                  <>
                    {selectedPromptForBring === null ? (
                      /* LIST SAVED PROMPTS */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                            Selecione um Prompt Salvo para Executar:
                          </span>
                          <button 
                            className="chat-msg-btn"
                            onClick={() => { setIsIslandsPanelOpen(false); setSelectedPromptForBring(null); }}
                            style={{ padding: '2px' }}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 8px', marginBottom: '8px' }}>
                          <Search size={12} style={{ color: 'var(--text-muted)' }} />
                          <input 
                            type="text"
                            placeholder="Buscar prompt na biblioteca..."
                            value={promptSearchQuery}
                            onChange={(e) => setPromptSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', width: '100%', outline: 'none' }}
                          />
                        </div>

                        <div className="island-bring-grid">
                          {getFilteredPromptsForBring().length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Nenhum prompt encontrado na sua biblioteca.
                            </div>
                          ) : (
                            getFilteredPromptsForBring().map(p => (
                              <div 
                                key={p.id} 
                                className="island-phrase-card" 
                                onClick={() => handleBringPromptAction(p)}
                                style={{ textAlign: 'left' }}
                              >
                                <span className="badge accent" style={{ width: 'fit-content', marginBottom: '4px' }}>{p.category}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>{p.name}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                                  {p.promptText}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      /* DYNAMIC INPUTS FOR PROMPT PLACEHOLDERS */
                      <form onSubmit={handleSendPromptWithValues} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                          <button
                            type="button"
                            className="chat-msg-btn accent"
                            onClick={() => setSelectedPromptForBring(null)}
                            style={{ fontSize: '0.7rem', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <ArrowLeft size={12} /> Prompts
                          </button>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                            {selectedPromptForBring.name}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '4px', textAlign: 'left' }}>
                          Preencha as variáveis do prompt para enviar:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                          {extractPlaceholders(selectedPromptForBring.promptText).map(ph => (
                            <div key={ph} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' }}>
                                {ph}
                              </label>
                              <input 
                                type="text"
                                value={promptPlaceholderValues[ph] || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPromptPlaceholderValues(prev => ({
                                    ...prev,
                                    [ph]: val
                                  }));
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                required
                                className="input-text"
                                style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white' }}
                                placeholder={`Digite o valor de ${ph}...`}
                              />
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedPromptForBring(null)}
                            style={{ flex: 1, padding: '5px', fontSize: '0.75rem' }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '5px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                          >
                            Enviar Chat <ArrowRight size={12} />
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

              </div>
            )}

            <div className="chat-input-wrapper">
              <button
                type="button"
                className={`chat-footer-btn ${isIslandsPanelOpen ? 'active' : ''}`}
                onClick={() => { 
                  setIsIslandsPanelOpen(!isIslandsPanelOpen); 
                  setSelectedIslandPhrase(null);
                  setSelectedCategoryForBring(null);
                  setSelectedPromptForBring(null);
                }}
                title="Biblioteca de Prompts / Ilhas"
                disabled={isLoading}
              >
                <BookOpen size={16} />
              </button>

              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder={`Escreva uma mensagem em ${activeLang.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation(); // Avoid triggering keyboard shortcuts in shadowing
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(input);
                  }
                }}
                rows={1}
                style={{ height: 'auto' }}
                disabled={isLoading}
              />
              
              <button
                className="chat-send-btn"
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                title="Enviar"
              >
                <Send size={15} />
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 2px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Pressione Enter para enviar, Shift+Enter para quebrar linha.
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                Modelo: {activeModel.split('/').pop()}
              </span>
            </div>
          </div>
        )}

      </div>
    </>
  );
};
