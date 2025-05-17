
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureHighlightProps {
  title: string;
  description: string;
  imageSrc: string;
  isImageRight: boolean;
  techBadge?: string;
  techIcon?: React.ReactNode;
}

export const FeatureHighlight = ({ 
  title, 
  description, 
  imageSrc, 
  isImageRight,
  techBadge,
  techIcon
}: FeatureHighlightProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const getTechColor = (tech: string | undefined) => {
    switch (tech) {
      case 'Kling AI':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Luma':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Hailou AI':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Runway':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default:
        return 'text-white border-white/20 bg-white/5';
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={cn("flex flex-col md:flex-row items-center gap-8 mb-24", 
        isImageRight ? "md:flex-row-reverse" : ""
      )}
    >
      <motion.div variants={fadeInUp} className="flex-1">
        {techBadge && techIcon && (
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-sm border backdrop-blur-sm",
            getTechColor(techBadge)
          )}>
            <span className="w-5 h-5">{techIcon}</span>
            <span>{techBadge}</span>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-lg text-zinc-300 mb-6">{description}</p>
        <Button 
          variant="outline" 
          className="border-white/20 hover:bg-white/10 text-white"
        >
          Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
      <motion.div variants={fadeInUp} className="flex-1 perspective-1000">
        <div className="transform-style-3d hover:rotateX-2 hover:rotateY-3 transition-all-std">
          <img 
            src={imageSrc} 
            alt={title} 
            className="rounded-lg shadow-2xl border border-white/10 w-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeatureHighlight;
