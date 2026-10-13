import React from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Landmark, Wrench, Eye, Brain, Lightbulb, Radio } from 'lucide-react';

interface ServicesSectionProps {
  onOpenBooking: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenBooking }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const sixAxes = [
    {
      num: '01',
      axis: 'Sua História',
      icon: <Landmark size={20} className="text-white" />,
      desc: 'A origem real da sua autoridade e os marcos que sustentam o que você vende.'
    },
    {
      num: '02',
      axis: 'Seus Bastidores',
      icon: <Wrench size={20} className="text-white" />,
      desc: 'Aprendizados caros, erros práticos, rotinas de trabalho e desafios reais.'
    },
    {
      num: '03',
      axis: 'Sua Visão',
      icon: <Eye size={20} className="text-white" />,
      desc: 'O que você defende, o que não tolera no mercado e onde discorda da maioria.'
    },
    {
      num: '04',
      axis: 'Seu Conhecimento',
      icon: <Brain size={20} className="text-white" />,
      desc: 'Como resolve problemas técnicos e os exemplos que usa para explicar seu método.'
    },
    {
      num: '05',
      axis: 'Seu Repertório Vivo',
      icon: <Lightbulb size={20} className="text-white" />,
      desc: 'Situações cotidianas que funcionam como metáforas para reter a atenção do público.'
    },
    {
      num: '06',
      axis: 'Sua Voz',
      icon: <Radio size={20} className="text-white" />,
      desc: 'O ritmo do seu raciocínio, suas expressões habituais e a cadência do seu pensamento.'
    }
  ];

  return (
    <section
      ref={ref}
      className="py-24 md:py-36 px-6 overflow-hidden relative z-10 starry-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4"
        >
          <div>
            <div className="text-white/40 text-xs tracking-widest uppercase mb-3 font-semibold">
              Roteiro Proprietário
            </div>
            <h2 className="text-3xl md:text-5xl text-white tracking-tight font-normal">
              <span>Os 6 Eixos de </span>
              <span
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                className="italic text-white/50"
              >
                Investigação
              </span>
            </h2>
          </div>

          <button
            onClick={onOpenBooking}
            className="liquid-glass rounded-full px-6 py-2.5 text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-wide uppercase flex items-center gap-2 cursor-pointer transition-colors w-fit"
          >
            <span>Garantir Sessão</span>
            <ArrowUpRight size={16} />
          </button>
        </motion.div>

        {/* 6-Axes Liquid Glass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sixAxes.map((axis, i) => (
            <motion.div
              key={axis.num}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="liquid-glass rounded-3xl p-8 flex flex-col justify-between border border-white/10 shadow-xl group hover:border-white/25 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="liquid-glass rounded-2xl p-3.5 text-white group-hover:scale-105 transition-transform">
                    {axis.icon}
                  </div>
                  <span className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors text-xs font-medium bg-white/5 border border-white/10 rounded-full px-3 py-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>Ao vivo</span>
                  </span>
                </div>

                <h3 className="text-white text-xl sm:text-2xl mb-3 tracking-tight font-medium">
                  {axis.axis}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed font-light">
                  {axis.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 text-xs text-white/40 flex items-center justify-between">
                <span>Extração Guiada</span>
                <span className="text-white/40 group-hover:text-white/80 transition-colors font-mono tracking-widest font-bold text-xs">
                  {axis.num}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
