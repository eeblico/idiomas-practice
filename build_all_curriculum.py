# -*- coding: utf-8 -*-
"""
Script mestre para gerar o Planejamento de 90 Dias de Estruturas em Chunks
Baseado na metodologia da Academia da Fala (Teacher Aline Strabelli)
Com foco em: Rotinas, Academia, Yoga, Branding, Identidade e Conversas Reais.
Gera:
1. Manual Completo (Word .docx + Markdown .md)
2. Calendário de 90 Dias (Word .docx + Markdown .md)
3. Lições Individuais (Word .docx + Markdown .md)
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

WORKOUTS_DATA = [
    {
        "id": 1,
        "slug": "Workout_01_3rd_Conditional_Carreira_Branding",
        "title": "ACADEMIA DA FALA 🗣 Workout 1",
        "theme": "The Butterfly Effect & Past Decisions (3rd Conditional)",
        "master_structure": "If I hadn't made the decision to move abroad, my life would've been very different.",
        "when_to_use": "Quando você estiver refletindo sobre suas decisões passadas de vida, carreira e rotina, expressando alívio por ter evitado um erro ou arrependimento produtivo com o objetivo de analisar o 'efeito borboleta' das suas escolhas.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "O 3rd Conditional é o 'Multiverso das Escolhas' ou o 'Efeito Borboleta'. "
            "É você olhando para o retrovisor da sua vida, abrindo uma linha do tempo paralela imaginária no estilo Marvel "
            "e dizendo: 'Se eu não tivesse virado aquela esquina lá atrás, hoje eu estaria em outro universo'. "
            "Não se prenda a nomes gramaticais! Foque na vibe: ação impossível de mudar no passado + consequência que teria rolado lá atrás."
        ),
        "story": (
            "When I was 22, I was completely stuck in a corporate job that drained my energy every single day. "
            "I had zero time for the gym, my stress levels were through the roof, and I had no creative outlet. "
            "One Sunday evening, after a major anxiety attack, I made the impulsive decision to enroll in a personal branding and digital strategy course, "
            "even though I barely had the money to pay for it.\n\n"
            "Looking back, that was by far the biggest turning point of my life. If I hadn't made that decision to pivot my career, "
            "I would've stayed trapped in that cubicle forever. And if I hadn't started prioritizing my physical health around the same time, "
            "I probably would've burned out completely before turning 25.\n\n"
            "So yeah, reflecting on my past, I can clearly see how my entire identity, my confidence, and my career would have been totally different "
            "if I hadn't taken that first scary step."
        ),
        "drills": [
            ("(expressing relief / career)", "If I hadn't taken that branding workshop, I wouldn't have discovered my real niche."),
            ("(expressing relief / fitness)", "If I hadn't hired a personal trainer, I would've given up on the gym in the first month."),
            ("(expressing regret / health)", "If I had known how bad poor sleep was for my cortisol, I would've fixed my night routine earlier."),
            ("(expressing relief / networking)", "If I hadn't spoken to that stranger at the coffee shop, we wouldn't have become business partners."),
            ("(expressing relief / mental health)", "If I hadn't started journaling every morning, I probably would've burned out last year."),
            ("(expressing relief / identity)", "If I had stayed at that toxic agency, I would've never built my own personal brand."),
            ("(expressing regret / business)", "If I had invested in my visual identity from day one, I would've closed higher-ticket clients sooner."),
            ("(expressing relief / yoga)", "If I hadn't tried that yoga class last winter, my back pain would've gotten unbearable."),
            ("(expressing relief / friendships)", "If we hadn't had that honest conversation, our friendship wouldn't have survived the distance."),
            ("(expressing regret / boundaries)", "If I had expressed my personal boundaries more clearly, I wouldn't have felt so overwhelmed.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "If I hadn't criado aquele posicionamento autêntico, a gente wouldn't have atraído esses clientes tão qualificados."),
            ("🧘‍♂️ Falando sobre vida pessoal / treino", "If I hadn't ido pra academia hoje cedo, eu would've ficado com a energia super baixa o dia todo."),
            ("💭 Falando sozinho / reflexão", "Nossa... If I hadn't tomado aquela decisão difícil de mudar de rotina, minha vida would've been um caos hoje.")
        ],
        "checkout_situation": (
            "Imagine that this morning you woke up feeling super lazy and almost skipped your heavy leg day at the gym. "
            "However, you forced yourself to go. While there, you hit a personal record on your squat and randomly bumped into an influential creator "
            "who invited you to collaborate on a new project. Looking back at your morning decision, express your immense relief using the structure."
        ),
        "checkout_answers": [
            "If I hadn't gone to the gym this morning, I wouldn't have hit a new PR and I wouldn't have met that awesome creator.",
            "If I had stayed in bed scrolling on my phone, I would've missed the best networking opportunity of the month!"
        ]
    },
    {
        "id": 2,
        "slug": "Workout_02_Present_Perfect_vs_Past_Academia_Rotina",
        "title": "ACADEMIA DA FALA 🗣 Workout 2",
        "theme": "Print Antigo vs. Fofoca ao Vivo (Simple Past vs Present Perfect)",
        "master_structure": "I've been working out consistently, and I feel so much more energized.",
        "when_to_use": "Quando você quiser diferenciar um fato morto e pontual no passado (Simple Past) de uma ação, hábito ou acontecimento que começou lá atrás mas cuja energia, resultado ou consequência está mexendo no seu presente AGORA (Present Perfect).",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Simple Past é o 'print antigo arquivado de 2021' — já foi, a história morreu ali, dormiu na praça pensando nela.\n"
            "Present Perfect é a 'fofoca que ainda tá rendendo no grupo agora' ou o 'caos do momento'.\n"
            "Quando você diz 'I lost my keys', é passado concluído, você já fez outra chave semana passada. "
            "Quando você diz 'I've lost my keys', você tá na frente da porta da sua casa agora, olhando pra fechadura e passando perrengue. "
            "Na academia: 'I worked out in 2020' (print velho) vs 'I've worked out every day this month' (tô no shape e com disposição agora!)."
        ),
        "story": (
            "For years, I had an on-and-off relationship with fitness. I joined dozens of gyms, bought expensive gear, but always gave up after three weeks. "
            "Last year, I realized that my lack of physical discipline was directly leaking into my personal brand and my mental clarity.\n\n"
            "So three months ago, I made a non-negotiable rule: no screens before 7 AM, followed by 45 minutes of heavy lifting and mobility work. "
            "Since then, I've worked out four times a week without missing a single session. I've gained 4 kilos of lean muscle, and my posture has improved drastically.\n\n"
            "My friends asked me what changed. I told them: 'In the past, I simply wished for results, but lately I've actually built the identity of someone who loves the process.'"
        ),
        "drills": [
            ("(talking about fitness habits)", "I've worked out four times this week, and my endurance has definitely improved."),
            ("(comparing past vs present)", "I tried yoga three years ago and hated it, but recently I've practiced it every single morning."),
            ("(talking about energy)", "I haven't skipped a morning walk for two months, and my mental clarity has skyrocketed."),
            ("(describing immediate state)", "I've just finished a heavy leg session, so I can barely walk down the stairs right now."),
            ("(personal branding milestone)", "I've redefined my content strategy, and my engagement has doubled this month."),
            ("(social interactions)", "I've met so many inspiring creators since I started working from that local coffee shop."),
            ("(routine adjustments)", "I've cut out caffeine after 2 PM, and I've slept so much deeper over the last few weeks."),
            ("(friendships check-in)", "We haven't caught up in ages, so we've decided to grab brunch together this Saturday."),
            ("(identity evolution)", "I've finally realized that showing my authentic personality online attracts the best opportunities."),
            ("(gym progress)", "I've hit my target bench press weight today, and I'm super proud of this milestone.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I've posted todos os dias essa semana e o engajamento has increased muito."),
            ("🧘‍♂️ Vida Pessoal / Treino", "I've drinked mais de 3 litros de água hoje e I feel com muito mais disposição."),
            ("💭 Falando sozinho / rotina", "Caramba, I've spent muito tempo no celular hoje, preciso fazer um detox de dopamina.")
        ],
        "checkout_situation": (
            "You started doing 20 minutes of yoga and breathwork every single morning about a month ago. "
            "Today, someone at work notices how calm, centered, and relaxed you look despite a stressful deadline. "
            "Explain your new habit and its immediate impact on your wellbeing."
        ),
        "checkout_answers": [
            "I've practiced yoga every morning for the past month, and my stress levels have dropped significantly.",
            "I've completely changed my morning routine recently, and I've never felt this centered!"
        ]
    },
    {
        "id": 3,
        "slug": "Workout_03_Present_Continuous_Branding_Planos",
        "title": "ACADEMIA DA FALA 🗣 Workout 3",
        "theme": "Stories ao Vivo vs. Google Calendar (Present Continuous for Real-Time & Fixed Plans)",
        "master_structure": "I'm currently rebranding my entire project and I'm launching the new identity next week.",
        "when_to_use": "Quando você estiver narrando os bastidores do que está acontecendo agora na sua vida (processo ao vivo) ou combinando planos e compromissos com data e hora já cravados na sua agenda social com amigos e parceiros.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "O Present Continuous tem duas vibes poderosíssimas:\n"
            "1. O 'Story do Instagram ao vivo' — aquela bolinha vermelha brilhando no topo: o que você tá criando, sentindo ou executando neste exato capítulo da sua jornada.\n"
            "2. O 'Google Calendar bloqueado' — aquele compromisso com amigos no sábado que já tá confirmado no grupo do WhatsApp. "
            "Em inglês, planos futuros certos não usam 'will' robótico; eles usam o 'ing' com vibe de compromisso fechado!"
        ),
        "story": (
            "Right now, my whole creative life is undergoing a complete transformation. "
            "I'm redesigning my portfolio, I'm refining my archetype positioning, and I'm writing a brand manifesto that truly reflects my voice.\n\n"
            "I'm also paying close attention to my personal energy. This week, I'm testing a new upper-lower gym split, and I'm meditating for 15 minutes before opening any emails. "
            "Socially, things are exciting too: I'm meeting an old friend for matcha tomorrow afternoon, and we're hosting a small creator dinner this weekend.\n\n"
            "It feels amazing to be in motion—I'm finally aligning my daily actions with the person I'm becoming."
        ),
        "drills": [
            ("(current project in progress)", "I'm currently auditing my personal brand to make my messaging much more authentic."),
            ("(future confirmed plan)", "I'm meeting my accountability partner for a coffee chat tomorrow morning."),
            ("(fitness routine shift)", "I'm following a high-intensity mobility program this month to fix my hip stiffness."),
            ("(daily habit in progress)", "I'm reading a fascinating book on behavioral psychology and self-identity."),
            ("(weekend social plan)", "We're hosting a cozy dinner party with a few close friends this Friday night."),
            ("(live feeling in yoga)", "I'm focusing on deep nasal breathing during my morning stretches right now."),
            ("(branding evolution)", "I'm testing different minimalist color palettes for my new website launch."),
            ("(networking meetup)", "I'm attending a creative networking meetup downtown this Thursday evening."),
            ("(mindset overhaul)", "I'm actively letting go of people-pleasing habits and protecting my focus."),
            ("(nutrition transition)", "I'm increasing my daily protein intake to support my gym recovery.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I'm working em um novo posicionamento de marca and I'm launching tudo na terça que vem."),
            ("🧘‍♂️ Vida Pessoal / Academia", "Hoje I'm taking um rest day porque meu corpo tá exausto, but I'm training pernas amanhã cedo."),
            ("💭 Falando sozinho / planos", "I'm becoming muito mais intencional com o meu tempo e com as pessoas que me cercam.")
        ],
        "checkout_situation": (
            "A friend texts you asking: 'Hey! What are you up to these days, and are you free this weekend?' "
            "Tell them you are currently rebuilding your personal website and that you are having a brunch with your yoga group on Saturday morning."
        ),
        "checkout_answers": [
            "I'm currently rebuilding my personal website from scratch, and I'm having brunch with my yoga group on Saturday!",
            "I'm working on a brand redesign right now, but I'm meeting some friends for coffee on Sunday afternoon if you want to join."
        ]
    },
    {
        "id": 4,
        "slug": "Workout_04_Used_To_Yoga_Novos_Habitos",
        "title": "ACADEMIA DA FALA 🗣 Workout 4",
        "theme": "O Glow-Up de Hábitos & Identidade (Used to vs. Be/Get Used to)",
        "master_structure": "I used to hit snooze five times, but now I'm used to waking up at 6 AM for yoga.",
        "when_to_use": "Quando você estiver compartilhando sua evolução pessoal, contrastando hábitos velhos que você abandonou (used to + verbo base) com a nova rotina que antes parecia difícil mas que agora já virou normal e confortável para você (be/get used to + ING).",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura do 'Carrossel de Glow-Up' ou do 'Antes & Depois' de mentalidade!\n"
            "'Used to' é a sua versão antiga de 2 anos atrás: 'eu costumava comer pizza na cama vendo série até 3 da manhã'.\n"
            "'Be used to + ING' é o seu novo normal, o que o seu corpo já acostumou: 'hoje eu já tô acostumado a tomar banho gelado e treinar em jejum'.\n"
            "'Get used to + ING' é a fase de adaptação, o processo de calejar a mente no novo hábito."
        ),
        "story": (
            "If you knew me three years ago, you wouldn't recognize me today. "
            "I used to live on energy drinks, skip workouts for months, and spend my weekends recovering from burnout. "
            "Whenever someone talked about 6 AM yoga or meal prepping, I used to think: 'That's definitely not for me.'\n\n"
            "When I decided to rebuild my life, the transition was painful. Waking up early felt like torture at first. "
            "But day by day, my nervous system adapted. Now, I'm completely used to waking up at dawn without an alarm. "
            "I'm used to stepping onto my yoga mat before looking at any screens, and I'm getting used to setting firm boundaries with clients.\n\n"
            "Your habits aren't just things you do; they shape the identity you get used to embodying."
        ),
        "drills": [
            ("(fitness evolution)", "I used to hate lifting heavy weights, but now I'm completely used to training four times a week."),
            ("(morning routine)", "I used to check social media first thing in the morning, but now I'm used to meditating for 10 minutes."),
            ("(nutrition adjustment)", "It took me a few weeks, but I'm getting used to having high-protein breakfasts every day."),
            ("(personal branding)", "I used to feel intense imposter syndrome, but now I'm used to sharing my raw perspective online."),
            ("(yoga & mobility)", "I used to have super tight hamstrings, but now I'm used to doing a daily 15-minute stretch routine."),
            ("(social interactions)", "I used to avoid small talk with strangers, but I'm slowly getting used to striking up friendly chats."),
            ("(sleep hygiene)", "I used to stay up scrolling until 1 AM, but now I'm used to reading a book in dim light by 10 PM."),
            ("(identity & confidence)", "I used to say yes to every social invite out of guilt, but now I'm used to protecting my peace."),
            ("(work environment)", "I'm still getting used to working in quiet cafes instead of a chaotic coworking space."),
            ("(gym recovery)", "I used to ignore post-workout recovery, but now I'm used to foam rolling every single evening.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I used to ter pânico de falar em público, but now I'm used to gravar stories sem filtro nenhum."),
            ("🧘‍♂️ Vida Pessoal / Yoga", "I used to acordar arrastado e com dor nas costas, but now I'm used to fazer yoga todos os dias."),
            ("💭 Falando sozinho / adaptação", "Impressionante como I'm getting used to essa nova rotina de foco e disciplina sem distrações.")
        ],
        "checkout_situation": (
            "You run into an old acquaintance from college who remembers you as someone who always ate junk food and stayed up all night playing video games. "
            "Explain how your lifestyle flipped: contrast what you used to do with what you are used to doing now."
        ),
        "checkout_answers": [
            "I used to live on junk food and late nights, but now I'm totally used to meal prepping and hitting the gym at 6:30 AM.",
            "I used to be extremely sedentary, but now I'm used to walking 10,000 steps and doing yoga every single day."
        ]
    },
    {
        "id": 5,
        "slug": "Workout_05_2nd_Conditional_Conselhos_Amizades",
        "title": "ACADEMIA DA FALA 🗣 Workout 5",
        "theme": "O Conselho de Café com Amigo (2nd Conditional for Hypotheticals & Advice)",
        "master_structure": "If I were in your shoes, I would stop overthinking and just publish that content.",
        "when_to_use": "Quando você estiver tendo uma conversa íntima com amigos dando conselhos sinceros ('se eu estivesse no seu lugar'), explorando hipóteses sobre estilo de vida ideal ou imaginando cenários sem a pressão da realidade imediata.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "O 2nd Conditional é 'A Conversa de Café com o Melhor Amigo'. "
            "É aquele momento de vulnerabilidade e cumplicidade onde você diz: 'Cara, se eu fosse você...'. "
            "Você usa o passado imaginário ('If I were you', 'If I had more time') para gerar um conselho poderoso com 'would'. "
            "É a ferramenta perfeita para mentorias, conversas profundas na madrugada e desabafos sobre carreira e relacionamentos."
        ),
        "story": (
            "Yesterday, my best friend called me in tears, completely overwhelmed by self-doubt. "
            "She had spent six months designing a gorgeous yoga & lifestyle brand, but she was terrified of posting it because she feared people's opinions. "
            "We met at a quiet cafe downtown to talk it through.\n\n"
            "I looked at her and said: 'If I were in your shoes, I would stop waiting for perfection and just hit publish today. "
            "If you waited until you felt 100% fearless, you would never share your gift with the world. "
            "And if people judged you, it would only reveal their own insecurities, not your worth.'\n\n"
            "Sometimes, all an ambitious friend needs is someone to reflect the courage they already carry inside."
        ),
        "drills": [
            ("(giving advice to a friend)", "If I were in your shoes, I would stop trying to please everyone and focus on your core tribe."),
            ("(hypothetical lifestyle)", "If I had three extra hours in my day, I would spend them practicing yoga and writing in nature."),
            ("(branding positioning advice)", "If your brand felt more raw and vulnerable, people would connect with your message instantly."),
            ("(gym motivation advice)", "If you focused on progressive overload instead of just burning calories, you would build real strength."),
            ("(talking to strangers)", "If you smiled and made eye contact, strangers would feel so much more comfortable chatting with you."),
            ("(mental health advice)", "If I were feeling that burnt out, I would completely disconnect from my phone for the entire weekend."),
            ("(friendship dynamic)", "If we lived in the same neighborhood, we would train at the gym together every single morning."),
            ("(identity exploration)", "If you stopped copying what everyone else is doing, your true personality would naturally stand out."),
            ("(yoga mindset)", "If you listened to your body's subtle signals, you wouldn't push yourself to the point of pain."),
            ("(daily energy tip)", "If you drank a large glass of water with electrolytes first thing, you would feel ten times more awake.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "If I were in your position, eu would focar em construir autoridade com estudos de caso reais."),
            ("🧘‍♂️ Vida Pessoal / Academia", "Se meu ombro não estivesse tão fadigado, I would treinar peito e tríceps pesado hoje."),
            ("💭 Falando sozinho / conselho", "If I had mais coragem hoje, eu would mandar aquela mensagem sincera pra ele agora mesmo.")
        ],
        "checkout_situation": (
            "A close friend tells you they are terrified of joining the gym because they think everyone will stare at them and judge their body. "
            "Give them empowering, compassionate advice using 'If I were you / in your shoes' and 'would'."
        ),
        "checkout_answers": [
            "If I were in your shoes, I wouldn't worry at all, because everyone at the gym is completely focused on their own workout.",
            "If I were you, I would put on my favorite playlist, wear comfortable clothes, and just focus on how good moving your body feels."
        ]
    },
    {
        "id": 6,
        "slug": "Workout_06_Present_Perfect_Continuous_Voz_Marca_Treino",
        "title": "ACADEMIA DA FALA 🗣 Workout 6",
        "theme": "A Barra de Progresso Carregando (Present Perfect Continuous)",
        "master_structure": "I've been trying to refine my brand voice for months, and it's finally coming together.",
        "when_to_use": "Quando você quiser enfatizar a duração e a persistência de um processo, treino, estudo ou transformação que começou no passado e você CONTINUA fazendo ativamente todos os dias com foco no progresso.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "O Present Perfect Continuous é a 'Barra de Progresso do Download' em 80% ou o timelapse de uma construção!\n"
            "Não é uma foto estática; é o filme do seu esforço. "
            "Quando você diz: 'I've been lifting heavy for 6 months', você tá dizendo pro ouvinte: "
            "'Olha o suor, a consistência diária e a repetição que eu venho sustentando sem parar'. "
            "Perfeito para falar de evolução no shape, refinamento de tom de voz no branding e hábitos de meditação."
        ),
        "story": (
            "Building a truly authentic personal brand doesn't happen overnight. "
            "For the past six months, I've been experimenting with different writing formats, stripping away corporate buzzwords, and finding my real voice. "
            "It felt messy at times, but staying in the arena is what creates clarity.\n\n"
            "The same exact principle applies to my physical training. I've been practicing handstands and shoulder mobility every single morning since January. "
            "In the beginning, I couldn't hold the wall for five seconds. Today, I can hold my balance in the center of the room with steady breath.\n\n"
            "When people ask for the 'secret', I tell them: 'There is no hack. I've simply been showing up on the days when nobody was clapping.'"
        ),
        "drills": [
            ("(brand voice evolution)", "I've been experimenting with a more raw, conversational tone of voice in my content."),
            ("(gym hypertrophy journey)", "I've been lifting heavier weights for the past four months, and my strength has skyrocketed."),
            ("(mindfulness & breathwork)", "I've been doing 15 minutes of breathwork every single morning since the start of the year."),
            ("(social presence)", "I've been trying to be much more present and listen deeply during conversations with my friends."),
            ("(branding psychology)", "I've been studying archetype theory and color psychology to elevate my brand's positioning."),
            ("(yoga progression)", "I've been practicing difficult arm balances for weeks, and my core stability is so much better."),
            ("(routine optimization)", "I've been tracking my sleep quality with a smart ring to optimize my daily energy."),
            ("(networking habit)", "I've been reaching out to one inspiring creator in my niche every single week."),
            ("(recovery focus)", "I've been drinking nearly four liters of water every day to help with muscle soreness."),
            ("(identity consolidation)", "I've been learning to embrace my quirks instead of hiding them behind generic business jargon.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I've been studying branding autêntico nas últimas semanas e isso mudou meu olhar."),
            ("🧘‍♂️ Vida Pessoal / Treino", "I've been going pra academia às 6h da manhã todos os dias e minha energia está surreal."),
            ("💭 Falando sozinho / foco", "Nossa, I've been scrolling no celular por 40 minutos sem perceber, hora de focar de verdade.")
        ],
        "checkout_situation": (
            "Someone at your gym approaches you and says: 'Hey, your posture and lifting technique look so dialed in! What have you been doing?' "
            "Explain that you've been working with a mobility coach and practicing functional movement for the past three months."
        ),
        "checkout_answers": [
            "Thank you! I've been working with a mobility coach and practicing functional warm-ups every day for three months.",
            "I've been focusing heavily on proper lifting mechanics and progressive overload lately, and it's making a huge difference!"
        ]
    },
    {
        "id": 7,
        "slug": "Workout_07_Modals_Deduction_Estranhos_Networking",
        "title": "ACADEMIA DA FALA 🗣 Workout 7",
        "theme": "O CSI Social & Modo Detetive (Modals of Deduction: Must have, Can't be, Might)",
        "master_structure": "She must have been exhausted after that workout; she didn't even reply to my text.",
        "when_to_use": "Quando você estiver observando o comportamento de pessoas, lendo a linguagem corporal em eventos sociais ou na academia, e fazendo deduções inteligentes sobre o que aconteceu ou o que elas estão sentindo.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura do 'Modo Detetive' ou do 'CSI Social'!\n"
            "Quando você vê alguém na academia suando aos baldes e sentado no chão, você não tem 100% de certeza, mas deduz com convicção: 'He must have crushed leg day'.\n"
            "Se a sua amiga que nunca falta ao yoga sumiu: 'She can't be in town' (impossível ela estar aqui).\n"
            "Se um estranho tá olhando pro cardápio perdido num café: 'He might be a tourist'. "
            "Esses modais transformam o seu inglês de robô em uma fala humana, observadora e cheia de nuance social."
        ),
        "story": (
            "Last Thursday, I attended a creative branding summit in the city. The room was packed with designers, strategists, and founders. "
            "Instead of rushing around giving elevator pitches, I decided to grab a matcha latte and observe the social dynamics.\n\n"
            "Near the stage, a young speaker was passionately explaining her thesis. Her eyes were glowing—she must have spent years mastering her craft. "
            "In the back corner, another attendee was quietly typing on his laptop with dark circles under his eyes; he must have pulled an all-nighter for a client deadline. "
            "And a couple near the entrance looked hesitant—they might have felt intimidated by the crowd.\n\n"
            "Mastering social intelligence isn't about being the loudest person; it's about reading the room before you speak."
        ),
        "drills": [
            ("(reading social vibes)", "He must be really passionate about branding; his face literally lit up when he talked about it."),
            ("(gym deduction)", "That athlete must have been training for years; his deadlift form is absolutely textbook."),
            ("(friend's absence)", "She can't be in town right now; she would never miss our Sunday morning yoga session."),
            ("(stranger in a cafe)", "They might be visiting the city for the first time; they look totally fascinated by the architecture."),
            ("(branding perception)", "Their new visual identity must have cost a fortune; the aesthetic is so sleek and elevated."),
            ("(social battery)", "He must have drained his social battery at the event; he slipped out without saying goodbye."),
            ("(fitness intensity)", "You must be starving after that brutal 90-minute workout; let's go grab some clean food."),
            ("(online persona critique)", "That creator can't be as confident in private as they look on camera; it's heavily curated."),
            ("(deep empathy)", "She might have gone through a similar struggle; she understood my emotions immediately."),
            ("(wellness ambiance)", "This yoga studio must have been designed by a minimalist; the light and wood tones are so calming.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Aquela marca must have investido muito em branding pessoal, o tom de voz deles tá impecável."),
            ("🧘‍♂️ Vida Pessoal / Academia", "Aquele cara must have treinado muito pesado hoje, ele mal conseguia subir as escadas."),
            ("💭 Falando sozinho / observação", "Ela can't have esquecido do nosso treino de yoga, algo urgente deve ter acontecido.")
        ],
        "checkout_situation": (
            "Your workout buddy, who is famously disciplined and has never missed a 7 AM gym session in six months, doesn't show up. "
            "Their phone goes straight to voicemail. Make two logical deductions about what happened."
        ),
        "checkout_answers": [
            "He must have overslept after working late on his launch, or his phone battery must have died during the night.",
            "He can't have forgotten our workout; something unexpected must have come up this morning."
        ]
    },
    {
        "id": 8,
        "slug": "Workout_08_Causatives_Design_Personal_Delegar",
        "title": "ACADEMIA DA FALA 🗣 Workout 8",
        "theme": "A Mentalidade de CEO & Delegar pro Mundo (Causatives: Have/Get something done)",
        "master_structure": "I had my graphic designer redesign my visual identity so it matches my real personality.",
        "when_to_use": "Quando você estiver falando sobre contratar profissionais (designers, personal trainers, nutricionistas, massoterapeutas), delegar tarefas e otimizar sua vida para focar apenas naquilo em que você é extraordinário.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura da 'Mentalidade de CEO' e da 'Delegação Estratégica'!\n"
            "Quem tá começando acha que tem que fazer tudo: editar o próprio vídeo, cozinhar todas as marmitas, fazer a logo no Canva e montar o treino sozinho.\n"
            "Quem pensa como estrategista usa causatives: 'I had my photos taken' (contratei fotógrafo), 'I got my nutrition dialed in by a coach' (peguei acompanhamento pro).\n"
            "Estrutura: Subject + have/get + object + past participle (done!)."
        ),
        "story": (
            "For the first two years of my business, I tried to be the hero who did everything. "
            "I designed my own clunky graphics, edited my own podcast until 3 AM, and guessed my way through random gym routines from YouTube. "
            "Result? Severe fatigue, inconsistent branding, and zero muscle gains.\n\n"
            "Last year, I shifted to an owner mindset. I had a brand strategist overhaul my messaging. "
            "I had professional brand portraits shot in natural light, and I got a sports nutritionist to calculate my exact macronutrient targets.\n\n"
            "Delegating isn't an expense—it's the highest form of leverage for your time, your health, and your peace of mind."
        ),
        "drills": [
            ("(branding outsourcing)", "I had a professional copywriter polish my website copy to ensure it sounded completely natural."),
            ("(fitness coaching)", "I got a sports nutritionist to design a customized meal plan for my lean bulking phase."),
            ("(injury prevention)", "I had a physical therapist evaluate my shoulder mobility after I felt a twinge during bench press."),
            ("(creative photoshoot)", "I'm having new brand photos taken next Tuesday for my upcoming masterclass."),
            ("(wellness & recovery)", "I had a sports massage therapist work on my tight back muscles after a grueling week of deadlifts."),
            ("(social hosting)", "We had an artisanal catering service prepare the food for our intimate dinner party with friends."),
            ("(content production)", "I got a talented video editor to turn my long-form podcast into viral short clips."),
            ("(brand audit)", "I had an experienced brand strategist audit my customer journey to optimize conversions."),
            ("(home gym upgrade)", "I had specialized rubber flooring installed in my garage for my personal training corner."),
            ("(time management)", "I got an automated scheduling tool set up so I don't waste hours booking coffee meetings.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I had my designer atualizar a paleta de cores da marca pra transmitir mais sofisticação."),
            ("🧘‍♂️ Vida Pessoal / Saúde", "Eu I'm getting my blood tests done amanhã cedo pra checar minhas vitaminas e taxas hormonais."),
            ("💭 Falando sozinho / organização", "Preciso I need to get my workspace cleaned up antes de começar minha sessão de yoga.")
        ],
        "checkout_situation": (
            "A creator friend compliments the sleek, modern aesthetic of your new branding and asks if you spent weeks designing it yourself. "
            "Explain that you hired a specialized studio to create the visual identity and had a copywriter refine your voice."
        ),
        "checkout_answers": [
            "Thanks so much! I actually had a creative studio design the visual identity, and I had a copywriter refine my brand voice.",
            "I used to do everything myself, but this time I had the entire rebrand handled by talented professionals!"
        ]
    },
    {
        "id": 9,
        "slug": "Workout_09_Wish_If_Only_Vulnerabilidade_Mindfulness",
        "title": "ACADEMIA DA FALA 🗣 Workout 9",
        "theme": "O Desabafo Sincero das 2 AM (Wish / If Only for Vulnerability & Growth)",
        "master_structure": "I wish I had started practicing mindfulness earlier; it would have saved me so much anxiety.",
        "when_to_use": "Quando você estiver expressando vulnerabilidade autêntica em conversas com amigos, refletindo sobre maturidade pessoal, desabafando sobre frustrações do presente ou desejando que certas escolhas passadas tivessem sido mais gentis com você mesmo.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura do 'Desabafo Sincero das 2h da Manhã' e da 'Vulnerabilidade Curadora'!\n"
            "É quando você tira a armadura do LinkedIn e fala de coração aberto com um amigo: "
            "'I wish I didn't care so much about what strangers think' (desejo de presente) ou "
            "'I wish I had prioritized my mental health sooner' (arrependimento transformado em sabedoria).\n"
            "Conectar-se com pessoas de verdade exige saber expressar imperfeição com elegância."
        ),
        "story": (
            "Late last night, sitting on the balcony with tea after a long week, I found myself in a deeply reflective mood. "
            "When we are younger, we rush through life believing we have to prove something to everyone. "
            "We sacrifice sleep for arbitrary metrics and ignore our body's quiet cries for rest.\n\n"
            "Looking back at my 20s, I wish I had understood that peace is more valuable than applause. "
            "I wish I had started lifting weights and doing breathwork ten years ago instead of wasting energy on mindless cardio. "
            "And if only I had trusted my authentic voice sooner, I wouldn't have spent years mimicking other people's styles.\n\n"
            "Regret, when held with compassion, is simply wisdom waiting to guide your next chapter."
        ),
        "drills": [
            ("(mental health reflection)", "I wish I had learned to set firm boundaries earlier without feeling guilty."),
            ("(fitness journey)", "I wish I had focused on proper lifting mechanics from day one instead of lifting with my ego."),
            ("(branding vulnerability)", "I wish I didn't care so much about vanity metrics and algorithmic validation."),
            ("(friendship depth)", "I wish we had more time to slow down like this and have deep, distraction-free talks."),
            ("(yoga & stillness)", "If only I could quiet my racing thoughts during meditation as easily as I do during a heavy set."),
            ("(personality acceptance)", "I wish I had embraced my introverted nature sooner instead of trying to be the loudest in the room."),
            ("(recovery balance)", "I wish I had taken more rest days last month; my nervous system was clearly exhausted."),
            ("(social authenticity)", "If only people were more honest online instead of curating flawless highlight reels."),
            ("(creative intuition)", "I wish I had trusted my creative gut instead of copying cookie-cutter formulas."),
            ("(peaceful environment)", "I wish I lived closer to the ocean so I could practice morning yoga on the sand.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "Eu I wish I had começado a construir minha marca pessoal em torno da minha verdade anos atrás."),
            ("🧘‍♂️ Vida Pessoal / Treino", "I wish I had dormido 8 horas ontem à noite, meu treino hoje teria rendido muito mais."),
            ("💭 Falando sozinho / mente", "I wish I were menos perfeccionista com esses primeiros rascunhos de conteúdo.")
        ],
        "checkout_situation": (
            "You are mentoring a talented younger creator who is working 14 hours a day, skipping the gym, and suffering from severe anxiety. "
            "Share your heartfelt personal reflection about what you wish you had done differently when you were in their shoes."
        ),
        "checkout_answers": [
            "I wish I had prioritized my sleep and physical health when I started out; burning out is never a badge of honor.",
            "If only someone had told me earlier that building a sustainable brand requires a healthy nervous system first!"
        ]
    },
    {
        "id": 10,
        "slug": "Workout_10_Indirect_Questions_Small_Talk_Social",
        "title": "ACADEMIA DA FALA 🗣 Workout 10",
        "theme": "A Arte de Quebrar o Gelo com Elegância (Indirect Questions & Softeners)",
        "master_structure": "I was wondering if you could give me some quick feedback on my new brand concept?",
        "when_to_use": "Quando você estiver puxando papo com estranhos de forma magnética em cafeterias, eventos de networking, coworkings ou na academia, abordando pessoas com simpatia, elegância e zero tom invasivo.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a 'Arte da Finesse Social' e do 'Networking Sem Vergonha Alheia'!\n"
            "Em inglês, perguntar de forma direta ('Where is the barbell?', 'What is your job?') soa seco, quase rude. "
            "Pessoas charmosas e magnéticas usam 'softeners' e indirect questions:\n"
            "'Do you happen to know...?', 'I was wondering if...', 'Would you mind if I...?'. "
            "É o lubrificante social que abre portas, quebra o gelo com estranhos no café e faz você parecer extremamente articulado."
        ),
        "story": (
            "A few weeks ago, I was sitting at a specialty coffee bar working on my laptop. "
            "At the table next to me, someone was sketching intricate wireframes in a notebook, reading a book on typography that I had on my wish list. "
            "Instead of staring awkwardly or interrupting aggressively, I waited for them to close their notebook.\n\n"
            "I smiled and said: 'Excuse me, do you happen to know if that author has a podcast? I've been meaning to dive into their work.' "
            "Their eyes lit up, and they happily recommended three episodes. We ended up chatting for thirty minutes about minimalist design, yoga, and creators we both admired.\n\n"
            "Strangers are just friends you haven't spoken to yet—as long as you know how to open the door with warmth."
        ),
        "drills": [
            ("(coffee shop small talk)", "Excuse me, do you happen to know if this cafe has fast Wi-Fi for video calls?"),
            ("(gym sharing equipment)", "Would you mind if I worked in with you on this squat rack between your sets?"),
            ("(creative feedback)", "I was wondering if you could share your honest initial reaction to this brand tagline?"),
            ("(networking icebreaker)", "Could you tell me what inspired you to attend this creative branding meetup today?"),
            ("(yoga studio etiquette)", "Do you know if we're supposed to leave our shoes in the cubbies before entering the studio?"),
            ("(book enthusiast connection)", "I love that book you're reading; do you happen to know if the author has any other titles?"),
            ("(casual coffee invite)", "I was wondering whether you'd be open to grabbing a 15-minute coffee next week to bounce ideas?"),
            ("(gym gear inquiry)", "Could you tell me where you got those lifting straps? The grip looks fantastic."),
            ("(neighborhood recommendation)", "Do you have any idea where I can find a great restorative yoga class around this area?"),
            ("(setting polite focus)", "Would you mind if I put my headphones on for an hour to wrap up this creative sprint?")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "I was wondering if você teria 5 minutinhos pra me dar um feedback sincero sobre esse novo conceito."),
            ("🧘‍♂️ Vida Pessoal / Academia", "Excuse me, do you happen to know se alguém tá usando esse banco inclinado aqui ao lado?"),
            ("💭 Falando sozinho / dúvida", "I wonder if eu deveria simplificar ainda mais a paleta de cores dessa identidade.")
        ],
        "checkout_situation": (
            "You see someone at a local coffee shop working on an incredible Figma branding board. "
            "You want to politely start a conversation, compliment their typography choices, and ask what kind of project they are building."
        ),
        "checkout_answers": [
            "Excuse me, I couldn't help but notice your Figma board—would you mind if I ask what project you're designing? The aesthetic is gorgeous!",
            "Pardon me, do you happen to know what font family you're using there? The typography looks so clean and elegant."
        ]
    },
    {
        "id": 11,
        "slug": "Workout_11_Conditionals_Compromise_Limites_Identidade",
        "title": "ACADEMIA DA FALA 🗣 Workout 11",
        "theme": "O Contrato Inegociável de Vida (Conditionals of Compromise: As long as, Provided that, Unless)",
        "master_structure": "As long as you stay true to your identity, you don't need to worry about what others think.",
        "when_to_use": "Quando você estiver estabelecendo limites claros e saudáveis em amizades e parcerias, firmando acordos inegociáveis consigo mesmo (treinos, sono, alimentação) e defendendo os valores centrais da sua marca pessoal.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura do 'Manifesto de Princípios Inegociáveis' e dos 'Healthy Boundaries'!\n"
            "Gente sem posicionamento diz sim pra tudo e vive exausta. "
            "Pessoas com identidade forte usam condicionais de compromisso:\n"
            "'As long as / Provided that' (desde que / contanto que) estabelece a regra do jogo.\n"
            "'Unless' (a menos que) protege o seu tempo sagrado. "
            "Exemplo: 'Eu topo ir no rolê, as long as eu possa ir embora às 23h pra acordar pro meu treino de yoga'."
        ),
        "story": (
            "When I first started building an online presence, I said yes to every collaboration, every podcast invite, and every low-ball client. "
            "I thought that being accommodating was the only way to grow. Instead, it diluted my brand voice and destroyed my morning peace.\n\n"
            "One day, I sat down with my journal and drafted my non-negotiable code of conduct. "
            "I decided: 'I will take on new projects, provided that they align with my core values of honesty and depth. "
            "I'm happy to attend social gatherings, as long as my 7 AM gym and yoga routine remains protected. "
            "And unless there is a genuine emergency, I will never check work notifications after sunset.'\n\n"
            "Clear boundaries don't push the right people away—they filter out everyone who doesn't respect your standards."
        ),
        "drills": [
            ("(personal brand boundaries)", "As long as my message is honest and helpful, I don't care about pleasing the algorithm."),
            ("(fitness non-negotiable)", "Provided that I get my four strength sessions in each week, I don't stress over small schedule shifts."),
            ("(healthy friendship dynamic)", "I'm always here to support my friends, as long as there is mutual respect and genuine listening."),
            ("(gym preparedness)", "I always keep electrolytes and a protein shake in my car in case my afternoon meeting runs late."),
            ("(yoga & body wisdom)", "You will make steady, pain-free progress in your mobility, provided that you never force a stretch."),
            ("(protecting mental peace)", "Unless an opportunity aligns directly with my current goals, my default answer is a polite no."),
            ("(social energy management)", "I'd love to stop by your party, as long as you don't mind if I head home early to rest."),
            ("(branding aesthetics)", "Provided that our visual identity stays minimalist and high-contrast, we can test different layouts."),
            ("(building discipline)", "As long as you show up on the mornings you feel unmotivated, you will build unbreakable self-trust."),
            ("(digital detox rule)", "Unless it's a family emergency, I keep my phone on 'Do Not Disturb' mode after 8:30 PM.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "As long as a gente mantenha o posicionamento autêntico, nós podemos experimentar qualquer formato de mídia."),
            ("🧘‍♂️ Vida Pessoal / Treino", "I will go to the gym today provided that eu termine esse relatório até as 17h."),
            ("💭 Falando sozinho / limites", "Unless eu proteja minhas primeiras horas da manhã, meu dia inteiro é sequestrado por urgências dos outros.")
        ],
        "checkout_situation": (
            "A potential corporate client wants to hire you for a branding consultancy, but they want you to work on weekends and discount your rates by 40%. "
            "Politely set your firm boundary using 'provided that' or 'as long as'."
        ),
        "checkout_answers": [
            "I would love to help you elevate your brand, provided that we stick to my standard pricing and keep all deliverables within weekday hours.",
            "We can definitely collaborate, as long as the scope of work respects our designated timeline and standard contract terms."
        ]
    },
    {
        "id": 12,
        "slug": "Workout_12_Mixed_Conditionals_Transformacao_Maestria",
        "title": "ACADEMIA DA FALA 🗣 Workout 12",
        "theme": "A Colheita do Presente pelo Plantio do Passado (Mixed Conditionals & High-Level Nuance)",
        "master_structure": "If I hadn't committed to this routine 90 days ago, I wouldn't have this level of confidence today.",
        "when_to_use": "Quando você estiver celebrando o resultado acumulado da sua jornada de 90 dias, conectando uma decisão ou disciplina sustentada no passado com o seu estado atual de força física, clareza mental, autoridade de marca e fluência espontânea em inglês.",
        "vibe_analogy": (
            "✨ A Vibe da Estrutura (Analogia Gen Z / Vida Real):\n"
            "Essa é a estrutura da 'Colheita do Presente' e da 'Maestria Pessoal'!\n"
            "O Mixed Conditional mistura passado com presente: você conecta a semente que você plantou lá no Dia 1 com a árvore frondosa que você é HOJE.\n"
            "'If I hadn't trained hard in the past (passado), I wouldn't be this strong today (presente)'.\n"
            "É a fala de quem olhou o processo nos olhos, não desistiu no caminho e hoje colhe os frutos de uma identidade reconstruída."
        ),
        "story": (
            "Ninety days ago, I made a silent promise to myself. I was tired of feeling hesitant when speaking English, "
            "tired of skipping my workouts whenever work got busy, and tired of hiding my authentic personality behind bland professional masks.\n\n"
            "It wasn't easy. There were mornings when my bed was warm and the gym was freezing. "
            "There were days when repeating these speech chunks felt repetitive. But day after day, phrase after phrase, set after set, the compound effect worked its magic.\n\n"
            "Today, standing here 90 days later, the transformation is undeniable. "
            "If I hadn't made that non-negotiable commitment three months ago, I wouldn't feel this calm and articulate today. "
            "If I had stayed in my comfort zone, I would still be second-guessing every sentence.\n\n"
            "You don't discover your confidence—you forge it through 90 days of relentless, intentional action."
        ),
        "drills": [
            ("(90-day physical transformation)", "If I hadn't stayed consistent with my workouts for the last 90 days, I wouldn't feel this energetic today."),
            ("(branding authority)", "If I hadn't defined my authentic brand positioning back then, my business wouldn't be this profitable right now."),
            ("(mobility & spine health)", "If I had neglected my daily yoga stretches, my back would still be aching constantly today."),
            ("(spoken fluency flow)", "If I hadn't practiced these sentence chunks out loud every single day, I wouldn't speak with this natural rhythm."),
            ("(high-value network)", "If I hadn't pushed myself to attend that networking dinner, I wouldn't have this incredible inner circle today."),
            ("(emotional resilience)", "If I hadn't started therapy and mindfulness journaling last year, I would still get triggered by small setbacks."),
            ("(social fearlessness)", "If I were still obsessed with people's approval, I wouldn't be sharing my unfiltered ideas online today."),
            ("(mind-body stillness)", "If I hadn't committed to my yoga mat every morning, I wouldn't possess this level of mental clarity right now."),
            ("(sleep & vitality)", "If I hadn't fixed my evening digital habits months ago, I wouldn't wake up feeling this refreshed every single day."),
            ("(authentic self-identity)", "If I hadn't stopped copying what everyone else was doing, my personal brand wouldn't stand out so effortlessly today.")
        ],
        "missions": [
            ("💼 Falando sobre trabalho / branding", "If I hadn't mudado meu posicionamento meses atrás, eu wouldn't have esses clientes incríveis today."),
            ("🧘‍♂️ Vida Pessoal / Academia", "If I hadn't treinado com consistência, eu wouldn't be com esse físico e disposição agora."),
            ("💭 Falando sozinho / celebração", "If I hadn't acreditado no método dos chunks, eu wouldn't be falando com tanta naturalidade hoje!")
        ],
        "checkout_situation": (
            "You are having a coffee with an international entrepreneur or speaking on a podcast about your 90-day transformation. "
            "Reflect on how your past daily discipline in fitness, branding, and spoken English shaped who you are right now."
        ),
        "checkout_answers": [
            "If I hadn't committed to daily deliberate practice 90 days ago, I wouldn't be speaking English with this level of ease and self-assurance today.",
            "If I had given up during the first difficult weeks, I wouldn't have this physical strength, mental peace, and brand clarity right now!"
        ]
    }
]

def format_cell_borders_and_bg(cell, bg_color="F8FAFC", border_color="2563EB"):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
    tcPr.append(shd)
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="14" w:space="0" w:color="{border_color}"/>
            <w:left w:val="single" w:sz="14" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="single" w:sz="14" w:space="0" w:color="{border_color}"/>
            <w:right w:val="single" w:sz="14" w:space="0" w:color="{border_color}"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="160" w:type="dxa"/>
            <w:bottom w:w="160" w:type="dxa"/>
            <w:left w:w="220" w:type="dxa"/>
            <w:right w:w="220" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_box(doc, title, content, bg_color="F8FAFC", border_color="2563EB", title_color=RGBColor(37, 99, 235)):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    format_cell_borders_and_bg(cell, bg_color, border_color)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    if title:
        rt = p.add_run(f"{title}\n")
        rt.font.name = 'Calibri'
        rt.font.size = Pt(12)
        rt.font.bold = True
        rt.font.color.rgb = title_color
    rc = p.add_run(content)
    rc.font.name = 'Calibri'
    rc.font.size = Pt(10.5)
    rc.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_single_workout_doc(workout, output_path):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Header
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_main = p_top.add_run(f"{workout['title']}\n")
    r_main.font.name = 'Calibri'
    r_main.font.size = Pt(22)
    r_main.font.bold = True
    r_main.font.color.rgb = RGBColor(15, 23, 42)

    r_sub = p_top.add_run(f"Tema: {workout['theme']}\n🧳 C h e c k - i n")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # Estrutura da semana Box
    add_box(
        doc,
        "📌 Estrutura da semana (Master Chunk):",
        workout['master_structure'],
        bg_color="EFF6FF",
        border_color="2563EB",
        title_color=RGBColor(29, 78, 216)
    )

    # Quando usar Box
    add_box(
        doc,
        "🎯 Quando usar:",
        workout['when_to_use'] + "\n\n" + workout['vibe_analogy'],
        bg_color="F8FAFC",
        border_color="64748B",
        title_color=RGBColor(15, 23, 42)
    )

    # Audio & Mindset Instructions
    p_audio = doc.add_paragraph()
    r_aud1 = p_audio.add_run("🎧🗣 Treino de Áudio & Repetição Muscular:\n")
    r_aud1.font.bold = True
    r_aud1.font.size = Pt(11)
    r_aud1.font.color.rgb = RGBColor(2, 132, 199)
    r_aud2 = p_audio.add_run(
        "Faça seu treino de 10 minutos em voz alta. Bastam 10 minutos diários para o seu cérebro e aparelho fonador "
        "reiterarem o som da estrutura e você conseguir usá-la no automático sem traduzir regras. "
        "Dá para treinar enquanto dirige, faz cardio na academia, prepara o café ou caminha. Bora! 🚀"
    )
    r_aud2.font.size = Pt(10)
    r_aud2.font.italic = True
    r_aud2.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph("―" * 45).alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Real-Life Short Story
    h_story = doc.add_heading(level=2)
    r_sh = h_story.add_run("📖 Veja a estrutura sendo aplicada à vida real (My Real-Life Story):")
    r_sh.font.color.rgb = RGBColor(126, 34, 206)
    r_sh.font.size = Pt(13)

    p_st = doc.add_paragraph()
    r_st = p_st.add_run(workout['story'])
    r_st.font.size = Pt(10.5)
    r_st.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph("―" * 45).alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Drills
    h_drills = doc.add_heading(level=2)
    r_dh = h_drills.add_run("👂🗣 TREINO PARA MEMORIZAÇÃO SONORA E MUSCULAR DA ESTRUTURA (BOCA):")
    r_dh.font.color.rgb = RGBColor(217, 119, 6)
    r_dh.font.size = Pt(12.5)

    p_d_sub = doc.add_paragraph()
    p_d_sub.add_run("Refletindo sobre rotina, academia, branding e conexões reais (Repita 3x em voz alta cada uma):").font.italic = True

    for i, (tag, sentence) in enumerate(workout['drills'], start=1):
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.2)
        p_item.paragraph_format.space_after = Pt(3)
        r_num = p_item.add_run(f"{i}. {tag}\n")
        r_num.font.bold = True
        r_num.font.size = Pt(10)
        r_num.font.color.rgb = RGBColor(100, 116, 139)
        r_sent = p_item.add_run(f"   \"{sentence}\"")
        r_sent.font.bold = True
        r_sent.font.size = Pt(10.5)
        r_sent.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph("―" * 45).alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Mission of the Day
    h_mis = doc.add_heading(level=2)
    r_mh = h_mis.add_run("🔥 Mission of the day: Coloque a estrutura no seu dia 🚙")
    r_mh.font.color.rgb = RGBColor(220, 38, 38)
    r_mh.font.size = Pt(13)

    p_mis_desc = doc.add_paragraph()
    p_mis_desc.add_run(
        "Use a estrutura de hoje no mínimo 3 vezes ao longo do seu dia. Você NÃO precisa conversar 100% em inglês! "
        "Você pode estar falando normalmente em português com alguém e inserir o chunk em inglês na frase (Code-Switching Híbrido). "
        "Exemplos perfeitos de situações reais para aplicar hoje:\n"
    )

    for icon_title, example_text in workout['missions']:
        add_box(
            doc,
            icon_title,
            example_text,
            bg_color="FFFBEB",
            border_color="F59E0B",
            title_color=RGBColor(180, 83, 9)
        )

    p_rule = doc.add_paragraph()
    p_rule.add_run("Sua única regra 🔥: ").font.bold = True
    p_rule.add_run(
        "Use a estrutura 3 vezes em situações diferentes do seu dia. Lembrou de algo na academia, no trabalho ou conversando com amigos? "
        "Solte a estrutura na hora. Não subestime a Missão do Dia: ela é o segredo da fluência involuntária!"
    )

    doc.add_paragraph("―" * 45).alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Check-out
    p_co_head = doc.add_paragraph()
    p_co_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_co = p_co_head.add_run("🚶 C h e c k - o u t\n")
    r_co.font.bold = True
    r_co.font.size = Pt(14)
    r_co.font.color.rgb = RGBColor(15, 23, 42)

    p_co_sub = doc.add_paragraph()
    p_co_sub.add_run(
        "Ao final do dia, leia o cenário abaixo. Tente lembrar da estrutura, fale a sua frase em voz alta "
        "e só depois confira as respostas prováveis!\n"
        "Fluxo: Situação → Tentar Lembrar → Falar em Voz Alta → Conferir Gabarito"
    ).font.italic = True

    add_box(
        doc,
        "📍 Situation (Active Recall Challenge):",
        workout['checkout_situation'],
        bg_color="F1F5F9",
        border_color="475569",
        title_color=RGBColor(15, 23, 42)
    )

    p_ys = doc.add_paragraph()
    p_ys.add_run("Your sentences 👇\n_________________________________________________________________________________\n_________________________________________________________________________________")
    p_ys.paragraph_format.space_after = Pt(12)

    add_box(
        doc,
        "✅ Find probable answers below:",
        "\n\n".join([f"• {ans}" for ans in workout['checkout_answers']]),
        bg_color="ECFDF5",
        border_color="10B981",
        title_color=RGBColor(4, 120, 87)
    )

    doc.save(output_path)
    print(f"Salvo Workout individual Word: {output_path}")

def generate_markdown_workout(workout):
    md = f"""# {workout['title']}
**Tema:** {workout['theme']}  
**Status:** 🧳 C h e c k - i n

---

### 📌 Estrutura da semana (Master Chunk):
> **`{workout['master_structure']}`**

---

### 🎯 Quando usar:
{workout['when_to_use']}

{workout['vibe_analogy']}

---

### 🎧🗣 Treino de Áudio & Repetição Muscular
Faça seu treino de **10 minutos em voz alta**. Bastam 10 minutos diários para o cérebro e os músculos da boca fixarem o ritmo e a melodia da estrutura sem precisar raciocinar sobre regras. Treine no trânsito, na esteira da academia, arrumando o quarto ou caminhando!

---

### 📖 Veja a estrutura sendo aplicada à vida real (My Real-Life Story):
{workout['story']}

---

### 👂🗣 TREINO PARA MEMORIZAÇÃO SONORA E MUSCULAR DA ESTRUTURA (BOCA)
*Refletindo sobre rotinas, academia, branding e conexões humanas (Repita 3x em voz alta cada frase):*

"""
    for i, (tag, sent) in enumerate(workout['drills'], start=1):
        md += f"{i}. **{tag}**\n   > *\"{sent}\"*\n\n"

    md += """---

### 🔥 Mission of the day: Coloque a estrutura no seu dia 🚙
Use a estrutura de hoje no mínimo **3 vezes ao longo do seu dia**. Você não precisa falar 100% em inglês: use o método de **Code-Switching Híbrido** (fale em português e encaixe a estrutura em inglês).

"""
    for icon_title, ex in workout['missions']:
        md += f"#### {icon_title}\n> \"{ex}\"\n\n"

    md += f"""**Sua única regra 🔥:** Use a estrutura 3 vezes em situações diferentes do seu dia. Lembrou de algo? Treine na hora!

---

### 🚶 C h e c k - o u t
*Situação → Tentar Lembrar → Falar em Voz Alta → Conferir Gabarito*

#### 📍 Situation (Active Recall Challenge):
{workout['checkout_situation']}

#### Your sentences 👇
`_________________________________________________________________________________`  
`_________________________________________________________________________________`

#### ✅ Find probable answers below:
"""
    for ans in workout['checkout_answers']:
        md += f"- *\"{ans}\"*\n"

    return md

def build_full_manual_docx(workouts, output_path):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Title Cover Page
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(36)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("ACADEMIA DA FALA 🗣\nMANUAL COMPLETO DE 90 DIAS\n")
    r_t.font.name = 'Calibri'
    r_t.font.size = Pt(26)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(15, 23, 42)

    r_sub = p_title.add_run("Domínio de Estruturas em Chunks, Memorização Muscular & Comunicação Autêntica\n")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(14)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(37, 99, 235)

    r_tags = p_title.add_run("\nRotinas Pessoais • Academia & Yoga • Branding & Identidade • Conversas com Amigos & Estranhos\n")
    r_tags.font.name = 'Calibri'
    r_tags.font.size = Pt(11)
    r_tags.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # Methodology Guide Box
    add_box(
        doc,
        "🧠 O Manifesto da Metodologia dos Chunks & Vibes:",
        (
            "Por que você ainda trava no inglês mesmo sabendo regras gramaticais?\n"
            "Porque inglês decorado te ensina a traduzir palavras soltas e analisar tabelas frias. "
            "Inglês da vida real te ensina a sentir a VIBE da estrutura e disparar blocos de fala prontos (chunks) com a musculatura da boca!\n\n"
            "• Simple Past é o print antigo arquivado de 2021 (a história morreu ali).\n"
            "• Present Perfect é a fofoca que ainda tá rendendo hoje ou o desespero na porta de casa sem a chave.\n"
            "• Present Continuous é o story ao vivo acontecendo na tela ou a agenda confirmada no Google Calendar.\n"
            "• 3rd Conditional é o multiverso das decisões do passado ('e se?').\n\n"
            "Ao longo destes 90 dias, você não fará exercícios chatos de preencher lacunas. "
            "Você treinará o ouvido 👂, a boca 🗣, aplicará a Missão do Dia em português/inglês híbrido e fará check-outs diários. "
            "Resultado: fluência espontânea, natural e sem medo de se expressar."
        ),
        bg_color="F8FAFC",
        border_color="2563EB",
        title_color=RGBColor(30, 58, 138)
    )

    doc.add_page_break()

    # Index Table
    h_idx = doc.add_heading(level=1)
    h_idx.add_run("📋 Índice Geral dos 12 Workouts Semanais").font.color.rgb = RGBColor(15, 23, 42)

    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    hdr_cells = table.rows[0].cells
    hdr_cells[0].width = Inches(1.2)
    hdr_cells[1].width = Inches(2.3)
    hdr_cells[2].width = Inches(3.0)
    
    headers = ["Workout", "Estrutura Chave", "Tema & Contexto de Vida"]
    for i, h in enumerate(headers):
        format_cell_borders_and_bg(hdr_cells[i], "1E293B", "0F172A")
        p = hdr_cells[i].paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(10)

    for w in workouts:
        row_cells = table.add_row().cells
        row_cells[0].width = Inches(1.2)
        row_cells[1].width = Inches(2.3)
        row_cells[2].width = Inches(3.0)
        
        format_cell_borders_and_bg(row_cells[0], "F8FAFC", "CBD5E1")
        format_cell_borders_and_bg(row_cells[1], "EFF6FF", "CBD5E1")
        format_cell_borders_and_bg(row_cells[2], "F8FAFC", "CBD5E1")

        p0 = row_cells[0].paragraphs[0]
        p0.add_run(f"Workout {w['id']}").font.bold = True
        p0.runs[0].font.size = Pt(9.5)

        p1 = row_cells[1].paragraphs[0]
        p1.add_run(w['master_structure']).font.size = Pt(9)
        p1.runs[0].font.color.rgb = RGBColor(29, 78, 216)

        p2 = row_cells[2].paragraphs[0]
        p2.add_run(w['theme']).font.size = Pt(9)

    doc.add_page_break()

    # Append all workouts
    for w in workouts:
        p_top = doc.add_paragraph()
        p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_main = p_top.add_run(f"{w['title']}\n")
        r_main.font.name = 'Calibri'
        r_main.font.size = Pt(20)
        r_main.font.bold = True
        r_main.font.color.rgb = RGBColor(15, 23, 42)

        r_sub = p_top.add_run(f"Tema: {w['theme']}\n🧳 C h e c k - i n")
        r_sub.font.name = 'Calibri'
        r_sub.font.size = Pt(11.5)
        r_sub.font.color.rgb = RGBColor(71, 85, 105)

        add_box(
            doc,
            "📌 Estrutura da semana (Master Chunk):",
            w['master_structure'],
            bg_color="EFF6FF",
            border_color="2563EB",
            title_color=RGBColor(29, 78, 216)
        )

        add_box(
            doc,
            "🎯 Quando usar:",
            w['when_to_use'] + "\n\n" + w['vibe_analogy'],
            bg_color="F8FAFC",
            border_color="64748B",
            title_color=RGBColor(15, 23, 42)
        )

        p_audio = doc.add_paragraph()
        r_aud1 = p_audio.add_run("🎧🗣 Treino de Áudio & Repetição Muscular (10 min diários em voz alta)\n")
        r_aud1.font.bold = True
        r_aud1.font.size = Pt(10.5)
        r_aud1.font.color.rgb = RGBColor(2, 132, 199)

        # Story
        h_story = doc.add_heading(level=2)
        r_sh = h_story.add_run("📖 Real-Life Story:")
        r_sh.font.color.rgb = RGBColor(126, 34, 206)
        r_sh.font.size = Pt(12)

        p_st = doc.add_paragraph()
        r_st = p_st.add_run(w['story'])
        r_st.font.size = Pt(10)

        # Drills
        h_drills = doc.add_heading(level=2)
        r_dh = h_drills.add_run("👂🗣 Treino para Memorização Sonora e Muscular (Boca):")
        r_dh.font.color.rgb = RGBColor(217, 119, 6)
        r_dh.font.size = Pt(12)

        for i, (tag, sentence) in enumerate(w['drills'], start=1):
            p_item = doc.add_paragraph()
            p_item.paragraph_format.left_indent = Inches(0.15)
            p_item.paragraph_format.space_after = Pt(2)
            r_num = p_item.add_run(f"{i}. {tag}: ")
            r_num.font.bold = True
            r_num.font.size = Pt(9.5)
            r_num.font.color.rgb = RGBColor(100, 116, 139)
            r_sent = p_item.add_run(f"\"{sentence}\"")
            r_sent.font.bold = True
            r_sent.font.size = Pt(10)
            r_sent.font.color.rgb = RGBColor(15, 23, 42)

        # Missions
        h_mis = doc.add_heading(level=2)
        r_mh = h_mis.add_run("🔥 Mission of the day (Code-Switching Híbrido):")
        r_mh.font.color.rgb = RGBColor(220, 38, 38)
        r_mh.font.size = Pt(12)

        for icon_title, example_text in w['missions']:
            add_box(
                doc,
                icon_title,
                example_text,
                bg_color="FFFBEB",
                border_color="F59E0B",
                title_color=RGBColor(180, 83, 9)
            )

        # Check out
        p_co_head = doc.add_paragraph()
        r_co = p_co_head.add_run("🚶 Check-out (Active Recall Situation):")
        r_co.font.bold = True
        r_co.font.size = Pt(11.5)
        r_co.font.color.rgb = RGBColor(15, 23, 42)

        add_box(
            doc,
            "📍 Situation:",
            w['checkout_situation'],
            bg_color="F1F5F9",
            border_color="475569",
            title_color=RGBColor(15, 23, 42)
        )

        add_box(
            doc,
            "✅ Probable Answers:",
            "\n".join([f"• {ans}" for ans in w['checkout_answers']]),
            bg_color="ECFDF5",
            border_color="10B981",
            title_color=RGBColor(4, 120, 87)
        )

        doc.add_page_break()

    # Sprint Final (Dias 85 a 90)
    h_sprint = doc.add_heading(level=1)
    r_sph = h_sprint.add_run("🚀 SPRINT FINAL DE MAESTRIA: DIAS 85 A 90").font.color.rgb = RGBColor(126, 34, 206)

    add_box(
        doc,
        "🎯 Objetivo do Sprint Final:",
        (
            "Nos últimos 6 dias (Dias 85 a 90), seu objetivo é fazer a integração total de todas as estruturas em simulações "
            "ao vivo de 15 minutos sem interrupção.\n"
            "Você passará por conversas com amigos imaginários, podcasts, pitches de branding pessoal e desabafos de rotina."
        ),
        bg_color="FAF5FF",
        border_color="9333EA",
        title_color=RGBColor(126, 34, 206)
    )

    sprint_days = [
        ("Dia 85: The Brand Origin Story Pitch", "Misture 3rd Conditional com Mixed Conditionals contando sua virada de carreira e identidade visual."),
        ("Dia 86: The Fitness & Habit Dialogue", "Converse sobre sua rotina de academia e yoga usando Present Perfect vs Past e Used to vs Be used to."),
        ("Dia 87: The Life Architecture & Boundary Setting", "Apresente seus limites e princípios inegociáveis usando Conditionals of Compromise (as long as, unless)."),
        ("Dia 88: The Late-Night Heart-to-Heart Talk", "Simule uma conversa profunda com seu melhor amigo usando Wish / If Only e 2nd Conditional."),
        ("Dia 89: The Social Magnet & Icebreaker in the Wild", "Pratique abordar 3 pessoas imaginárias em cafés e eventos usando Indirect Questions e Modals of Deduction."),
        ("Dia 90: The Grand Unstoppable Monologue", "Grave um áudio de 10 minutos falando livremente sobre quem você era há 90 dias e quem você se tornou hoje!")
    ]

    for day_title, day_desc in sprint_days:
        add_box(doc, day_title, day_desc, bg_color="F8FAFC", border_color="6366F1", title_color=RGBColor(67, 56, 202))

    doc.save(output_path)
    print(f"Salvo Manual Completo Word: {output_path}")

def build_calendar_docx(workouts, output_path):
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.6)
        s.bottom_margin = Inches(0.6)
        s.left_margin = Inches(0.6)
        s.right_margin = Inches(0.6)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("📅 CALENDÁRIO DE 90 DIAS: ACADEMIA DA FALA\n")
    r_t.font.name = 'Calibri'
    r_t.font.size = Pt(22)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(15, 23, 42)

    r_sub = p_title.add_run("Cronograma Diário de Treino Sonoro, Chunks & Missões de Fixação\n")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(37, 99, 235)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Weekly Day breakdown mapping
    day_mapping_routine = [
        ("Dia 1 da Semana", "Check-in, A Vibe da Estrutura & Leitura da Story em voz alta"),
        ("Dia 2 da Semana", "Drills 1 a 5: Repetição Sonora & Muscular (3x cada) + Missão Trabalho/Branding"),
        ("Dia 3 da Semana", "Drills 6 a 10: Repetição Sonora & Muscular (3x cada) + Missão Pessoal/Academia/Yoga"),
        ("Dia 4 da Semana", "Micro-Variações dos Chunks com seus próprios exemplos reais + Missão Falando Sozinho"),
        ("Dia 5 da Semana", "Active Recall Challenge (Check-out Situation) sem ler o gabarito"),
        ("Dia 6 da Semana", "Code-Switching Intensivo: Usar a estrutura 5x em conversas reais durante o dia"),
        ("Dia 7 da Semana", "Weekly Review & Gravação de Áudio de 3 minutos no WhatsApp / Gravador")
    ]

    # Generate days table
    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    col_widths = [Inches(0.8), Inches(1.0), Inches(1.6), Inches(2.9), Inches(0.7)]
    headers = ["Dia", "Workout", "Estrutura Chave", "Atividade do Dia & Micro-Missão", "Feito?"]

    for i, h in enumerate(headers):
        c = table.rows[0].cells[i]
        c.width = col_widths[i]
        format_cell_borders_and_bg(c, "1E293B", "0F172A")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    current_day = 1

    # Weeks 1 to 12
    for w in workouts:
        w_id = w['id']
        for day_idx in range(7):
            day_label, day_task = day_mapping_routine[day_idx]
            
            row_cells = table.add_row().cells
            for i in range(5):
                row_cells[i].width = col_widths[i]

            bg = "FFFFFF" if current_day % 2 == 0 else "F8FAFC"
            if day_idx == 0:
                bg = "EFF6FF"
            elif day_idx == 6:
                bg = "FEF3C7"

            for i in range(5):
                format_cell_borders_and_bg(row_cells[i], bg, "CBD5E1")

            p_day = row_cells[0].paragraphs[0]
            p_day.add_run(f"D{current_day:02d}").font.bold = True
            p_day.runs[0].font.size = Pt(9)

            p_wk = row_cells[1].paragraphs[0]
            p_wk.add_run(f"W{w_id:02d} (S{w_id})").font.size = Pt(8.5)

            p_st = row_cells[2].paragraphs[0]
            p_st.add_run(w['master_structure'][:38] + "...").font.size = Pt(8.5)
            p_st.runs[0].font.color.rgb = RGBColor(29, 78, 216)

            p_tk = row_cells[3].paragraphs[0]
            p_tk.add_run(f"{day_label}: {day_task}").font.size = Pt(8.5)

            p_chk = row_cells[4].paragraphs[0]
            p_chk.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_chk.add_run("[  ]").font.size = Pt(9)

            current_day += 1

    # Days 85 to 90
    sprint_days_data = [
        ("D85", "Sprint Final", "3rd + Mixed Cond.", "Pitch de Storytelling de Marca Pessoal (15 min gravados)", "[  ]"),
        ("D86", "Sprint Final", "Present Perf + Used to", "Diálogo de Transformação Física & Rotina de Treino", "[  ]"),
        ("D87", "Sprint Final", "Conditionals of Bound.", "Arquitetura de Limites & Princípios Inegociáveis", "[  ]"),
        ("D88", "Sprint Final", "Wish / If Only + 2nd", "Late-Night Talk & Vulnerabilidade com Amigo", "[  ]"),
        ("D89", "Sprint Final", "Indirect Questions + Modals", "Simulação de Networking & Quebrar o Gelo no Café", "[  ]"),
        ("D90", "Sprint Final", "All Master Chunks", "The Grand Unstoppable Monologue de 15 minutos ao vivo", "[  ]")
    ]

    for d_code, w_label, struct, task, chk in sprint_days_data:
        row_cells = table.add_row().cells
        for i in range(5):
            row_cells[i].width = col_widths[i]
            format_cell_borders_and_bg(row_cells[i], "FAF5FF", "A855F7")

        row_cells[0].paragraphs[0].add_run(d_code).font.bold = True
        row_cells[0].paragraphs[0].runs[0].font.size = Pt(9)
        row_cells[1].paragraphs[0].add_run(w_label).font.size = Pt(8.5)
        row_cells[2].paragraphs[0].add_run(struct).font.size = Pt(8.5)
        row_cells[2].paragraphs[0].runs[0].font.color.rgb = RGBColor(126, 34, 206)
        row_cells[3].paragraphs[0].add_run(task).font.size = Pt(8.5)
        row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[4].paragraphs[0].add_run(chk).font.size = Pt(9)

    doc.save(output_path)
    print(f"Salvo Calendário Word: {output_path}")

def generate_markdown_calendar(workouts):
    md = """# 📅 CALENDÁRIO DE 90 DIAS: ACADEMIA DA FALA
**Cronograma Diário de Treino Sonoro, Chunks & Missões de Fixação**

| Dia | Workout / Semana | Estrutura Chave | Atividade do Dia & Micro-Missão | Feito? |
| :--- | :--- | :--- | :--- | :---: |
"""
    day_mapping_routine = [
        ("Dia 1 da Semana", "Check-in, A Vibe da Estrutura & Leitura da Story em voz alta"),
        ("Dia 2 da Semana", "Drills 1 a 5: Repetição Sonora & Muscular (3x cada) + Missão Trabalho/Branding"),
        ("Dia 3 da Semana", "Drills 6 a 10: Repetição Sonora & Muscular (3x cada) + Missão Pessoal/Academia/Yoga"),
        ("Dia 4 da Semana", "Micro-Variações dos Chunks com seus próprios exemplos reais + Missão Falando Sozinho"),
        ("Dia 5 da Semana", "Active Recall Challenge (Check-out Situation) sem ler o gabarito"),
        ("Dia 6 da Semana", "Code-Switching Intensivo: Usar a estrutura 5x em conversas reais durante o dia"),
        ("Dia 7 da Semana", "Weekly Review & Gravação de Áudio de 3 minutos no WhatsApp / Gravador")
    ]

    current_day = 1
    for w in workouts:
        w_id = w['id']
        for day_idx in range(7):
            day_label, day_task = day_mapping_routine[day_idx]
            short_struct = w['master_structure'][:35] + "..."
            md += f"| **D{current_day:02d}** | W{w_id:02d} (Semana {w_id}) | `{short_struct}` | {day_label}: {day_task} | [ ] |\n"
            current_day += 1

    md += """| **D85** | Sprint Final | `3rd + Mixed Cond.` | Pitch de Storytelling de Marca Pessoal (15 min gravados) | [ ] |
| **D86** | Sprint Final | `Present Perf + Used to` | Diálogo de Transformação Física & Rotina de Treino | [ ] |
| **D87** | Sprint Final | `Conditionals of Bound.` | Arquitetura de Limites & Princípios Inegociáveis | [ ] |
| **D88** | Sprint Final | `Wish / If Only + 2nd` | Late-Night Talk & Vulnerabilidade com Amigo | [ ] |
| **D89** | Sprint Final | `Indirect Questions + Modals` | Simulação de Networking & Quebrar o Gelo no Café | [ ] |
| **D90** | Sprint Final | `All Master Chunks` | The Grand Unstoppable Monologue de 15 minutos ao vivo | [ ] |
"""
    return md

def main():
    docs_dir = os.path.join(os.path.dirname(__file__), "DOCs")
    licoes_dir = os.path.join(docs_dir, "licoes")
    os.makedirs(licoes_dir, exist_ok=True)

    # 1. Gerar lições individuais (.docx e .md)
    for w in WORKOUTS_DATA:
        docx_path = os.path.join(licoes_dir, f"{w['slug']}.docx")
        md_path = os.path.join(licoes_dir, f"{w['slug']}.md")
        build_single_workout_doc(w, docx_path)
        
        md_content = generate_markdown_workout(w)
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)
        print(f"Salvo Markdown individual: {md_path}")

    # 2. Gerar Manual Completo (.docx e .md)
    full_docx_path = os.path.join(docs_dir, "Manual_Completo_90_Dias_Estruturas_Chunks.docx")
    build_full_manual_docx(WORKOUTS_DATA, full_docx_path)
    
    full_md_path = os.path.join(docs_dir, "Manual_Completo_90_Dias_Estruturas_Chunks.md")
    full_md_content = "# ACADEMIA DA FALA 🗣 MANUAL COMPLETO DE 90 DIAS\n\n"
    for w in WORKOUTS_DATA:
        full_md_content += generate_markdown_workout(w) + "\n\n---\n\n"
    with open(full_md_path, "w", encoding="utf-8") as f:
        f.write(full_md_content)
    print(f"Salvo Manual Completo Markdown: {full_md_path}")

    # 3. Gerar Calendário de 90 Dias (.docx e .md)
    cal_docx_path = os.path.join(docs_dir, "Calendario_90_Dias_Estruturas_Chunks.docx")
    build_calendar_docx(WORKOUTS_DATA, cal_docx_path)
    
    cal_md_path = os.path.join(docs_dir, "Calendario_90_Dias_Estruturas_Chunks.md")
    cal_md_content = generate_markdown_calendar(WORKOUTS_DATA)
    with open(cal_md_path, "w", encoding="utf-8") as f:
        f.write(cal_md_content)
    print(f"Salvo Calendário Markdown: {cal_md_path}")

    print("\n✅ TODOS OS ARQUIVOS FORAM GERADOS COM SUCESSO!")

if __name__ == "__main__":
    main()
