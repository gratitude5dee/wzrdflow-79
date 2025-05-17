
import React from 'react';
import { motion } from 'framer-motion';
import { TechHighlight } from './TechHighlight';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  techBadge?: string;
}

export const FeatureCard = ({ icon, title, description, delay = 0, techBadge }: FeatureCardProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        delay,
        ease: "easeOut" 
      } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
      className="perspective-1000 h-full"
    >
      <div className={cn(
        "glass-card p-6 rounded-xl transform-style-3d hover:rotateX-3 hover:rotateY-3 hover:-translate-y-2 transition-all-std h-full flex flex-col",
        "hover:shadow-glow-purple-sm"
      )}>
        <div className="mb-5">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-zinc-300 mb-5 flex-grow">{description}</p>
        {techBadge && (
          <div className="mt-auto">
            <TechHighlight name={techBadge} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FeatureCard;
