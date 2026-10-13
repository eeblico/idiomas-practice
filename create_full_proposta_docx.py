import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

def create_proposta_docx():
    doc = docx.Document()
    
    # Page Margins
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Document Header Title
    title_p = doc.add_paragraph()
    title_run = title_p.add_run("🧠 TERAPIA DE MARCA: O SEU SEGUNDO CÉREBRO EM 2 HORAS")
    title_run.font.name = 'Arial'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(126, 34, 206) # Purple

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run("Documento Estruturado de Produto & Proposta Comercial — Pronto para Google Docs")
    sub_run.font.name = 'Arial'
    sub_run.font.size = Pt(11)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph("=" * 65)

    def add_section_header(number, text):
        h = doc.add_heading(level=1)
        hrun = h.add_run(f"{number}. {text}")
        hrun.font.name = 'Arial'
        hrun.font.size = Pt(14)
        hrun.font.bold = True
        hrun.font.color.rgb = RGBColor(126, 34, 206)

    # 1. O que é
    add_section_header("1", "O que é")
    p1 = doc.add_paragraph()
    p1.add_run(
        "A Terapia de Marca é um serviço individual de Extração Estratégica de Contexto. "
        "Através de uma conversa guiada de 2 horas, transformamos as vivências, histórias, crenças e posicionamento "
        "que estão na sua cabeça no seu Cérebro Digital (Arquitetura de Contexto no Google Docs/Notion). "
        "A maioria das pessoas falha ao usar Inteligência Artificial porque tenta usar o ChatGPT do zero, sem contexto, "
        "gerando textos genéricos e robóticos. Resolvemos a principal dor da criação de conteúdo: a falta de discernimento sobre a própria vivência "
        "('ninguém consegue ler o rótulo do frasco quando está dentro da garrafa')."
    )

    # 2. Pra quem é
    add_section_header("2", "Pra quem é")
    p2_intro = doc.add_paragraph("Este produto é desenvolvido sob medida para:")
    items_2 = [
        "Consultores, Mentores e Especialistas que querem atrair clientes de alto valor através de conteúdo autêntico.",
        "Executivos e Profissionais Liberais que não têm tempo para escrever do zero todo dia.",
        "Criadores e Empreendedores Digitais que querem parar de parecer robôs ao usar Inteligência Artificial (ChatGPT/Claude/DeepSeek).",
        "Profissionais cansados de depender de agências tradicionais que entregam textos sem alma."
    ]
    for item in items_2:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 3. Entregáveis
    add_section_header("3", "Entregáveis")
    items_3 = [
        "Reunião Estratégica de 2 Horas (Videochamada individual no Zoom/Google Meet com gravação e transcrição completa).",
        "O Cérebro Digital no Google Docs / Notion (Dossier estruturado com 5 Pilares: Histórias de Origem, Crenças Centrais, Antíteses do Mercado, Vocabulário Único e Posicionamento).",
        "Pacote de 60 Prompts Mestre para IA alimentados com o seu contexto (divididos em Linha Editorial, Posts de Vendas, Histórias de Conexão, Carrosséis e Vídeos Curtos).",
        "Manual Prático de Injeção de Contexto (Como configurar seu Custom GPT ou Instruções Personalizadas)."
    ]
    for item in items_3:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 4. Não inclui
    add_section_header("4", "Não inclui")
    items_4 = [
        "Gestão diária de redes sociais (agendamento, publicação e resposta a direct/comentários).",
        "Design gráfico de peças publicitárias ou edição de vídeos para reels/TikTok.",
        "Copywriting operacional contínuo (o entregável capacita você e sua IA a produzirem com 100% de autonomia)."
    ]
    for item in items_4:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 5. Cronograma da entrega
    add_section_header("5", "Cronograma da entrega")
    items_5 = [
        "Dia 1 — Alinhamento & Pré-Sessão: Envio do formulário de onboarding e confirmação da reunião de 2 horas.",
        "Dia 2 — Reunião de 2h de Terapia de Marca: Bate-papo de extração ao vivo (Histórias, Crenças e Tom de Voz).",
        "Em até 48h pós-reunião — Entrega Final: Envio do link do Google Docs com o Cérebro Digital + 60 Prompts Mestre."
    ]
    for item in items_5:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 6. Recursos necessários
    add_section_header("6", "Recursos necessários")
    items_6 = [
        "2 horas de disponibilidade ininterrupta para a videochamada estratégica.",
        "Conta no Google Drive / Google Docs (para acessar e copiar seu Cérebro Digital).",
        "Acesso ao ChatGPT (gratuito ou Plus), Claude ou DeepSeek para utilizar os Prompts Mestre."
    ]
    for item in items_6:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 7. Duração mínima de contrato
    add_section_header("7", "Duração mínima de contrato")
    p7 = doc.add_paragraph()
    p7.add_run(
        "Sem fidelidade ou contrato longo obrigatorio. O serviço principal é pontual e resolutivo em uma única sessão de 2 horas. "
        "Opcionalmente, o cliente pode optar pela atualização trimestral do Cérebro Digital."
    )

    # 8. Links importantes
    add_section_header("8", "Links importantes")
    items_8 = [
        "Link de Agendamento da Reunião de 2h: https://calendly.com/terapiademarca/2horas",
        "Link de Acesso ao Google Docs do Cérebro Digital: https://docs.google.com/document/u/0/create",
        "Link de Suporte via WhatsApp: https://wa.me/5500000000000"
    ]
    for item in items_8:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 9. Modelos para usar a entrega
    add_section_header("9", "Modelos para usar a entrega")
    items_9 = [
        "Modelo 1 (Injeção de Contexto no ChatGPT): Copie o bloco 'Cérebro Digital' e cole no campo 'Custom Instructions' do ChatGPT.",
        "Modelo 2 (Criação de Post de Venda): Abra o Prompt Mestre #2, substitua o tema do dia e execute na IA para obter uma sequência pronta de stories/posts autênticos.",
        "Modelo 3 (Matriz Semanal de Conteúdo): Utilize os 5 pilares do seu Cérebro Digital para preencher seu calendário editorial no Notion ou Google Docs."
    ]
    for item in items_9:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 10. Preço
    add_section_header("10", "Preço")
    items_10 = [
        "Sessão Individual Pontual (2h + Cérebro Digital + 60 Prompts): R$ 1.490,00 à vista (ou 12x de R$ 149,00).",
        "Acompanhamento Recorrente Trimestral (1 reunião/mês de atualização): R$ 890,00/mês."
    ]
    for item in items_10:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    # 11. Ofertas
    add_section_header("11", "Ofertas")
    items_11 = [
        "Oferta Principal: Consultoria de Extração de Contexto 2h + Cérebro Digital no Google Docs + 60 Prompts Mestre por R$ 1.490,00.",
        "Bônus 1: Gravação e Transcrição em Áudio/Texto completa indexada da reunião de 2h.",
        "Bônus 2: 15 dias de acompanhamento assíncrono via WhatsApp para validação das primeiras postagens geradas com IA."
    ]
    for item in items_11:
        p = doc.add_paragraph(style='List Bullet')
        p.add_run(item)

    doc_filename = "Proposta_e_Estrutura_Terapia_de_Marca.docx"
    doc.save(doc_filename)
    print(f"Document created successfully: {doc_filename}")

if __name__ == "__main__":
    create_proposta_docx()
