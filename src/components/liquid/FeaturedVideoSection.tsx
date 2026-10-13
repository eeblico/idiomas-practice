import React from 'react';
import { motion, useInView } from 'framer-motion';

interface FeaturedVideoSectionProps {
  onOpenBooking: () => void;
}

export const FeaturedVideoSection: React.FC<FeaturedVideoSectionProps> = ({ onOpenBooking }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#000000' }}
      className="pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden relative z-10"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9 }}
          className="rounded-3xl overflow-hidden aspect-video relative group border border-white/10 shadow-2xl"
        >
          {/* Background Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Approach Card in Liquid Glass */}
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <div className="text-white/50 text-xs tracking-widest uppercase mb-3 font-semibold">
                Nossa Abordagem
              </div>
              <p className="text-white text-sm md:text-base leading-relaxed font-light">
                O Fala Que Eu Te Escuto é uma sessão individual de 1h30 ao vivo para investigar sua trajetória, aplicar discernimento e entregar o seu <strong>DNA Prompt</strong> mestre pronto para ChatGPT, Claude e Gemini.
              </p>
            </div>

            {/* Explore More CTA */}
            <motion.button
              onClick={onOpenBooking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass rounded-full px-8 py-3.5 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-lg cursor-pointer whitespace-nowrap"
            >
              Mapear Meu Repertório — R$ 297
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
