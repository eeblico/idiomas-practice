import React from 'react';
import { HelpCircle, Info, WifiOff, Volume2, Lightbulb, Star, TrendingUp, CheckCircle } from 'lucide-react';

export const Guide: React.FC = () => {
  const guideItems = [
    {
      icon: <HelpCircle size={24} />,
      title: 'Bem-vindo ao NoClima',
      body: 'NoClima é um aplicativo de aquisição de linguagem focado no seu estado de energia, intenção mental e rotina real. Diferente dos aplicativos tradicionais que dependem de gamificação artificial, o NoClima conecta o seu aprendizado a 4 Macro-Climas mentais (Deep Work, Flow, Influence, Explorer) através da prática ativa com frases reais faladas por nativos.'
    },
    {
      icon: <Info size={24} />,
      title: 'Como usar o aplicativo',
      body: 'Explore as Ilhas Linguísticas na aba Ilhas ou no Início, navegando pelos 4 Macro-Climas de Energia. Cada clima possui 3 sub-estruturas: Story (seus decks narrativos pessoais), Core (decks fundamentais essenciais) e Pop Lab (minerações de séries e músicas). Selecione um clima para praticar com Autoplay, Flashcards e auto-teste ativo.'
    },
    {
      icon: <WifiOff size={24} />,
      title: 'Modo offline',
      body: 'Pratique suas ilhas favoritas sem internet — no app móvel. Ao explorar uma ilha, o app prepara o áudio em segundo plano. Você verá Cached: 50% (ou similar) abaixo do nome; em Offline ready, todas as gravações estão no telefone. Isso ainda não salva a ilha — só prepara o áudio até você tocar em Save. Toque em Save no canto superior para guardar a ilha no dispositivo. O botão mostra o progresso (ex. Saving - 64%) até frases, traduções e áudio estarem completos. Depois muda para Offline. Toque em Offline para ver o que está salvo, remover ou atualizar se houver novas gravações. Gerencie em Profile → Saved offline: quantas ilhas e espaço usado. No limite, escolha outra ilha para substituir. Ative Audio cache em Practice settings (pré-carregar todas as frases). Ilhas salvas abrem na aba ilhas sem conexão.'
    },
    {
      icon: <Volume2 size={24} />,
      title: 'Modo Ouça e Repita',
      body: 'Ouça e Repita é a base do NoClima. Neste modo, você vê a frase no idioma-alvo e ouve o áudio nativo. Seu objetivo é escutar com atenção e repetir em voz alta, treinando seu ouvido e sua pronúncia de forma natural.'
    },
    {
      icon: <Lightbulb size={24} />,
      title: 'Modo Active Recall',
      body: 'O Active Recall (Recuperação Ativa) força seu cérebro a resgatar a frase de memória antes de revelar a tradução. É a técnica mais poderosa para transformar conhecimento passivo em habilidade de fala ativa.'
    },
    {
      icon: <Star size={24} />,
      title: 'Sistema de Classificação de 5 Estrelas',
      body: 'Cada frase possui uma classificação de 5 estrelas que você mesmo controla. Esta autoavaliação alimenta o algoritmo de repetição espaçada SM2, agendando as revisões no momento exato antes do esquecimento.'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Níveis CEFR & Seu Progresso',
      body: 'Seu nível no idioma é determinado pelo vocabulário único dominado (classificado com 5 estrelas), seguindo o Quadro Comum Europeu de Referência (CEFR: A1 a C2). Acompanhe suas estatísticas completas na aba Estatísticas.'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Dicas para o Sucesso',
      body: 'Pratique diariamente, mesmo que por 10 a 15 minutos. Alinhe o estudo ao seu Clima de Energia do momento: use Deep Work para foco analítico e negócios, Flow para rotina, Influence para comunicação social e Explorer para momentos mais leves e lúdicos!'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Como usar o NoClima</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guia completo de metodologia, 4 Macro-Climas e melhores práticas de estudo.</p>
      </div>

      <div className="guide-container">
        {guideItems.map((item, idx) => (
          <div key={idx} className="guide-card">
            <div className="guide-icon-wrapper">
              {item.icon}
            </div>
            <div className="guide-card-content">
              <h3 className="guide-card-title">{item.title}</h3>
              <p className="guide-card-body">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
