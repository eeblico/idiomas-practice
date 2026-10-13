import React from 'react';
import { motion, useInView } from 'framer-motion';

export const AboutSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="pt-32 md:pt-44 pb-16 md:pb-24 px-6 overflow-hidden text-center relative z-10 starry-background"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Label: Workshop Individual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-white/40 text-xs sm:text-sm tracking-widest uppercase mb-6 font-semibold"
        >
          Workshop Individual • Mapeamento & Extração
        </motion.div>

        {/* Heading com Instrument Serif */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.15] tracking-tight font-normal max-w-4xl"
        >
          <span>Talvez você só esteja procurando conteúdo no </span>
          <span
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="italic text-white/60 font-normal"
          >
            lugar errado
          </span>
          <span>.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-white/70 text-sm md:text-base max-w-2xl mt-8 leading-relaxed font-light"
        >
          Quando chega a hora de publicar, muita gente abre as redes, procura referências e tenta encontrar o que falar. Só que, para um profissional experiente, o melhor conteúdo não está nas referências externas: está na própria trajetória, nos erros que custaram caro e nas explicações simples que você dá no dia a dia.
        </motion.p>
      </div>
    </section>
  );
};
