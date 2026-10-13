# -*- coding: utf-8 -*-
"""
Script para gerar o Plano Macro em Excel (.xlsx) e Markdown (.md)
Integrando a aula "Aprenda Inglês em 100 Dias" (Ebuli Company / Roberto)
com a estrutura dos Workouts de Chunks (Rotinas, Academia, Yoga, Branding, Conversas Reais)
Organizado por Níveis CEFR (A1, A2, B1, B2).
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_macro_excel(output_path):
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # Cores da Paleta
    NAVY_HEADER = "0F172A"       # Slate 900
    BLUE_HEADER = "1E40AF"       # Blue 800
    SUB_HEADER = "1E293B"        # Slate 800
    BORDER_COLOR = "CBD5E1"      # Slate 300
    
    # Níveis CEFR Cores de Fundo e Texto
    A1_BG = "DBEAFE"  # Light Blue
    A1_FG = "1E40AF"
    A2_BG = "CFFAFE"  # Light Cyan
    A2_FG = "155E75"
    B1_BG = "D1FAE5"  # Light Emerald
    B1_FG = "065F46"
    B2_BG = "EDE9FE"  # Light Purple
    B2_FG = "5B21B6"

    # Estilos de Borda
    thin_border = Border(
        left=Side(style='thin', color=BORDER_COLOR),
        right=Side(style='thin', color=BORDER_COLOR),
        top=Side(style='thin', color=BORDER_COLOR),
        bottom=Side(style='thin', color=BORDER_COLOR)
    )

    # -------------------------------------------------------------
    # ABA 1: VISÃO MACRO & 6 PILARES
    # -------------------------------------------------------------
    ws1 = wb.create_sheet(title="🏛️ Visão Macro & 6 Pilares")
    ws1.views.sheetView[0].showGridLines = True

    # Title
    ws1.merge_cells("A1:G1")
    cell_t1 = ws1["A1"]
    cell_t1.value = "DESAFIO 100 DIAS: O MAPA MACRO DO INGLÊS REAL (METODOLOGIA EBULI)"
    cell_t1.font = Font(name="Segoe UI", size=15, bold=True, color="FFFFFF")
    cell_t1.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t1.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 35

    ws1.merge_cells("A2:G2")
    cell_s1 = ws1["A2"]
    cell_s1.value = "Faxina de 80 para 15 Estruturas • Prática por Caçadas Reais • Frequência Diária (~19 min) • Foco em Nível B1/B2"
    cell_s1.font = Font(name="Segoe UI", size=10, italic=True, color="E2E8F0")
    cell_s1.fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
    cell_s1.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[2].height = 22

    # Tabela dos 6 Pilares
    headers_p = ["Pilar", "Nome do Pilar", "Princípio Central", "O Erro Tradicional", "A Solução dos 100 Dias", "Aplicação Prática no Dia a Dia", "Impacto no Nível"]
    ws1.append([])
    ws1.append(headers_p)
    row_idx = 4
    ws1.row_dimensions[row_idx].height = 26

    for col_idx, h in enumerate(headers_p, start=1):
        cell = ws1.cell(row=row_idx, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER, end_color=BLUE_HEADER, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    pilares_data = [
        (
            "Pilar 1",
            "Faxina Gramatical\n(15 Estruturas)",
            "Você só precisa de 15 estruturas para entender 95% do inglês do dia a dia.",
            "Estudar gramáticas de 80+ tópicos para justificar cursos de 5 anos e 9 livros.",
            "Eliminar voz passiva e termos raros no início; dominar as 15 estruturas frequentes.",
            "Aprender a estrutura uma vez e partir imediatamente para o consumo real.",
            "Base para A1 até B2"
        ),
        (
            "Pilar 2",
            "As Caçadas Diárias\n(Prática Real)",
            "Você aprende consumindo o que ama, não assistindo a aulas passivas (aula = 15% do esforço).",
            "Fazer exercícios de preencher lacunas, true/false e repetições mecânicas sem contexto.",
            "Caçar a estrutura do dia em músicas (Queen), séries (Netflix), podcasts ou YouTube em 30s.",
            "Copiar frases reais no caderno após o contato diário com áudio/texto em inglês.",
            "Retenção Ativa"
        ),
        (
            "Pilar 3",
            "Disciplina pelo Acúmulo\n(Todos os Dias)",
            "Não importa quanto tempo por dia; o que importa é o 'POR DIA'.",
            "Estudar 4 horas no sábado ou 2x na semana e abandonar o contato no resto dos dias.",
            "Contato diário de ~19 minutos por 100 dias seguidos. O acúmulo gera a fluência.",
            "Cumprir a micro-tarefa mesmo nos dias sem motivação (apenas ticar o dia).",
            "Consistência & Hábito"
        ),
        (
            "Pilar 4",
            "Tolerância à Incerteza\n(Vocabulário)",
            "'The more uncertainty you can tolerate, the more success you will have.'",
            "Pausar o filme a cada 10 segundos para traduzir cada palavra desconhecida (tortura).",
            "Regra de ouro: Se pegou o contexto geral ou consegue chutar, não pare. Atropela!",
            "Só traduzir se uma palavra travar 100% o entendimento da mensagem central.",
            "Fluidez de Compreensão"
        ),
        (
            "Pilar 5",
            "Listening Dual\n(Volume & Repetição)",
            "Inglês não tem lógica fonética 1:1. Aprende-se por associação de volume, não por regras.",
            "Tentar criar regras lógicas para exceções fonéticas que se contradizem.",
            "Ouvir e ler inglês ao mesmo tempo todos os dias (áudio e legenda em inglês).",
            "Assistir a séries e ouvir músicas acompanhando a letra para sincronizar cérebro e ouvido.",
            "Compreensão Auditiva"
        ),
        (
            "Pilar 6",
            "Faxina Fonética\n(4 Vícios Brasileiros)",
            "Não tente falar como nativo; apenas elimine os 4 vícios clássicos que entregam o sotaque.",
            "Tentar imitar sotaques complexos ou estudar 50 regras de fonética abstratas.",
            "Corrigir: 1) Consoantes finais soltas, 2) Som do 'I' curto /ɪ/, 3) Os 3 sons do '-ed', 4) Som do 'TH'.",
            "Falar em voz alta os chunks ajustando a posição da língua e o som fechado.",
            "Clareza & Segurança"
        )
    ]

    for p in pilares_data:
        row_idx += 1
        ws1.row_dimensions[row_idx].height = 42
        ws1.append(list(p))
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8FAFC"
        for col in range(1, 8):
            c = ws1.cell(row=row_idx, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [3,4,5,6] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=BLUE_HEADER)

    # Tabela dos Níveis CEFR
    row_idx += 3
    ws1.cell(row=row_idx, column=1, value="🎯 PROGRESSÃO DOS NÍVEIS CEFR NO DESAFIO DE 100 DIAS").font = Font(name="Segoe UI", size=12, bold=True, color=NAVY_HEADER)
    
    row_idx += 1
    headers_cefr = ["Nível CEFR", "Fase no Plano", "Dias de Foco", "Capacidade Comunicativa Real", "Foco Temático Integrado", "Meta de Saída"]
    ws1.row_dimensions[row_idx].height = 24
    for col_idx, h in enumerate(headers_cefr, start=1):
        cell = ws1.cell(row=row_idx, column=col_idx)
        cell.value = h
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    cefr_data = [
        ("A1", "Fase 1: Fundação & Identidade", "Dias 01 a 25", "Compreende frases simples, apresenta-se, fala de rotinas e gostos pessoais.", "Rotina matinal, sono, hábitos diários, pronomes básicos.", "Zero trava com estruturas de sujeito e rotina básica."),
        ("A2", "Fase 2: Ações Passadas & Academia", "Dias 26 a 50", "Relata eventos passados, descreve rotinas de treino e planos imediatos.", "Treinos de musculação, superação física, dietas e histórico pessoal.", "Conta causos do passado e planos futuros com naturalidade."),
        ("B1", "Fase 3: Independência & Branding", "Dias 51 a 75", "Entende séries e filmes com legenda em EN, viaja com autonomia, faz reuniões.", "Branding pessoal, posicionamento, leitura de pessoas e networking.", "Compreensão de 80%+ de conteúdos reais e conversas fluidas."),
        ("B2", "Fase 4: Fluência & Expressão Autêntica", "Dias 76 a 100", "Expressa hipóteses, nuances, metáforas, desabafos e reflexões com naturalidade.", "Identidade autêntica, limites pessoais, conexões profundas e maestria.", "Nível B garantido: apto para certificações e comunicação global.")
    ]

    for lvl, fase, dias, cap, foco, meta in cefr_data:
        row_idx += 1
        ws1.row_dimensions[row_idx].height = 32
        row_vals = [lvl, fase, dias, cap, foco, meta]
        for col_idx, val in enumerate(row_vals, start=1):
            c = ws1.cell(row=row_idx, column=col_idx, value=val)
            c.font = Font(name="Segoe UI", size=9.5)
            c.border = thin_border
            c.alignment = Alignment(horizontal="left" if col_idx in [4,5,6] else "center", vertical="center", wrap_text=True)
            
            # Colors by level
            if lvl == "A1":
                c.fill = PatternFill(start_color=A1_BG, end_color=A1_BG, fill_type="solid")
                if col_idx == 1: c.font = Font(name="Segoe UI", size=10, bold=True, color=A1_FG)
            elif lvl == "A2":
                c.fill = PatternFill(start_color=A2_BG, end_color=A2_BG, fill_type="solid")
                if col_idx == 1: c.font = Font(name="Segoe UI", size=10, bold=True, color=A2_FG)
            elif lvl == "B1":
                c.fill = PatternFill(start_color=B1_BG, end_color=B1_BG, fill_type="solid")
                if col_idx == 1: c.font = Font(name="Segoe UI", size=10, bold=True, color=B1_FG)
            elif lvl == "B2":
                c.fill = PatternFill(start_color=B2_BG, end_color=B2_BG, fill_type="solid")
                if col_idx == 1: c.font = Font(name="Segoe UI", size=10, bold=True, color=B2_FG)

    # Column widths
    ws1.column_dimensions["A"].width = 12
    ws1.column_dimensions["B"].width = 24
    ws1.column_dimensions["C"].width = 38
    ws1.column_dimensions["D"].width = 38
    ws1.column_dimensions["E"].width = 38
    ws1.column_dimensions["F"].width = 38
    ws1.column_dimensions["G"].width = 22

    # -------------------------------------------------------------
    # ABA 2: MATRIZ DOS 15 TÓPICOS ESSENCIAIS (A1-B2)
    # -------------------------------------------------------------
    ws2 = wb.create_sheet(title="📊 Matriz dos 15 Tópicos (A1-B2)")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells("A1:H1")
    cell_t2 = ws2["A1"]
    cell_t2.value = "MATRIZ PEDAGÓGICA: AS 15 ESTRUTURAS ESSENCIAIS DO INGLÊS REAL"
    cell_t2.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    cell_t2.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t2.alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 32

    headers_m15 = ["#", "Estrutura / Tópico", "Nível CEFR", "A Vibe da Estrutura (Analogia)", "Regra Descomplicada", "Master Chunk de Treino", "Contexto de Aplicação", "Tempo Ideal"]
    ws2.append(headers_m15)
    row_m = 2
    ws2.row_dimensions[row_m].height = 24
    for col_idx, h in enumerate(headers_m15, start=1):
        cell = ws2.cell(row=row_m, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER, end_color=BLUE_HEADER, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    matriz_15_data = [
        (1, "Subject Pronouns\n(I, you, he, she, it, we, they)", "A1", "Os Protagonistas da Cena", "Quem executa a ação. Em inglês é obrigatório (não dá pra ocultar).", "We will rock you! / I wake up early.", "Rotinas diárias e hábitos", "Rápido (2-3 dias)"),
        (2, "To Be no Presente\n(am, is, are)", "A1", "O RG & O Estado de Espírito", "Conectar quem você é (identidade) ou como você está agora.", "I am fully committed to my new fitness routine.", "Identidade & bem-estar", "Rápido (3 dias)"),
        (3, "Possessive Adjectives\n(my, your, his, her, its, our, their)", "A1", "A Escritura de Posse", "Indica de quem é a rotina, o projeto, a energia ou o foco.", "My morning routine protects my mental clarity.", "Propósito e rotinas", "Rápido (2 dias)"),
        (4, "Simple Present\n(Ações habituais & fatos)", "A1", "O Estilo de Vida & Hábitos Fixos", "O que você faz no piloto automático (atenção ao 's' na 3ª pessoa).", "I lift heavy weights four times a week.", "Academia e disciplina", "Médio (5 dias)"),
        (5, "Object Pronouns\n(me, you, him, her, it, us, them)", "A2", "O Alvo / Quem Recebe o Impacto", "Vem depois do verbo ou preposição. Quem sofre a ação.", "Working with a coach helped me find my real voice.", "Mentorias e amizades", "Rápido (3 dias)"),
        (6, "Caso Genitivo\n(Possessive 's)", "A2", "A Assinatura do Criador", "Conectar o dono à criação de forma compacta e estilosa.", "The creator's branding is completely authentic.", "Branding e autoridade", "Rápido (2 dias)"),
        (7, "To Be no Passado\n(was, were)", "A2", "O Story de Ontem", "Como você estava ou o que você era em um momento passado.", "I was completely exhausted after that leg workout.", "Recuperação física", "Médio (4 dias)"),
        (8, "Simple Past\n(Verbos regulares/irregulares)", "A2", "O Print Antigo Arquivado de 2021", "Fato pontual que começou e morreu no passado (já foi!).", "I launched my personal brand concept last month.", "Histórias de superação", "Longo (8-10 dias)"),
        (9, "Past Continuous\n(was/were + -ing)", "A2", "O Cenário de Fundo da História", "Uma ação que estava rolando quando outra pontual aconteceu.", "I was meditating when my phone started ringing.", "Mindfulness e imprevistos", "Médio (4 dias)"),
        (10, "Futuros: Will & Going to\n(Intenção vs Plano)", "A2/B1", "Decisão de Momento vs Google Calendar", "'Will' = decisão na hora / promessa; 'Going to' = plano engatilhado.", "I'm going to start a 7-day digital detox this Monday.", "Planejamento e metas", "Médio (5 dias)"),
        (11, "Present Continuous\n(Tempo real & Planos certos)", "B1", "O Story ao Vivo com Bolinha Vermelha", "Ação rolando agora nos bastidores ou compromisso 100% fechado.", "I'm currently rebranding my business and launching soon.", "Projetos e networking", "Médio (5 dias)"),
        (12, "Modal Verbs\n(can, could, should, must, might)", "B1", "Os Tons de Voz & O CSI Social", "Modulam o tom: conselho (should), certeza (must), hipótese (might).", "She must have crushed that workout; she looks so energized.", "Leitura social e conselhos", "Médio (6 dias)"),
        (13, "Present Perfect\n(have/has + particípio)", "B1", "A Fofoca Rendendo / O Caos da Chave", "Ação iniciada no passado que impacta a sua energia AGORA.", "I've worked out consistently and I feel much stronger.", "Consistência e hábitos", "Longo (8-10 dias)"),
        (14, "Present Perfect Continuous\n(have been + -ing)", "B1/B2", "A Barra de Loading em 80%", "Enfatiza a continuidade e o suor de um processo que não parou.", "I've been refining my brand voice for six months.", "Evolução e hipertrofia", "Médio (6 dias)"),
        (15, "Conditionals & Mixed Chunks\n(2nd, 3rd & Mixed)", "B2", "O Multiverso & A Colheita de 90 Dias", "Simulações ('se eu fosse você'), multiverso ('se não tivesse') e colheita.", "If I hadn't stayed consistent, I wouldn't be this confident now.", "Maestria e storytelling", "Longo (10-12 dias)")
    ]

    for row in matriz_15_data:
        row_m += 1
        ws2.row_dimensions[row_m].height = 36
        ws2.append(list(row))
        bg = "FFFFFF" if row_m % 2 == 0 else "F8FAFC"
        lvl = row[2]
        for col in range(1, 9):
            c = ws2.cell(row=row_m, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [2,4,5,6,7] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=BLUE_HEADER)
            elif col == 3:
                # Level badge
                if "A1" in lvl: c.fill = PatternFill(start_color=A1_BG, end_color=A1_BG, fill_type="solid"); c.font = Font(name="Segoe UI", size=9.5, bold=True, color=A1_FG)
                elif "A2" in lvl: c.fill = PatternFill(start_color=A2_BG, end_color=A2_BG, fill_type="solid"); c.font = Font(name="Segoe UI", size=9.5, bold=True, color=A2_FG)
                elif "B1" in lvl: c.fill = PatternFill(start_color=B1_BG, end_color=B1_BG, fill_type="solid"); c.font = Font(name="Segoe UI", size=9.5, bold=True, color=B1_FG)
                elif "B2" in lvl: c.fill = PatternFill(start_color=B2_BG, end_color=B2_BG, fill_type="solid"); c.font = Font(name="Segoe UI", size=9.5, bold=True, color=B2_FG)

    ws2.column_dimensions["A"].width = 5
    ws2.column_dimensions["B"].width = 24
    ws2.column_dimensions["C"].width = 12
    ws2.column_dimensions["D"].width = 28
    ws2.column_dimensions["E"].width = 38
    ws2.column_dimensions["F"].width = 42
    ws2.column_dimensions["G"].width = 24
    ws2.column_dimensions["H"].width = 16

    # -------------------------------------------------------------
    # ABA 3: CRONOGRAMA MACRO DE 100 DIAS
    # -------------------------------------------------------------
    ws3 = wb.create_sheet(title="📅 Cronograma 100 Dias Macro")
    ws3.views.sheetView[0].showGridLines = True

    ws3.merge_cells("A1:I1")
    cell_t3 = ws3["A1"]
    cell_t3.value = "CRONOGRAMA DIÁRIO: 100 DIAS DE CAÇADAS, CHUNKS & PRONÚNCIA"
    cell_t3.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    cell_t3.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t3.alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 32

    headers_100 = ["Dia", "Semana", "Fase / Nível", "Tópico dos 15", "Master Chunk / Estrutura", "Tipo de Caçada", "Micro-Missão (Code-Switching)", "Treino de Pronúncia", "Status"]
    ws3.append(headers_100)
    row_c = 2
    ws3.row_dimensions[row_c].height = 24
    for col_idx, h in enumerate(headers_100, start=1):
        cell = ws3.cell(row=row_c, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER, end_color=BLUE_HEADER, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    # Mapping 100 days
    # Phase 1: Days 1-25 (A1: Subject Pronouns, To Be, Possessives, Simple Present)
    # Phase 2: Days 26-50 (A2: Object Pronouns, Genitive 's, Past To Be, Simple Past, Past Continuous, Futures)
    # Phase 3: Days 51-75 (B1: Present Continuous, Modals, Present Perfect)
    # Phase 4: Days 76-100 (B2: Present Perfect Continuous, Conditionals, Mixed Chunks & Grand Mastery)

    def get_day_info(day):
        week = (day - 1) // 7 + 1
        day_of_week = (day - 1) % 7 + 1

        if day <= 25:
            fase = "Fase 1 (A1: Fundação)"
            if day <= 6:
                topico = "1. Subject Pronouns"
                chunk = "We will rock you! / I wake up with purpose."
                pron = "Consoantes Finais (sem som de 'i')"
            elif day <= 12:
                topico = "2. To Be no Presente"
                chunk = "I am fully dedicated to my wellness and growth."
                pron = "Som do 'I' curto /ɪ/ (is, it)"
            elif day <= 18:
                topico = "3. Possessive Adjectives"
                chunk = "My daily morning routine sets the tone for my day."
                pron = "Som do 'TH' (their, the)"
            else:
                topico = "4. Simple Present"
                chunk = "I lift heavy weights and practice yoga four times a week."
                pron = "Terminações em 's' / 'z'"
        elif day <= 50:
            fase = "Fase 2 (A2: Passado & Hábitos)"
            if day <= 30:
                topico = "5. Object Pronouns & Genitive"
                chunk = "Working with my coach gave me total clarity on my brand."
                pron = "Consoantes Finais (dog, book)"
            elif day <= 36:
                topico = "7. To Be no Passado (was/were)"
                chunk = "I was exhausted yesterday, but today my energy is back."
                pron = "Som do 'was' /wəz/ e 'were' /wɜːr/"
            elif day <= 44:
                topico = "8. Simple Past (Regulares/Irregulares)"
                chunk = "I launched my new brand identity and felt so accomplished."
                pron = "Os 3 sons do '-ed' (/t/, /d/, /ɪd/)"
            else:
                topico = "10. Futuros (Will & Going to)"
                chunk = "I'm going to hit a new PR at the gym this Friday."
                pron = "Som do 'going to' -> 'gonna'"
        elif day <= 75:
            fase = "Fase 3 (B1: Independência)"
            if day <= 56:
                topico = "11. Present Continuous"
                chunk = "I'm currently rebranding my project and launching next week."
                pron = "Terminação '-ing' sem 'g' duro"
            elif day <= 64:
                topico = "12. Modal Verbs (should/must/might)"
                chunk = "You should protect your energy and set clear boundaries."
                pron = "Silent 'L' em should, could, would"
            else:
                topico = "13. Present Perfect (Print vs Fofoca)"
                chunk = "I've worked out consistently for weeks and I feel amazing."
                pron = "Linking sound: I've /aɪv/, He's /hiːz/"
        else:
            fase = "Fase 4 (B2: Fluência & Maestria)"
            if day <= 82:
                topico = "14. Present Perfect Continuous"
                chunk = "I've been refining my authentic brand voice for months."
                pron = "Rhythm & Sentence Stress"
            elif day <= 90:
                topico = "15. Conditionals (2nd & 3rd)"
                chunk = "If I hadn't made that pivot, my life would've been very different."
                pron = "Contração: would've /wʊdəv/, hadn't"
            elif day <= 95:
                topico = "15. Mixed Conditionals & Compromise"
                chunk = "If I hadn't committed 90 days ago, I wouldn't be this confident now."
                pron = "Entonação de autoridade e clareza"
            else:
                topico = "Sprint Final: The Grand Mastery"
                chunk = "All 15 Master Chunks in Live Spoken Flow."
                pron = "Natural Flow & Zero Hesitation"

        # Media hunt type
        media_types = ["Música (Rock/Pop)", "Série (Netflix)", "Podcast (Lifestyle)", "YouTube (Branding/Fitness)", "Série (Comédia/Drama)", "Música (Indie/Acoustic)", "Gravação de Áudio"]
        cacada = media_types[(day - 1) % len(media_types)]

        # Micro mission
        missions = [
            "Falar em PT e encaixar o chunk sobre trabalho/branding",
            "Falar em PT e encaixar o chunk sobre academia/treino",
            "Falar sozinho refletindo sobre hábitos e foco",
            "Criar 2 variações do chunk com seus próprios exemplos",
            "Fazer a caçada em menos de 2 minutos e copiar 3 frases",
            "Usar o chunk em uma mensagem de áudio ou texto real",
            "Gravar áudio de 2 min no celular resumindo a semana"
        ]
        missao = missions[(day - 1) % len(missions)]

        return week, fase, topico, chunk, cacada, missao, pron

    for day in range(1, 101):
        row_c += 1
        week, fase, topico, chunk, cacada, missao, pron = get_day_info(day)
        
        row_vals = [f"D{day:03d}", f"Semana {week:02d}", fase, topico, chunk, cacada, missao, pron, "[  ]"]
        ws3.append(row_vals)
        ws3.row_dimensions[row_c].height = 28
        
        bg = "FFFFFF" if day % 2 == 0 else "F8FAFC"
        lvl_color = A1_FG
        if "A1" in fase: bg = "EFF6FF" if day % 2 == 0 else "DBEAFE"; lvl_color = A1_FG
        elif "A2" in fase: bg = "ECFEFF" if day % 2 == 0 else "CFFAFE"; lvl_color = A2_FG
        elif "B1" in fase: bg = "ECFDF5" if day % 2 == 0 else "D1FAE5"; lvl_color = B1_FG
        elif "B2" in fase: bg = "F5F3FF" if day % 2 == 0 else "EDE9FE"; lvl_color = B2_FG

        for col in range(1, 10):
            c = ws3.cell(row=row_c, column=col)
            c.font = Font(name="Segoe UI", size=9)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [4,5,7,8] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9, bold=True, color=NAVY_HEADER)
            elif col == 3:
                c.font = Font(name="Segoe UI", size=8.5, bold=True, color=lvl_color)

    ws3.column_dimensions["A"].width = 8
    ws3.column_dimensions["B"].width = 12
    ws3.column_dimensions["C"].width = 22
    ws3.column_dimensions["D"].width = 24
    ws3.column_dimensions["E"].width = 38
    ws3.column_dimensions["F"].width = 20
    ws3.column_dimensions["G"].width = 38
    ws3.column_dimensions["H"].width = 24
    ws3.column_dimensions["I"].width = 8

    # -------------------------------------------------------------
    # ABA 4: GUIA DE CAÇADAS & CONTEÚDO REAL
    # -------------------------------------------------------------
    ws4 = wb.create_sheet(title="🎯 Guia de Caçadas & Conteúdo")
    ws4.views.sheetView[0].showGridLines = True

    ws4.merge_cells("A1:F1")
    cell_t4 = ws4["A1"]
    cell_t4.value = "GUIA PRÁTICO DAS CAÇADAS: ONDE E COMO ENCONTRAR O INGLÊS REAL"
    cell_t4.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    cell_t4.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t4.alignment = Alignment(horizontal="center", vertical="center")
    ws4.row_dimensions[1].height = 32

    headers_hunt = ["Categoria de Conteúdo", "Exemplos Recomendados", "Por que Funciona?", "Quais Tópicos Caçar?", "Tempo Estimado", "Dica de Ouro"]
    ws4.append(headers_hunt)
    row_h = 2
    ws4.row_dimensions[row_h].height = 24
    for col_idx, h in enumerate(headers_hunt, start=1):
        cell = ws4.cell(row=row_h, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER, end_color=BLUE_HEADER, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    hunts_data = [
        (
            "Músicas (Rock, Pop, Indie)",
            "Queen (We Will Rock You, Bohemian Rhapsody), Coldplay, Billie Eilish, Ed Sheeran, Imagine Dragons",
            "Músicas repetem os 15 tópicos no refrão; melodia gruda o som e a pronúncia no cérebro.",
            "Subject Pronouns, Will, Simple Present, Present Perfect, Modals",
            "1 a 3 minutos",
            "Pegue a letra no Spotify com áudio ligado e copie a frase do refrão na hora."
        ),
        (
            "Séries de Diálogo & Cotidiano",
            "Friends, Modern Family, Suits, The Bear, Emily in Paris, Ted Lasso, Succession",
            "Linguagem da vida real: piadas, gírias, negociações, relacionamentos e café com amigos.",
            "Simple Past, Present Continuous, Object Pronouns, Indirect Questions",
            "5 a 10 minutos de episódio",
            "Áudio em inglês + legenda em inglês. Viu a estrutura? Pausa rápida, anota e continua o episódio."
        ),
        (
            "Podcasts & Lifestyle",
            "The Diary of a CEO (Steven Bartlett), Huberman Lab (Neurociência), Modern Wisdom (Chris Williamson), On Purpose (Jay Shetty)",
            "Conversas longas e naturais sobre hábitos, disciplina, psicologia, academia e propósito.",
            "Present Perfect Continuous, 2nd & 3rd Conditionals, Modals of Deduction",
            "5 minutos de áudio",
            "Ative as legendas automáticas no YouTube ou Apple Podcasts para sincronizar listening dual."
        ),
        (
            "Canais de YouTube (Branding & Design)",
            "The Futur (Chris Do), Ali Abdaal, Dan Koe, Charisma on Command, Yoga with Adriene",
            "Vocabulário focado em negócios autênticos, posicionamento, comunicação magnética e yoga.",
            "Causatives (have/get done), Conditionals of Compromise, Simple Present",
            "3 a 5 minutos",
            "Foque nos primeiros 3 minutos do vídeo, onde o criador apresenta o gancho central."
        ),
        (
            "Livros & Leituras Bilíngues",
            "Atomic Habits (James Clear), Show Your Work (Austin Kleon), Bíblia Bilíngue, The Daily Stoic",
            "Frases curtas, profundas e com alto impacto reflexivo para copiar no caderno.",
            "Simple Present, Used to / Be used to, Conditionals, Wish/If Only",
            "3 a 5 minutos",
            "Leia um parágrafo por dia em voz alta para ativar a musculatura da fala."
        )
    ]

    for row in hunts_data:
        row_h += 1
        ws4.row_dimensions[row_h].height = 42
        ws4.append(list(row))
        bg = "FFFFFF" if row_h % 2 == 0 else "F8FAFC"
        for col in range(1, 7):
            c = ws4.cell(row=row_h, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [2,3,4,6] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=BLUE_HEADER)

    ws4.column_dimensions["A"].width = 24
    ws4.column_dimensions["B"].width = 38
    ws4.column_dimensions["C"].width = 36
    ws4.column_dimensions["D"].width = 32
    ws4.column_dimensions["E"].width = 16
    ws4.column_dimensions["F"].width = 36

    # -------------------------------------------------------------
    # ABA 5: GUIA DE PRONÚNCIA (4 VÍCIOS)
    # -------------------------------------------------------------
    ws5 = wb.create_sheet(title="🗣️ Guia de Pronúncia (4 Vícios)")
    ws5.views.sheetView[0].showGridLines = True

    ws5.merge_cells("A1:F1")
    cell_t5 = ws5["A1"]
    cell_t5.value = "FAXINA FONÉTICA: OS 4 VÍCIOS CLÁSSICOS DO BRASILEIRO NO INGLÊS"
    cell_t5.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    cell_t5.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t5.alignment = Alignment(horizontal="center", vertical="center")
    ws5.row_dimensions[1].height = 32

    headers_pron = ["Vício #", "Nome do Vício Fonético", "Como o Brasileiro Fala (Errado)", "Como Deve Soar (Correto)", "Explicação Anatômica / Dica Prática", "Frase de Treino no Contexto"]
    ws5.append(headers_pron)
    row_p = 2
    ws5.row_dimensions[row_p].height = 24
    for col_idx, h in enumerate(headers_pron, start=1):
        cell = ws5.cell(row=row_p, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER, end_color=BLUE_HEADER, fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    pron_data = [
        (
            "Vício 1",
            "Consoantes Finais Isoladas\n(Adicionar som de 'i')",
            "\"catt-y\", \"dogg-y\", \"doctor-y\", \"gym-y\", \"work-y\"",
            "\"cat\" /kæt/, \"dog\" /dɒɡ/, \"doctor\" /ˈdɒktər/, \"gym\" /dʒɪm/",
            "Em português quase toda palavra termina em vogal. Em inglês, corte o som seco na consoante sem abrir a boca para um 'i'.",
            "\"I hit the gym every day to build a strong back.\""
        ),
        (
            "Vício 2",
            "O Som do 'I' Curto\n(Falar 'i' aberto em vez de /ɪ/)",
            "\"ees\" (is), \"beeg\" (big), \"seex\" (six), \"feex\" (fix), \"thees\" (this)",
            "\"is\" /ɪz/ (puxado pro 'e'), \"big\" /bɪɡ/, \"six\" /sɪks/, \"this\" /ðɪs/",
            "O 'i' curto em inglês não é o nosso 'i' agudo de 'pico'. Ele é um som relaxado, mais próximo de um 'ê' fechado.",
            "\"This is a big step for my personal brand.\""
        ),
        (
            "Vício 3",
            "Os 3 Sons do Sufixo '-ED'\n(Falar 'ed' em tudo)",
            "\"work-ed\", \"help-ed\", \"play-ed\", \"finish-ed\", \"post-ed\"",
            "1) Som /t/: worked, helped, finished\n2) Som /d/: played, lived, loved\n3) Som /ɪd/: wanted, decided, posted",
            "Só pronunciamos a sílaba extra /ɪd/ quando o verbo termina em som de T ou D (want -> wanted). No resto é apenas /t/ ou /d/ mudo!",
            "\"I worked out, launched my brand, and decided to stay consistent.\""
        ),
        (
            "Vício 4",
            "O Som do 'TH'\n(Trocar por T, D, S ou F)",
            "\"tenk you\" (thank), \"dat\" (that), \"tink\" (think), \"fink\" (think)",
            "1) TH Soprado /θ/: thank, think, thought\n2) TH Vibrado /ð/: that, this, they, their",
            "Coloque a pontinha da língua levemente entre os dentes da frente e solte o ar. Sem língua no dente, seu inglês soa artificial.",
            "\"I think that their branding strategy is absolutely authentic.\""
        )
    ]

    for row in pron_data:
        row_p += 1
        ws5.row_dimensions[row_p].height = 45
        ws5.append(list(row))
        bg = "FFFFFF" if row_p % 2 == 0 else "F8FAFC"
        for col in range(1, 7):
            c = ws5.cell(row=row_p, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [2,3,4,5,6] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=BLUE_HEADER)

    ws5.column_dimensions["A"].width = 12
    ws5.column_dimensions["B"].width = 26
    ws5.column_dimensions["C"].width = 28
    ws5.column_dimensions["D"].width = 32
    ws5.column_dimensions["E"].width = 38
    ws5.column_dimensions["F"].width = 38

    # -------------------------------------------------------------
    # ABA 6: DASHBOARD & MÉTRICAS DE EVOLUÇÃO
    # -------------------------------------------------------------
    ws6 = wb.create_sheet(title="📈 Dashboard & Métricas")
    ws6.views.sheetView[0].showGridLines = True

    ws6.merge_cells("A1:F1")
    cell_t6 = ws6["A1"]
    cell_t6.value = "DASHBOARD DE CONTROLE: PROGRESSO & ACÚMULO DOS 100 DIAS"
    cell_t6.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    cell_t6.fill = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
    cell_t6.alignment = Alignment(horizontal="center", vertical="center")
    ws6.row_dimensions[1].height = 32

    # Metric Cards layout
    ws6.cell(row=3, column=1, value="📊 RESUMO DE DIAS & ACÚMULO").font = Font(name="Segoe UI", size=11, bold=True, color=BLUE_HEADER)
    
    headers_db1 = ["Indicador de Progresso", "Meta do Programa", "Dias Concluídos", "% Conclusão", "Status de Consistência"]
    ws6.row_dimensions[4].height = 22
    for col_idx, h in enumerate(headers_db1, start=1):
        c = ws6.cell(row=4, column=col_idx, value=h)
        c.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        c.fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = thin_border

    db_rows = [
        ("Fase 1: Fundação & Identidade (A1)", "25 dias", "=COUNTIF('📅 Cronograma 100 Dias Macro'!I3:I27, \"[X]\")", "=C5/25", "Fundação"),
        ("Fase 2: Ações Passadas & Academia (A2)", "25 dias", "=COUNTIF('📅 Cronograma 100 Dias Macro'!I28:I52, \"[X]\")", "=C6/25", "Construção de Histórias"),
        ("Fase 3: Independência & Branding (B1)", "25 dias", "=COUNTIF('📅 Cronograma 100 Dias Macro'!I53:I77, \"[X]\")", "=C7/25", "Autonomia em Séries & Viagens"),
        ("Fase 4: Fluência & Expressão (B2)", "25 dias", "=COUNTIF('📅 Cronograma 100 Dias Macro'!I78:I102, \"[X]\")", "=C8/25", "Maestria & Nível B Garantido"),
        ("TOTAL DO PROGRAMA", "100 dias", "=SUM(C5:C8)", "=C9/100", "Meta: Nível B CEFR")
    ]

    for idx, (ind, meta, formula_c, formula_p, stat) in enumerate(db_rows, start=5):
        ws6.row_dimensions[idx].height = 24
        ws6.cell(row=idx, column=1, value=ind).font = Font(name="Segoe UI", size=9.5, bold=(idx==9))
        ws6.cell(row=idx, column=2, value=meta).font = Font(name="Segoe UI", size=9.5)
        ws6.cell(row=idx, column=3, value=formula_c).font = Font(name="Segoe UI", size=9.5, bold=True)
        c_pct = ws6.cell(row=idx, column=4, value=formula_p)
        c_pct.font = Font(name="Segoe UI", size=9.5, bold=True)
        c_pct.number_format = '0.0%'
        ws6.cell(row=idx, column=5, value=stat).font = Font(name="Segoe UI", size=9.5)
        
        bg = "EFF6FF" if idx == 9 else ("FFFFFF" if idx % 2 == 0 else "F8FAFC")
        for col in range(1, 6):
            cell = ws6.cell(row=idx, column=col)
            cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            cell.alignment = Alignment(horizontal="left" if col == 1 else "center", vertical="center")
            cell.border = thin_border

    # Checklist dos 6 Pilares
    ws6.cell(row=12, column=1, value="🛡️ AUDITORIA DOS 6 PILARES NO SEU DIA").font = Font(name="Segoe UI", size=11, bold=True, color=BLUE_HEADER)
    headers_db2 = ["Pilar Auditado", "Pergunta de Checagem", "Frequência", "Autoavaliação"]
    ws6.row_dimensions[13].height = 22
    for col_idx, h in enumerate(headers_db2, start=1):
        c = ws6.cell(row=13, column=col_idx, value=h)
        c.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        c.fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = thin_border

    checklist_data = [
        ("1. Gramática", "Estou focando apenas nos 15 tópicos sem perder tempo com regras obscuras?", "Semanal", "[  ] 100% alinhado"),
        ("2. Caçadas", "Fiz minha caçada diária no Spotify, Netflix ou YouTube em poucos minutos?", "Diária", "[  ] Feito hoje"),
        ("3. Disciplina", "Tive contato com o inglês hoje (~19 min) para somar no acúmulo?", "Diária", "[  ] Dia Ticado"),
        ("4. Vocabulário", "Deixei de traduzir tudo e tolerei a incerteza para manter o ritmo gostoso?", "Diária", "[  ] Sem travar"),
        ("5. Listening", "Ouvi e li em inglês ao mesmo tempo para criar associações sonoras?", "Diária", "[  ] Ouvido treinado"),
        ("6. Pronúncia", "Poliei as consoantes soltas e o som do 'I' curto ao falar em voz alta?", "Diária", "[  ] Fala limpa")
    ]

    for idx, (p, q, f, a) in enumerate(checklist_data, start=14):
        ws6.row_dimensions[idx].height = 22
        ws6.cell(row=idx, column=1, value=p).font = Font(name="Segoe UI", size=9.5, bold=True, color=BLUE_HEADER)
        ws6.cell(row=idx, column=2, value=q).font = Font(name="Segoe UI", size=9.5)
        ws6.cell(row=idx, column=3, value=f).font = Font(name="Segoe UI", size=9.5)
        ws6.cell(row=idx, column=4, value=a).font = Font(name="Segoe UI", size=9.5, bold=True)
        bg = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
        for col in range(1, 5):
            cell = ws6.cell(row=idx, column=col)
            cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            cell.alignment = Alignment(horizontal="left" if col == 2 else "center", vertical="center")
            cell.border = thin_border

    ws6.column_dimensions["A"].width = 28
    ws6.column_dimensions["B"].width = 45
    ws6.column_dimensions["C"].width = 16
    ws6.column_dimensions["D"].width = 18
    ws6.column_dimensions["E"].width = 30

    # Save
    wb.save(output_path)
    print(f"Planilha Excel Macro criada com sucesso: {output_path}")

def generate_markdown_macro_plan(output_path):
    md = """# 📊 PLANO MACRO DE 100 DIAS: METODOLOGIA & MATRIZ CEFR (A1 -> B2)
*Baseado na Aula 'Aprenda Inglês em 100 Dias' (Ebuli Company / Roberto) e integrado ao Sistema de Chunks & Hábitos*

---

## 🏛️ 1. Os 6 Pilares da Metodologia de 100 Dias

| Pilar | Nome do Pilar | Princípio Central | O Erro Tradicional | A Solução dos 100 Dias | Impacto no Nível |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pilar 1** | **Faxina Gramatical (15 Estruturas)** | Você só precisa de 15 estruturas para entender 95% do inglês real. | Estudar 80+ tópicos para justificar 5 anos de curso. | Focar exclusivamente nas 15 estruturas que aparecem na Netflix e no dia a dia. | Base para A1 até B2 |
| **Pilar 2** | **As Caçadas Diárias (Prática Ativa)** | Você aprende consumindo o que gosta (aula é só 15% do esforço). | Fazer exercícios artificiais de preencher lacunas e true/false. | Caçar frases reais em músicas (Queen), séries e YouTube em menos de 2 minutos. | Retenção Ativa |
| **Pilar 3** | **Disciplina pelo Acúmulo** | 'Não importa quanto tempo por dia, importa o POR DIA.' | Fazer 4 horas no sábado e sumir no resto da semana. | Contato diário de ~19 minutos por 100 dias seguidos. | Consistência |
| **Pilar 4** | **Tolerância à Incerteza (Vocabulário)** | 'The more uncertainty you can tolerate, the more success you will have.' | Pausar a cada 10 segundos para traduzir cada palavra. | Regra de ouro: Se pegou o contexto ou dá pra chutar, atropela! | Fluidez |
| **Pilar 5** | **Listening Dual (Volume)** | Inglês não tem lógica fonética 1:1; aprende-se por volume e associação. | Tentar criar regras para exceções fonéticas que se contradizem. | Ouvir e ler inglês ao mesmo tempo todos os dias (áudio e legenda em EN). | Compreensão Real |
| **Pilar 6** | **Faxina Fonética (4 Vícios)** | Não tente ser nativo; elimine os 4 vícios que entregam o brasileiro. | Estudar 50 regras de fonética abstrata. | Corrigir consoantes soltas, som do 'I' curto, sons do '-ed' e o som do 'TH'. | Clareza & Elegância |

---

## 🎯 2. Progressão dos Níveis CEFR

- **A1 (Dias 01 a 25) - Fundação & Identidade**: Pronomes de sujeito, Verbo To Be no presente, possessivos e hábitos diários (Simple Present).
- **A2 (Dias 26 a 50) - Ações Passadas & Academia**: Pronomes de objeto, caso genitivo ('s), To Be passado, Simple Past (print antigo), Past Continuous e Futuros (will/going to).
- **B1 (Dias 51 a 75) - Independência & Branding**: Present Continuous (tempo real e planos certos), Modal Verbs (tons de voz e CSI social), Present Perfect (fofoca do momento / caos da chave).
- **B2 (Dias 76 a 100) - Fluência & Expressão Autêntica**: Present Perfect Continuous (barra de loading), 2nd & 3rd Conditionals (multiverso), Mixed Conditionals (colheita de 90/100 dias) e Sprint Final de conversação espontânea.

---

## 📊 3. Matriz dos 15 Tópicos Essenciais

1. **Subject Pronouns** (A1): *\"We will rock you! / I wake up with purpose.\"*
2. **To Be no Presente** (A1): *\"I am fully committed to my wellness and growth.\"*
3. **Possessive Adjectives** (A1): *\"My morning routine protects my mental clarity.\"*
4. **Simple Present** (A1): *\"I lift heavy weights four times a week.\"*
5. **Object Pronouns** (A2): *\"Working with a coach helped me find my real voice.\"*
6. **Caso Genitivo ('s)** (A2): *\"The creator's branding is completely authentic.\"*
7. **To Be no Passado** (A2): *\"I was exhausted yesterday, but today my energy is back.\"*
8. **Simple Past** (A2): *\"I launched my personal brand concept last month.\"*
9. **Past Continuous** (A2): *\"I was meditating when my phone started ringing.\"*
10. **Futuros (Will & Going to)** (A2/B1): *\"I'm going to start a 7-day digital detox this Monday.\"*
11. **Present Continuous** (B1): *\"I'm currently rebranding my business and launching soon.\"*
12. **Modal Verbs** (B1): *\"She must have crushed that workout; she looks so energized.\"*
13. **Present Perfect** (B1): *\"I've worked out consistently and I feel much stronger.\"*
14. **Present Perfect Continuous** (B1/B2): *\"I've been refining my brand voice for six months.\"*
15. **Conditionals & Mixed Chunks** (B2): *\"If I hadn't stayed consistent, I wouldn't be this confident now.\"*

---

## 🗣️ 4. Guia de Pronúncia: Os 4 Vícios do Brasileiro

1. **Consoantes Finais Isoladas**: Corte o som seco sem acrescentar o 'i' no final (`cat`, `dog`, `doctor`, `gym`).
2. **O Som do 'I' Curto /ɪ/**: Pronuncie mais relaxado, puxado para um 'ê' fechado (`is`, `this`, `big`, `six`).
3. **Os 3 Sons do Sufixo '-ED'**:
   - Som `/t/`: *worked, helped, finished*
   - Som `/d/`: *played, lived, loved*
   - Som `/ɪd/`: *wanted, decided, posted* (somente após sons de T ou D!)
4. **O Som do 'TH'**: Ponta da língua entre os dentes da frente (`thank`, `think`, `that`, `their`).
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"Arquivo Markdown Macro criado: {output_path}")

if __name__ == "__main__":
    docs_dir = os.path.join(os.path.dirname(__file__), "DOCs")
    xlsx_path = os.path.join(docs_dir, "Plano_Macro_100_Dias_Metodo_e_Estruturas.xlsx")
    md_path = os.path.join(docs_dir, "Plano_Macro_100_Dias_Metodo_e_Estruturas.md")
    
    create_macro_excel(xlsx_path)
    generate_markdown_macro_plan(md_path)
