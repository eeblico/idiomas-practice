# -*- coding: utf-8 -*-
"""
Script para gerar a Planilha Excel com a Arquitetura e Diagrama Visual do Ecossistema de Aprendizagem:
- Imersão no Idioma (Músicas, Séries/Filmes, Vlogs)
- Comprehensible Input (i+1, tolerância à incerteza)
- Ilhas Temáticas (Academia, Yoga, Branding, Social)
- Sentenças & Chunks (blocos pré-fabricados)
- Uso de IA (co-piloto 24/7)
- Revisão Espaçada (SRS / Active Recall)
- Fala Espontânea & Code-Switching
"""

import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_visual_ecosystem_workbook(output_path):
    wb = openpyxl.Workbook()
    wb.remove(wb.active) # Remove default sheet

    # Paleta de Cores
    NAVY_DARK = "0F172A"
    BLUE_HEADER = "1E40AF"
    SLATE_GRAY = "334155"
    BORDER_COLOR = "94A3B8"
    THIN_BORDER_COLOR = "CBD5E1"

    # Cores das Camadas
    LAYER1_BG = "DBEAFE"  # Blue Light
    LAYER1_FG = "1E40AF"  # Blue Dark
    LAYER1_BORDER = "3B82F6"

    LAYER2_BG = "D1FAE5"  # Green Light
    LAYER2_FG = "065F46"  # Green Dark
    LAYER2_BORDER = "10B981"

    LAYER3_BG = "FEF3C7"  # Amber Light
    LAYER3_FG = "92400E"  # Amber Dark
    LAYER3_BORDER = "F59E0B"

    LAYER4_BG = "EDE9FE"  # Purple Light
    LAYER4_FG = "5B21B6"  # Purple Dark
    LAYER4_BORDER = "8B5CF6"

    LAYER5_BG = "CFFAFE"  # Cyan Light
    LAYER5_FG = "155E75"  # Cyan Dark
    LAYER5_BORDER = "06B6D4"

    # Bordas
    thin_border = Border(
        left=Side(style='thin', color=THIN_BORDER_COLOR),
        right=Side(style='thin', color=THIN_BORDER_COLOR),
        top=Side(style='thin', color=THIN_BORDER_COLOR),
        bottom=Side(style='thin', color=THIN_BORDER_COLOR)
    )

    thick_box_border = Border(
        left=Side(style='medium', color=BORDER_COLOR),
        right=Side(style='medium', color=BORDER_COLOR),
        top=Side(style='medium', color=BORDER_COLOR),
        bottom=Side(style='medium', color=BORDER_COLOR)
    )

    # =========================================================================
    # ABA 1: DIAGRAMA ARQUITETURAL VISUAL (EM FORMATO DE BLOCOS NA GRADE)
    # =========================================================================
    ws1 = wb.create_sheet(title="🗺️ Diagrama Visual")
    ws1.views.sheetView[0].showGridLines = True

    # Header Principal
    ws1.merge_cells("A1:G1")
    t1 = ws1["A1"]
    t1.value = "ARQUITETURA DO ECOSSISTEMA DE APRENDIZAGEM ACELERADA DE IDIOMAS"
    t1.font = Font(name="Segoe UI", size=14, bold=True, color="FFFFFF")
    t1.fill = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    t1.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 36

    ws1.merge_cells("A2:G2")
    s1 = ws1["A2"]
    s1.value = "Integração: Imersão (Músicas, Séries, Vlogs) ➔ Ilhas Temáticas ➔ Sentenças & Chunks ➔ IA & SRS ➔ Fala Espontânea"
    s1.font = Font(name="Segoe UI", size=10, italic=True, color="E2E8F0")
    s1.fill = PatternFill(start_color=SLATE_GRAY, end_color=SLATE_GRAY, fill_type="solid")
    s1.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[2].height = 22

    # --- BLOCO 1: IMERSÃO NO IDIOMA ---
    ws1.merge_cells("A4:G4")
    b1_header = ws1["A4"]
    b1_header.value = "🌊 CAMADA 1: IMERSÃO NO IDIOMA & COMPREHENSIBLE INPUT (i + 1)"
    b1_header.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    b1_header.fill = PatternFill(start_color=LAYER1_FG, end_color=LAYER1_FG, fill_type="solid")
    b1_header.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[4].height = 26

    # 3 Fontes de Imersão
    ws1.merge_cells("A5:B6")
    c_mus = ws1["A5"]
    c_mus.value = "🎵 MÚSICAS (Spotify / Letras)\n• Refrões rítmicos memoráveis\n• Padrões de pronúncia e melodia\n• Queen: We Will Rock You (Subject/Will)"
    c_mus.font = Font(name="Segoe UI", size=9.5)
    c_mus.fill = PatternFill(start_color=LAYER1_BG, end_color=LAYER1_BG, fill_type="solid")
    c_mus.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("C5:E6")
    c_ser = ws1["C5"]
    c_ser.value = "🎬 SÉRIES & FILMES (Netflix / Streaming)\n• Diálogos da vida real e contexto visual corporal\n• Áudio em inglês + Legenda em inglês (Listening Dual)\n• Suits, The Bear, Modern Family, Friends"
    c_ser.font = Font(name="Segoe UI", size=9.5)
    c_ser.fill = PatternFill(start_color=LAYER1_BG, end_color=LAYER1_BG, fill_type="solid")
    c_ser.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("F5:G6")
    c_vlog = ws1["F5"]
    c_vlog.value = "📹 VLOGS & PODCASTS (YouTube / Spotify)\n• Fala natural e sem roteiro formal\n• Diary of a CEO, Huberman, Ali Abdaal\n• Rotina matinal, academia, café e reflexões"
    c_vlog.font = Font(name="Segoe UI", size=9.5)
    c_vlog.fill = PatternFill(start_color=LAYER1_BG, end_color=LAYER1_BG, fill_type="solid")
    c_vlog.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.row_dimensions[5].height = 28
    ws1.row_dimensions[6].height = 28

    # Regra de Ouro (Tolerar a Incerteza)
    ws1.merge_cells("A7:G7")
    c_gold = ws1["A7"]
    c_gold.value = "⚡ REGRA DE OURO DO COMPREHENSIBLE INPUT: 'The more uncertainty you can tolerate, the more success you will have.'\nNão pare a cada 10 segundos para traduzir cada palavra solta. Se pegou o contexto geral, ATROPELA e siga em frente!"
    c_gold.font = Font(name="Segoe UI", size=9, bold=True, color="92400E")
    c_gold.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    c_gold.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws1.row_dimensions[7].height = 30

    # Seta
    ws1.merge_cells("A8:G8")
    s_arr1 = ws1["A8"]
    s_arr1.value = "⬇️ FILTRADO E DIRECIONADO PARA TERRITÓRIOS DE DOMÍNIO ⬇️"
    s_arr1.font = Font(name="Segoe UI", size=9, bold=True, color="64748B")
    s_arr1.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[8].height = 20

    # --- BLOCO 2: ILHAS TEMÁTICAS ---
    ws1.merge_cells("A9:G9")
    b2_header = ws1["A9"]
    b2_header.value = "🏝️ CAMADA 2: ILHAS TEMÁTICAS (TERRITÓRIOS DE CONVERSAÇÃO E SEGURANÇA)"
    b2_header.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    b2_header.fill = PatternFill(start_color=LAYER2_FG, end_color=LAYER2_FG, fill_type="solid")
    b2_header.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[9].height = 26

    # 4 Ilhas
    ws1.merge_cells("A10:B11")
    i1 = ws1["A10"]
    i1.value = "🏋️ ILHA FITNESS & GYM\n• Treinos de musculação, cargas e PRs\n• Dieta, macronutrientes e recuperação\n• Disciplina matinal e superação"
    i1.font = Font(name="Segoe UI", size=9.5)
    i1.fill = PatternFill(start_color=LAYER2_BG, end_color=LAYER2_BG, fill_type="solid")
    i1.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("C10:C11")
    i2 = ws1["C10"]
    i2.value = "🧘 ILHA YOGA & ROTINA\n• Respiração e presença\n• Higiene do sono e detox\n• Mobilidade e mente calma"
    i2.font = Font(name="Segoe UI", size=9.5)
    i2.fill = PatternFill(start_color=LAYER2_BG, end_color=LAYER2_BG, fill_type="solid")
    i2.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("D10:E11")
    i3 = ws1["D10"]
    i3.value = "💡 ILHA BRANDING & IDENTIDADE\n• Posicionamento e diferenciação\n• Tom de voz autêntico e design\n• Projetos autorais e valores"
    i3.font = Font(name="Segoe UI", size=9.5)
    i3.fill = PatternFill(start_color=LAYER2_BG, end_color=LAYER2_BG, fill_type="solid")
    i3.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("F10:G11")
    i4 = ws1["F10"]
    i4.value = "☕ ILHA CONEXÕES & SOCIAL\n• Quebrar o gelo com estranhos no café\n• Networking em eventos sem forçar\n• Desabafos profundos com amigos"
    i4.font = Font(name="Segoe UI", size=9.5)
    i4.fill = PatternFill(start_color=LAYER2_BG, end_color=LAYER2_BG, fill_type="solid")
    i4.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.row_dimensions[10].height = 26
    ws1.row_dimensions[11].height = 26

    # Seta
    ws1.merge_cells("A12:G12")
    s_arr2 = ws1["A12"]
    s_arr2.value = "⬇️ DECODIFICADO EM UNIDADES VIVAS DE FALA (ZERO PALAVRAS ISOLADAS) ⬇️"
    s_arr2.font = Font(name="Segoe UI", size=9, bold=True, color="64748B")
    s_arr2.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[12].height = 20

    # --- BLOCO 3: SENTENÇAS & CHUNKS ---
    ws1.merge_cells("A13:G13")
    b3_header = ws1["A13"]
    b3_header.value = "⚡ CAMADA 3: ANATOMIA DA FALA (SENTENÇAS & CHUNKS PRÉ-FABRICADOS)"
    b3_header.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    b3_header.fill = PatternFill(start_color=LAYER3_FG, end_color=LAYER3_FG, fill_type="solid")
    b3_header.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[13].height = 26

    ws1.merge_cells("A14:C15")
    c_sent = ws1["A14"]
    c_sent.value = "📝 A SENTENÇA VIVA (O CONTEXTO EMOCIONAL)\n• A história completa da vida real, conectada à sua ilha temática.\nExemplo: \"If I hadn't made the decision to train early, my energy would've crashed in the afternoon.\""
    c_sent.font = Font(name="Segoe UI", size=9.5)
    c_sent.fill = PatternFill(start_color=LAYER3_BG, end_color=LAYER3_BG, fill_type="solid")
    c_sent.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("D14:G15")
    c_chk = ws1["D14"]
    c_chk.value = "🧩 O MASTER CHUNK (O BLOCO MODULAR DISPARADO PELO CÉREBRO)\n• Bloco pronto que não exige cálculo de regra gramatical:\n  [If I hadn't + verb] ──► [my life / day would've been very different]\n  [I've been working out for...] ──► [and I feel so much more energized]"
    c_chk.font = Font(name="Segoe UI", size=9.5, bold=True)
    c_chk.fill = PatternFill(start_color=LAYER3_BG, end_color=LAYER3_BG, fill_type="solid")
    c_chk.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.row_dimensions[14].height = 28
    ws1.row_dimensions[15].height = 28

    # Seta
    ws1.merge_cells("A16:G16")
    s_arr3 = ws1["A16"]
    s_arr3.value = "⬇️ ACELERADO POR IA E CONSOLIDADO POR REPETIÇÃO ESPAÇADA ⬇️"
    s_arr3.font = Font(name="Segoe UI", size=9, bold=True, color="64748B")
    s_arr3.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[16].height = 20

    # --- BLOCO 4: IA & REVISÃO ESPAÇADA (SRS) ---
    ws1.merge_cells("A17:G17")
    b4_header = ws1["A17"]
    b4_header.value = "⚙️ CAMADA 4: O MOTOR DE FIXAÇÃO (USO DE IA + REVISÃO ESPAÇADA - SRS)"
    b4_header.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    b4_header.fill = PatternFill(start_color=LAYER4_FG, end_color=LAYER4_FG, fill_type="solid")
    b4_header.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[17].height = 26

    ws1.merge_cells("A18:C19")
    c_ia = ws1["A18"]
    c_ia.value = "🤖 CO-PILOTO DE IA (24/7)\n• Caça chunks em transcrições de vlogs e músicas\n• Gera variações de sentenças para o seu nicho exato\n• Roleplay interativo de conversa real (simulador)\n• Audita e corrige os 4 vícios clássicos de pronúncia"
    c_ia.font = Font(name="Segoe UI", size=9.5)
    c_ia.fill = PatternFill(start_color=LAYER4_BG, end_color=LAYER4_BG, fill_type="solid")
    c_ia.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.merge_cells("D18:G19")
    c_srs = ws1["D18"]
    c_srs.value = "⏰ REVISÃO ESPAÇADA (SRS / ACTIVE RECALL)\n• Combate à Curva do Esquecimento de Ebbinghaus\n• Cronograma ótimo: Dia 1 ──► Dia 3 ──► Dia 7 ──► Dia 14 ──► Dia 30 ──► Dia 90\n• Regra de Ouro: Falar a frase em voz alta (treino da boca) ANTES de checar a resposta!"
    c_srs.font = Font(name="Segoe UI", size=9.5)
    c_srs.fill = PatternFill(start_color=LAYER4_BG, end_color=LAYER4_BG, fill_type="solid")
    c_srs.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    ws1.row_dimensions[18].height = 28
    ws1.row_dimensions[19].height = 28

    # Seta
    ws1.merge_cells("A20:G20")
    s_arr4 = ws1["A20"]
    s_arr4.value = "⬇️ TRANSFORMAÇÃO EM MEMÓRIA PROCEDURAL / RESULTADO FINAL ⬇️"
    s_arr4.font = Font(name="Segoe UI", size=9, bold=True, color="64748B")
    s_arr4.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[20].height = 20

    # --- BLOCO 5: RESULTADO FINAL & FALA ESPONTÂNEA ---
    ws1.merge_cells("A21:G21")
    b5_header = ws1["A21"]
    b5_header.value = "🚀 CAMADA 5: SAÍDA (FALA ESPONTÂNEA, MEMÓRIA MUSCULAR & CODE-SWITCHING)"
    b5_header.font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    b5_header.fill = PatternFill(start_color=LAYER5_FG, end_color=LAYER5_FG, fill_type="solid")
    b5_header.alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[21].height = 26

    ws1.merge_cells("A22:G23")
    c_res = ws1["A22"]
    c_res.value = "🎯 A FALA NATURAL INVOLUNTÁRIA:\n• O aluno dispara o chunk sem passar pela tradução portuguesa na cabeça.\n• Aplica Code-Switching Híbrido no dia a dia: \"If I hadn't treinado hoje cedo, eu would've ficado super fadigado.\"\n• Fluência por Ilhas: segurança absoluta em qualquer reunião, café, podcast ou conversa sobre sua vida e trabalho!"
    c_res.font = Font(name="Segoe UI", size=10, bold=True, color=LAYER5_FG)
    c_res.fill = PatternFill(start_color=LAYER5_BG, end_color=LAYER5_BG, fill_type="solid")
    c_res.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws1.row_dimensions[22].height = 26
    ws1.row_dimensions[23].height = 26

    # Bordas para todos os blocos na aba 1
    for r in range(4, 24):
        for c in range(1, 8):
            cell = ws1.cell(row=r, column=c)
            cell.border = thin_border

    ws1.column_dimensions["A"].width = 16
    ws1.column_dimensions["B"].width = 18
    ws1.column_dimensions["C"].width = 22
    ws1.column_dimensions["D"].width = 22
    ws1.column_dimensions["E"].width = 20
    ws1.column_dimensions["F"].width = 20
    ws1.column_dimensions["G"].width = 22

    # =========================================================================
    # ABA 2: MATRIZ DETALHADA DO ECOSSISTEMA (TABELA ESTRUTURADA)
    # =========================================================================
    ws2 = wb.create_sheet(title="📊 Matriz do Ecossistema")
    ws2.views.sheetView[0].showGridLines = True

    ws2.merge_cells("A1:H1")
    t2 = ws2["A1"]
    t2.value = "MATRIZ OPERACIONAL: COMPONENTES, FERRAMENTAS & ROTINAS DO ECOSSISTEMA"
    t2.font = Font(name="Segoe UI", size=13, bold=True, color="FFFFFF")
    t2.fill = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    t2.alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 32

    headers_matriz = [
        "Camada / Pilar",
        "Componente do Sistema",
        "Mídia / Ferramenta",
        "Função Cognitiva",
        "Regra Prática de Execução",
        "Exemplo Aplicado (Ilha Prática)",
        "Frequência",
        "Métrica de Sucesso"
    ]

    ws2.append(headers_matriz)
    row_idx2 = 2
    ws2.row_dimensions[row_idx2].height = 26
    for col_idx, h in enumerate(headers_matriz, start=1):
        cell = ws2.cell(row=row_idx2, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color=BLUE_HEADER if col_idx > 0 else NAVY_DARK, end_color="1E40AF", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border

    matriz_rows = [
        (
            "1. Imersão & Input",
            "Músicas",
            "Spotify / Apple Music (Letras sincronizadas)",
            "Fixação rítmica e sonora de padrões repetitivos no subconsciente.",
            "Ouvir prestando atenção no refrão e copiar a frase mestre no caderno.",
            "Queen (We Will Rock You): Subject Pronouns ('we'), Will ('will rock'), Object ('you').",
            "Diária (1 a 2 músicas)",
            "Reconhecimento instantâneo do som"
        ),
        (
            "1. Imersão & Input",
            "Séries e Filmes",
            "Netflix / HBO / Disney+ (Áudio EN + Legenda EN)",
            "Exposição a diálogos reais, contexto de linguagem corporal e entonação.",
            "Listening Dual. Se pegou o sentido geral, não pause! Atropela a tradução palavra por palavra.",
            "Suits (Harvey Specter negociando branding e autoridade com clientes).",
            "Diária (10 a 20 min)",
            "Compreensão de 80%+ sem pânico"
        ),
        (
            "1. Imersão & Input",
            "Vlogs & Podcasts",
            "YouTube / Spotify (The Diary of a CEO, Huberman Lab)",
            "Contato com o inglês espontâneo, natural e descontraído da vida contemporânea.",
            "Focar nos 3 primeiros minutos onde o host define o gancho temático.",
            "Ali Abdaal falando sobre rotina matinal produtiva e foco sem distrações.",
            "3 a 4x na semana",
            "Capacidade de resumir o vlog mentalmente"
        ),
        (
            "2. Território de Fala",
            "Ilhas Temáticas",
            "Caderno de Vocabulário & Notion por Nicho",
            "Criação de ilhas de segurança para falar com autoridade sem hesitar.",
            "Definir 4 ilhas pessoais: Academia/Gym, Yoga/Mindfulness, Branding e Social.",
            "Ilha Branding: \"My personal brand positioning is focused on authenticity.\"",
            "Contínuo (Base dos 90 dias)",
            "Domínio completo de 4 temas centrais"
        ),
        (
            "3. Unidade de Fala",
            "Sentenças Vivas",
            "Histórias Pessoais em 1ª Pessoa",
            "Abrigam o vocabulário dentro de uma narrativa emocional memorável.",
            "Nunca isolar palavras em listas frias; sempre escrever a frase completa no contexto.",
            "\"If I had stayed at that corporate agency, I would've never built my brand.\"",
            "Diária (1 história por semana)",
            "Conexão emocional com a frase"
        ),
        (
            "3. Unidade de Fala",
            "Master Chunks",
            "Blocos de Frase Pré-Fabricados",
            "Substituem o cálculo lento de regras gramaticais na cabeça por blocos prontos.",
            "Treinar os chunks repetindo 3x em voz alta até o som sair sem esforço muscular.",
            "Chunk Mestre: \"If I hadn't [action]... I would've / wouldn't have [result]...\"",
            "Diária (10 repetições de boca)",
            "Disparo muscular automático em < 1s"
        ),
        (
            "4. Aceleração Tech",
            "Uso de IA (ChatGPT/Claude)",
            "Prompts Mestres de Engenharia de Contexto",
            "Caça automática, personalização para a sua realidade e simulação de conversas.",
            "Pedir à IA: \"Extraia 3 chunks deste vlog e adapte para meu treino de academia/yoga.\"",
            "Simulação: IA faz o papel de um americano no café perguntando sobre seu trabalho.",
            "Diária (5 a 10 min)",
            "Feedback e correções em tempo real"
        ),
        (
            "4. Retenção Ativa",
            "Revisão Espaçada (SRS)",
            "Anki / Flashcards de Áudio / Calendário de 90d",
            "Interrompe a Curva do Esquecimento e transfere o chunk para a memória de longo prazo.",
            "Regra do Active Recall: Tentar lembrar e falar a frase alta antes de virar o card!",
            "Intervalos: D+1, D+3, D+7, D+14, D+30, D+60 e D+90.",
            "Diária (~5 min de revisão)",
            "Taxa de retenção > 85% após 30 dias"
        ),
        (
            "5. Produção & Saída",
            "Code-Switching Híbrido",
            "Conversas Cotidianas e Pensamento em Voz Alta",
            "Ponte sem atrito entre o português nativo e o inglês fluente.",
            "Usar a frase em português e soltar o chunk em inglês 3 vezes ao longo do dia.",
            "\"If I hadn't ido pra academia hoje cedo, eu would've ficado super cansado hoje.\"",
            "Diária (mínimo 3x ao dia)",
            "Perda total da vergonha de falar"
        ),
        (
            "5. Produção & Saída",
            "Faxina Fonética (4 Vícios)",
            "Auditoria Sonora & Gravação de Voz no Celular",
            "Limpeza dos 4 vícios clássicos que entregam o sotaque truncado do brasileiro.",
            "Polir: 1) Consoantes finais, 2) Som do 'I' curto /ɪ/, 3) Os 3 sons de '-ed', 4) Som do 'TH'.",
            "Dizer \"cat\", \"dog\", \"is\", \"worked\" (/wɜːrkt/) e \"think\" com a língua nos dentes.",
            "Diária (durante os drills)",
            "Fala limpa, elegante e compreensível"
        )
    ]

    for row in matriz_rows:
        row_idx2 += 1
        ws2.row_dimensions[row_idx2].height = 36
        ws2.append(list(row))
        bg = "FFFFFF" if row_idx2 % 2 == 0 else "F8FAFC"
        camada = row[0]
        
        # Colorize by layer
        if "1. Imersão" in camada: bg = "EFF6FF"
        elif "2. Território" in camada: bg = "F0FDF4"
        elif "3. Unidade" in camada: bg = "FFFBEB"
        elif "4. Aceleração" in camada or "4. Retenção" in camada: bg = "FAF5FF"
        elif "5. Produção" in camada: bg = "ECFEFF"

        for col in range(1, 9):
            c = ws2.cell(row=row_idx2, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [2,3,4,5,6] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=NAVY_DARK)
            elif col == 2:
                c.font = Font(name="Segoe UI", size=9.5, bold=True)

    ws2.column_dimensions["A"].width = 18
    ws2.column_dimensions["B"].width = 24
    ws2.column_dimensions["C"].width = 28
    ws2.column_dimensions["D"].width = 32
    ws2.column_dimensions["E"].width = 36
    ws2.column_dimensions["F"].width = 36
    ws2.column_dimensions["G"].width = 18
    ws2.column_dimensions["H"].width = 24

    # =========================================================================
    # ABA 3: FLUXO PRÁTICO DIA A DIA (PASSO A PASSO DE 19 MINUTOS)
    # =========================================================================
    ws3 = wb.create_sheet(title="🔁 Rotina Diária dos 19 Minutos")
    ws3.views.sheetView[0].showGridLines = True

    ws3.merge_cells("A1:F1")
    t3 = ws3["A1"]
    t3.value = "COMO EXECUTAR O ECOSSISTEMA EM 19 MINUTOS POR DIA"
    t3.font = Font(name="Segoe UI", size=13, bold=True, color="FFFFFF")
    t3.fill = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type="solid")
    t3.alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 32

    headers_rotina = ["Bloco de Tempo", "Etapa do Ecossistema", "Ação Prática Real", "Ferramenta Utilizada", "O que o Cérebro Faz", "Status"]
    ws3.append(headers_rotina)
    row_idx3 = 2
    ws3.row_dimensions[row_idx3].height = 24
    for col_idx, h in enumerate(headers_rotina, start=1):
        cell = ws3.cell(row=row_idx3, column=col_idx)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    rotina_data = [
        ("Minuto 00 ao 04\n(4 minutos)", "Revisão Espaçada (SRS)", "Abrir os 5 a 10 cards do dia. Ver o prompt em português ou situação e falar o chunk em inglês em voz alta antes de virar o card.", "Anki / App / Flashcard de Papel", "Ativação de Active Recall e combate à Curva do Esquecimento.", "[  ]"),
        ("Minuto 04 ao 12\n(8 minutos)", "Imersão & Caçada", "Assistir a um trecho de série (Netflix), vlog no YouTube ou ouvir 2 músicas no Spotify acompanhando a legenda/letra.", "Netflix / YouTube / Spotify", "Comprehensible Input (i+1) e associação fonética som + escrita.", "[  ]"),
        ("Minuto 12 ao 15\n(3 minutos)", "Extração com IA & Ilha", "Colar a frase encontrada no ChatGPT/Claude e gerar 2 variações personalizadas para sua ilha (academia, yoga ou branding).", "Prompt de IA (ChatGPT / Claude)", "Contextualização imediata e personalização do repertório.", "[  ]"),
        ("Minuto 15 ao 19\n(4 minutos)", "Treino da Boca & Pronúncia", "Repetir os 3 chunks do dia 3x em voz alta, cuidando das consoantes finais, som do 'I' curto e do 'TH'.", "Gravador do Celular / Espelho", "Formação de memória muscular e automatização fonética.", "[  ]"),
        ("Ao Longo do Dia\n(Invisível)", "Missão de Code-Switching", "Inserir o chunk em inglês 3 vezes em conversas reais em português (no trabalho, na academia ou falando sozinho).", "Conversas no WhatsApp / Dia a Dia", "Transferência do aprendizado para a vida real sem pressão de perfeição.", "[  ]")
    ]

    for row in rotina_data:
        row_idx3 += 1
        ws3.row_dimensions[row_idx3].height = 40
        ws3.append(list(row))
        bg = "FFFFFF" if row_idx3 % 2 == 0 else "F8FAFC"
        for col in range(1, 7):
            c = ws3.cell(row=row_idx3, column=col)
            c.font = Font(name="Segoe UI", size=9.5)
            c.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
            c.alignment = Alignment(horizontal="left" if col in [2,3,4,5] else "center", vertical="center", wrap_text=True)
            c.border = thin_border
            if col == 1:
                c.font = Font(name="Segoe UI", size=9.5, bold=True, color=NAVY_DARK)

    ws3.column_dimensions["A"].width = 18
    ws3.column_dimensions["B"].width = 24
    ws3.column_dimensions["C"].width = 38
    ws3.column_dimensions["D"].width = 26
    ws3.column_dimensions["E"].width = 36
    ws3.column_dimensions["F"].width = 10

    # Salva o arquivo
    wb.save(output_path)
    print(f"Planilha do Ecossistema criada com sucesso: {output_path}")

if __name__ == "__main__":
    docs_dir = os.path.join(os.path.dirname(__file__), "DOCs")
    excel_path = os.path.join(docs_dir, "Ecossistema_Aprendizagem_Diagrama_e_Fluxo.xlsx")
    create_visual_ecosystem_workbook(excel_path)
