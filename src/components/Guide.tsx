import React from 'react';
import { HelpCircle, Info, WifiOff, Volume2, Lightbulb, Star, TrendingUp, CheckCircle } from 'lucide-react';

export const Guide: React.FC = () => {
  const guideItems = [
    {
      icon: <HelpCircle size={24} />,
      title: 'Bem-vindo ao HyperLingua',
      body: 'HyperLingua é uma plataforma de aprendizado de idiomas projetada para ajudá-lo a dominar qualquer idioma através da prática ativa com frases reais faladas por nativos. Diferente dos aplicativos tradicionais que dependem de gamificação, HyperLingua foca em construir compreensão genuína e habilidades de fala. O conteúdo está organizado em Ilhas Linguísticas — coleções temáticas de diálogos, histórias e frases independentes que o imergem no uso real do idioma.'
    },
    {
      icon: <Info size={24} />,
      title: 'Como usar o aplicativo',
      body: 'Comece explorando as Ilhas Linguísticas na aba ilhas. Cada ilha contém diálogos, histórias e frases independentes organizadas por tópico. Selecione uma ilha e escolha um tipo de conteúdo para começar a praticar. Depois você pode criar suas próprias ilhas personalizadas e salvar frases favoritas. Use a tela Início para acesso rápido às categorias de vocabulário e ilhas recentes.'
    },
    {
      icon: <WifiOff size={24} />,
      title: 'Modo offline',
      body: 'Pratique suas ilhas favoritas sem internet — no app móvel. Ao explorar uma ilha, o app prepara o áudio em segundo plano. Você verá Cached: 50% (ou similar) abaixo do nome; em Offline ready, todas as gravações estão no telefone. Isso ainda não salva a ilha — só prepara o áudio até você tocar em Save. Toque em Save no canto superior para guardar a ilha no dispositivo. O botão mostra o progresso (ex. Saving - 64%) até frases, traduções e áudio estarem completos. Depois muda para Offline. Toque em Offline para ver o que está salvo, remover ou atualizar se houver novas gravações. Gerencie em Profile → Saved offline: quantas ilhas e espaço usado. No limite, escolha outra ilha para substituir. Ative Audio cache em Practice settings (pré-carregar todas as frases). Ilhas salvas abrem na aba ilhas sem conexão.'
    },
    {
      icon: <Volume2 size={24} />,
      title: 'Modo Ouça e Repita',
      body: 'Listen & Repeat is the foundation of language learning in HyperLingua. In this mode, you see the sentence in the target language and hear it spoken by a native speaker. Your job is to listen carefully and repeat it out loud. This builds your listening comprehension, pronunciation, and natural rhythm. The more you listen and repeat, the more naturally you will recognize words and sentence patterns. Think of it like training your ear — you are teaching your brain to decode sounds into meaning. Start with sentences you find easy and gradually work up to more challenging ones.'
    },
    {
      icon: <Lightbulb size={24} />,
      title: 'Active Recall Mode',
      body: 'Active Recall is the most powerful technique for building speaking ability. In this mode, you see the sentence in your native language and must try to produce the target language version from memory before revealing it. This forces your brain to actively construct sentences rather than passively recognize them. Research shows that active recall strengthens neural pathways far more effectively than passive review. When you struggle to recall a sentence, that effort is actually when the most learning happens. Do not get discouraged by mistakes — each attempt strengthens your memory. Use this mode after you feel comfortable with Listen & Repeat.'
    },
    {
      icon: <Star size={24} />,
      title: 'Understanding the Rating System',
      body: 'Each sentence has a 5-star rating that you control. This is your honest self-assessment of how well you know that sentence. Rate each sentence separately for Listen & Repeat and Active Recall — they track different skills. A 1-star rating means you barely understand it; 5 stars means you can produce it perfectly from memory. Be honest with your ratings — they are for your benefit only. Sentences rated 5 stars are considered "mastered." Your progress percentage is based on how many sentences reach 5 stars. You can tap a star rating to change it at any time, and tap the same star again to lower it by one.'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'CEFR Levels & Your Progress',
      body: 'Your language level is determined by the number of unique words you have mastered, following the Common European Framework of Reference (CEFR). As you master more sentences (rating them 5 stars), the unique words in those sentences count toward your level. Levels range from A1 (Beginner) through C2 (Mastery). Your level is tracked separately for Listen & Repeat and Active Recall, since comprehension and production are different skills. Check your current level and word counts in the Stats tab. The thresholds for each level can be customized by administrators.'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Tips for Success',
      body: 'Practice daily, even if only for 10-15 minutes — consistency beats intensity. Start with Listen & Repeat to build comprehension before moving to Active Recall. Focus on one island at a time rather than jumping between many. Use the auto-play feature to listen to sentences hands-free during commutes or walks. Rate honestly — upgrading a sentence from 3 to 5 stars too quickly means you will forget it. Revisit sentences rated 3-4 stars regularly until they feel natural. Pay attention to sentence rhythm and intonation, not just individual words. Trust the process — fluency comes from thousands of small repetitions, not from memorizing grammar rules.'
    }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Como usar o HyperLingua</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Guia completo de metodologia, recursos e melhores práticas de estudo.</p>
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
