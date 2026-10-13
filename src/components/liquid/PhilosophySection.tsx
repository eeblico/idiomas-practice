import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Brain, Lock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="py-24 md:py-36 px-6 overflow-hidden relative z-10 starry-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading: Repertório x Discernimento */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight mb-14 md:mb-20 font-normal"
        >
          <span>A IA não encontra o que você </span>
          <span
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="italic text-white/50 font-normal"
          >
            nunca contou
          </span>
          <span> para ela.</span>
        </motion.h2>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Left Column: Liquid Glass Diagnostic Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="liquid-glass rounded-3xl p-8 sm:p-10 border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          >
            <div>
              <div className="flex items-center gap-2.5 text-white/40 text-xs tracking-widest uppercase mb-6 font-semibold">
                <Brain className="w-4 h-4 text-white/80" />
                <span>O Problema Anterior ao Prompt</span>
              </div>

              <h3 className="text-2xl sm:text-3xl text-white font-normal mb-4 tracking-tight">
                A ferramenta pode até conhecer o seu tom. <em>Mas não viveu seus projetos.</em>
              </h3>

              <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed mb-8">
                Ela não sabe quais decisões mudaram sua rota, quais exemplos você usa no dia a dia, nem quais ideias você rejeita no mercado. Antes de pedir para a IA escrever como você, precisamos entregar o que é seu: <strong>Contexto</strong>.
              </p>

              <div className="flex flex-col gap-3">
                <div className="liquid-glass rounded-xl p-4 border border-rose-500/20 text-xs sm:text-sm text-white/80 flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>Pedir "escreva como eu" sem entregar histórias gera textos genéricos e plastificados.</span>
                </div>
                <div className="liquid-glass rounded-xl p-4 border border-emerald-500/20 text-xs sm:text-sm text-white/90 flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Alimentar a IA com seu <strong>Banco de Repertório</strong> faz ela escrever com maturidade e profundidade real.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>Banco de Repertório®</span>
              <span className="flex items-center gap-2 text-white/80 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Workshop Individual</span>
              </span>
            </div>
          </motion.div>

          {/* Right Column: Two Text Blocks */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.85, delay: 0.2 }}
            className="flex flex-col gap-6 justify-between"
          >
            {/* Block 1 */}
            <div className="liquid-glass rounded-3xl p-8 flex-1 flex flex-col justify-center">
              <div className="text-white/40 text-xs tracking-widest uppercase mb-3 font-semibold">
                A Fórmula da Autoria
              </div>
              <div className="text-emerald-400 font-mono text-xs sm:text-sm mb-3 tracking-wider font-semibold">
                Experiência → Extração → Discernimento → Contexto → Conteúdo
              </div>
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-light">
                Você traz a experiência. Eu faço as perguntas de provocação. Nós identificamos o que merece ser preservado e esse repertório passa a ter endereço fixo no seu Notion.
              </p>
            </div>

            {/* Block 2 */}
            <div className="liquid-glass rounded-3xl p-8 flex-1 flex flex-col justify-center">
              <div className="text-white/40 text-xs tracking-widest uppercase mb-3 font-semibold">
                Maturidade em vez de apenas Presença
              </div>
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-light">
                Maturidade aparece quando o conteúdo revela como você pensa, o que aprendeu errando, o que iniciantes ainda não percebem e quais ideias você já não compra mais. É isso que faz alguém pensar: <em>"Essa pessoa conhece profundamente o que faz."</em>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
