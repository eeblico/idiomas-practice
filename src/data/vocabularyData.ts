export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  category: 'comum' | 'viagem' | 'trabalho' | 'dia_a_dia' | 'sentimentos' | 'comida';
  example: string;
  exampleTranslation: string;
  phonetic?: string;
}

export const staticVocabulary: Record<string, VocabularyWord[]> = {
  en: [
    // Iniciante
    { id: 'en-1', word: 'Hello', translation: 'Olá / Oi', level: 'iniciante', category: 'comum', example: 'Hello, how are you today?', exampleTranslation: 'Olá, como você está hoje?', phonetic: '/həˈloʊ/' },
    { id: 'en-2', word: 'Thank you', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Thank you for your help.', exampleTranslation: 'Obrigado pela sua ajuda.', phonetic: '/θæŋk ju/' },
    { id: 'en-3', word: 'Water', translation: 'Água', level: 'iniciante', category: 'comida', example: 'Can I have a glass of water?', exampleTranslation: 'Pode me dar um copo de água?', phonetic: '/ˈwɔːtər/' },
    { id: 'en-4', word: 'Airport', translation: 'Aeroporto', level: 'iniciante', category: 'viagem', example: 'Where is the nearest airport?', exampleTranslation: 'Onde fica o aeroporto mais próximo?', phonetic: '/ˈerpɔːrt/' },
    { id: 'en-5', word: 'Happy', translation: 'Feliz', level: 'iniciante', category: 'sentimentos', example: 'She is very happy with the results.', exampleTranslation: 'Ela está muito feliz com os resultados.', phonetic: '/ˈhæpi/' },
    // Intermediário
    { id: 'en-6', word: 'Challenge', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'This project is a big challenge.', exampleTranslation: 'Este projeto é um grande desafio.', phonetic: '/ˈtʃælɪndʒ/' },
    { id: 'en-7', word: 'Schedule', translation: 'Cronograma / Agenda', level: 'intermediario', category: 'trabalho', example: 'Let me check my schedule for tomorrow.', exampleTranslation: 'Deixe-me verificar minha agenda para amanhã.', phonetic: '/ˈskedʒuːl/' },
    { id: 'en-8', word: 'Luggage', translation: 'Bagagem', level: 'intermediario', category: 'viagem', example: 'Please do not leave your luggage unattended.', exampleTranslation: 'Por favor, não deixe sua bagagem desacompanhada.', phonetic: '/ˈlʌɡɪdʒ/' },
    { id: 'en-9', word: 'Anxious', translation: 'Ansioso', level: 'intermediario', category: 'sentimentos', example: 'He feels anxious about the job interview.', exampleTranslation: 'Ele se sente ansioso com a entrevista de emprego.', phonetic: '/ˈæŋkʃəs/' },
    { id: 'en-10', word: 'Routine', translation: 'Rotina', level: 'intermediario', category: 'dia_a_dia', example: 'Exercising is part of my morning routine.', exampleTranslation: 'Exercitar-se faz parte da minha rotina matinal.', phonetic: '/ruːˈtiːn/' },
    // Advanced
    { id: 'en-11', word: 'Ubiquitous', translation: 'Onipresente / Onipresentes', level: 'avancado', category: 'comum', example: 'Smartphones are ubiquitous in modern society.', exampleTranslation: 'Os smartphones são onipresentes na sociedade moderna.', phonetic: '/juːˈbɪkwɪtəs/' },
    { id: 'en-12', word: 'Serendipity', translation: 'Serendipidade / Acaso afortunado', level: 'avancado', category: 'dia_a_dia', example: 'Finding this book was pure serendipity.', exampleTranslation: 'Encontrar este livro foi pura serendipidade.', phonetic: '/ˌserənˈdɪpəti/' },
    { id: 'en-13', word: 'Meticulous', translation: 'Meticuloso / Detalhista', level: 'avancado', category: 'trabalho', example: 'He is meticulous in everything he does.', exampleTranslation: 'Ele é meticuloso em tudo o que faz.', phonetic: '/məˈtɪkjələs/' },
    { id: 'en-14', word: 'Melancholy', translation: 'Melancolia', level: 'avancado', category: 'sentimentos', example: 'A feeling of melancholy filled the room.', exampleTranslation: 'Um sentimento de melancolia encheu a sala.', phonetic: '/ˈmelənkɑːli/' },
    { id: 'en-15', word: 'Delicious', translation: 'Delicioso', level: 'iniciante', category: 'comida', example: 'This cake smells delicious.', exampleTranslation: 'Este bolo cheira delicioso.', phonetic: '/dɪˈlɪʃəs/' }
  ],
  es: [
    // Iniciante
    { id: 'es-1', word: 'Hola', translation: 'Olá / Oi', level: 'iniciante', category: 'comum', example: 'Hola, buenas tardes.', exampleTranslation: 'Olá, boa tarde.', phonetic: '/ˈola/' },
    { id: 'es-2', word: 'Gracias', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Muchas gracias por todo.', exampleTranslation: 'Muito obrigado por tudo.', phonetic: '/ˈɡɾaθjas/' },
    { id: 'es-3', word: 'Agua', translation: 'Água', level: 'iniciante', category: 'comida', example: 'Un vaso de agua, por favor.', exampleTranslation: 'Um copo de água, por favor.', phonetic: '/ˈaɣwa/' },
    { id: 'es-4', word: 'Viaje', translation: 'Viagem', level: 'iniciante', category: 'viagem', example: '¡Buen viaje a todos!', exampleTranslation: 'Boa viagem a todos!', phonetic: '/ˈbja-xe/' },
    // Intermediário
    { id: 'es-5', word: 'Desafío', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'Superar este examen es un gran desafío.', exampleTranslation: 'Superar este exame é um grande desafio.', phonetic: '/de.saˈfi.o/' },
    { id: 'es-6', word: 'Equipaje', translation: 'Bagagem', level: 'intermediario', category: 'viagem', example: 'Perdí mi equipaje en el vuelo.', exampleTranslation: 'Perdi minha bagagem no voo.', phonetic: '/e.kiˈpa.xe/' },
    { id: 'es-7', word: 'Orgulloso', translation: 'Orgulhoso', level: 'intermediario', category: 'sentimentos', example: 'Estoy orgulloso de tu trabajo.', exampleTranslation: 'Estou orgulhoso do seu trabalho.', phonetic: '/oɾ.ɣuˈʝo.so/' },
    { id: 'es-8', word: 'Cotidiano', translation: 'Cotidiano / Diário', level: 'intermediario', category: 'dia_a_dia', example: 'La lectura es parte de mi vivir cotidiano.', exampleTranslation: 'A leitura faz parte do meu viver cotidiano.', phonetic: '/ko.tiˈðja.no/' },
    // Avançado
    { id: 'es-9', word: 'Efímero', translation: 'Efêmero / Passageiro', level: 'avancado', category: 'comum', example: 'El éxito en las redes suele ser efímero.', exampleTranslation: 'O sucesso nas redes costuma ser efêmero.', phonetic: '/eˈfi.me.ɾo/' },
    { id: 'es-10', word: 'Meticuloso', translation: 'Meticuloso', level: 'avancado', category: 'trabalho', example: 'Es un sastre muy meticuloso con las medidas.', exampleTranslation: 'É um alfaiate muito meticuloso com as medidas.', phonetic: '/me.ti.kuˈlo.so/' },
    { id: 'es-11', word: 'Nostalgia', translation: 'Nostalgia', level: 'avancado', category: 'sentimentos', example: 'Sentí nostalgia al ver las fotos viejas.', exampleTranslation: 'Senti nostalgia ao ver as fotos antigas.', phonetic: '/nosˈtal.xja/' }
  ],
  fr: [
    { id: 'fr-1', word: 'Bonjour', translation: 'Olá / Bom dia', level: 'iniciante', category: 'comum', example: 'Bonjour, comment allez-vous ?', exampleTranslation: 'Bom dia, como vai você?', phonetic: '/bɔ̃ʒuʁ/' },
    { id: 'fr-2', word: 'Merci', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Merci beaucoup pour les fleurs.', exampleTranslation: 'Muito obrigado pelas flores.', phonetic: '/mɛʁsi/' },
    { id: 'fr-3', word: 'Pain', translation: 'Pão', level: 'iniciante', category: 'comida', example: 'Je vais acheter du pain chaud.', exampleTranslation: 'Vou comprar pão quente.', phonetic: '/pɛ̃/' },
    { id: 'fr-4', word: 'Voyage', translation: 'Viagem', level: 'iniciante', category: 'viagem', example: 'Bon voyage en France !', exampleTranslation: 'Boa viagem à França!', phonetic: '/vwajaʒ/' },
    { id: 'fr-5', word: 'Défi', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'Ce nouveau poste est un vrai défi.', exampleTranslation: 'Este novo cargo é um verdadeiro desafio.', phonetic: '/defi/' },
    { id: 'fr-6', word: 'Colère', translation: 'Raiva / Ira', level: 'intermediario', category: 'sentimentos', example: 'Sa colère était visible.', exampleTranslation: 'Sua raiva era visível.', phonetic: '/kɔlɛʁ/' },
    { id: 'fr-7', word: 'Quotidien', translation: 'Cotidiano', level: 'intermediario', category: 'dia_a_dia', example: 'C\'est une tâche de mon travail quotidien.', exampleTranslation: 'É uma tarefa do meu trabalho cotidiano.', phonetic: '/kɔtidjɛ̃/' },
    { id: 'fr-8', word: 'Éphémère', translation: 'Efêmero', level: 'avancado', category: 'comum', example: 'La beauté des fleurs de cerisier est éphémère.', exampleTranslation: 'A beleza das flores de cerejeira é efêmera.', phonetic: '/efemɛʁ/' },
    { id: 'fr-9', word: 'Ménage', translation: 'Limpeza / Tarefas domésticas', level: 'iniciante', category: 'dia_a_dia', example: 'Je fais le ménage le samedi matin.', exampleTranslation: 'Eu faço a limpeza no sábado de manhã.', phonetic: '/menaʒ/' }
  ],
  it: [
    { id: 'it-1', word: 'Ciao', translation: 'Olá / Tchau', level: 'iniciante', category: 'comum', example: 'Ciao! Come va?', exampleTranslation: 'Olá! Como vão as coisas?', phonetic: '/ˈtʃa.o/' },
    { id: 'it-2', word: 'Grazie', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Grazie mille per l\'invito.', exampleTranslation: 'Muito obrigado pelo convite.', phonetic: '/ˈdʒat.tsje/' },
    { id: 'it-3', word: 'Cibo', translation: 'Comida', level: 'iniciante', category: 'comida', example: 'Il cibo italiano è famoso nel mondo.', exampleTranslation: 'A comida italiana é famosa no mundo.', phonetic: '/ˈtʃi.bo/' },
    { id: 'it-4', word: 'Sfida', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'Accettare questo lavoro è una bella sfida.', exampleTranslation: 'Aceitar este trabalho é um bom desafio.', phonetic: '/ˈsfi.da/' },
    { id: 'it-5', word: 'Quotidianità', translation: 'Cotidiano / Dia a dia', level: 'avancado', category: 'dia_a_dia', example: 'La quotidianità a volte stanca.', exampleTranslation: 'O cotidiano às vezes cansa.', phonetic: '/kwotidjanita/' }
  ],
  de: [
    { id: 'de-1', word: 'Hallo', translation: 'Olá', level: 'iniciante', category: 'comum', example: 'Hallo, mein Freund!', exampleTranslation: 'Olá, meu amigo!', phonetic: '/haˈloː/' },
    { id: 'de-2', word: 'Danke', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Danke für das Geschenk.', exampleTranslation: 'Obrigado pelo presente.', phonetic: '/ˈdaŋkə/' },
    { id: 'de-3', word: 'Brot', translation: 'Pão', level: 'iniciante', category: 'comida', example: 'Ich backe frisches Brot.', exampleTranslation: 'Eu asso pão fresco.', phonetic: '/bʁoːt/' },
    { id: 'de-4', word: 'Herausforderung', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'Deutsch lernen ist eine Herausforderung.', exampleTranslation: 'Aprender alemão é um desafio.', phonetic: '/hɛˈʁaʊ̯sfɔʁdəʁʊŋ/' },
    { id: 'de-5', word: 'Alltag', translation: 'Cotidiano / Vida diária', level: 'intermediario', category: 'dia_a_dia', example: 'Das gehört zu meinem Alltag.', exampleTranslation: 'Isso pertence ao meu dia a dia.', phonetic: '/ˈalˌtaːk/' }
  ],
  zh: [
    { id: 'zh-1', word: '你好 (Nǐ hǎo)', translation: 'Olá', level: 'iniciante', category: 'comum', example: '你好，很高兴认识你。', exampleTranslation: 'Olá, muito prazer em conhecer você.', phonetic: 'nǐ hǎo' },
    { id: 'zh-2', word: '谢谢 (Xièxiè)', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: '谢谢你的帮助。', exampleTranslation: 'Obrigado pela sua ajuda.', phonetic: 'xièxie' },
    { id: 'zh-3', word: '水 (Shuǐ)', translation: 'Água', level: 'iniciante', category: 'comida', example: '请给我一杯水。', exampleTranslation: 'Por favor, me dê um copo de água.', phonetic: 'shuǐ' },
    { id: 'zh-4', word: '挑战 (Tiǎozhàn)', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: '这是一次极大的挑战。', exampleTranslation: 'Este é um desafio extremamente grande.', phonetic: 'tiǎozhàn' },
    { id: 'zh-5', word: '幸福 (Xìngfú)', translation: 'Felicidade / Feliz', level: 'intermediario', category: 'sentimentos', example: '祝你们生活幸福。', exampleTranslation: 'Desejo a vocês uma vida feliz.', phonetic: 'xìngfú' }
  ],
  ru: [
    { id: 'ru-1', word: 'Привет (Privet)', translation: 'Olá / Oi', level: 'iniciante', category: 'comum', example: 'Привет! Как дела?', exampleTranslation: 'Oi! Como vão as coisas?', phonetic: 'pri-vyét' },
    { id: 'ru-2', word: 'Спасибо (Spasibo)', translation: 'Obrigado', level: 'iniciante', category: 'comum', example: 'Спасибо за гостеприимство.', exampleTranslation: 'Obrigado pela hospitalidade.', phonetic: 'spa-sí-ba' },
    { id: 'ru-3', word: 'Вода (Voda)', translation: 'Água', level: 'iniciante', category: 'comida', example: 'Дайте мне воды, пожалуйста.', exampleTranslation: 'Dê-me água, por favor.', phonetic: 'va-dá' },
    { id: 'ru-4', word: 'Вызов (Vyzov)', translation: 'Desafio', level: 'intermediario', category: 'trabalho', example: 'Этот проект — новый вызов.', exampleTranslation: 'Этот проект — новый вызов.', phonetic: 'vý-zaf' },
    { id: 'ru-5', word: 'Радость (Radost\')', translation: 'Alegria / Felicidade', level: 'intermediario', category: 'sentimentos', example: 'Она светится от радости.', exampleTranslation: 'Она светится от радости.', phonetic: 'rá-dast\'' }
  ]
};
