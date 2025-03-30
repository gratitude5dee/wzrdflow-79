
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Wand, Image, Settings, Play, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0D16] text-white relative overflow-hidden">
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] z-10 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1320] via-[#141830] to-[#1D1E3A] z-0"></div>
        
        {/* Animated particle field (simplified) */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute h-[40%] w-[40%] left-[30%] top-[20%] bg-purple-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute h-[30%] w-[30%] left-[10%] top-[40%] bg-blue-500/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute h-[25%] w-[25%] right-[20%] bottom-[20%] bg-indigo-500/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 z-20 max-w-6xl">
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: 0.2 
                } 
              }
            }}
          >
            {/* Logo and badge */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-2 mb-8">
              <h1 className="text-3xl font-bold text-yellow-300 tracking-tight glow-text-gold font-serif">WZRD.STUDIO</h1>
              <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
            </motion.div>
            
            {/* Main headline */}
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
            >
              The AI Studio for Cinematic Storytelling
            </motion.h2>
            
            {/* Sub-headline */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-zinc-300 max-w-3xl mx-auto mb-10"
            >
              Generate stunning storyboards, shots, and video sequences from simple text prompts or detailed scripts. WZRD.STUDIO is your AI co-director.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-6 rounded-md shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std group"
                size="lg"
              >
                Start Creating Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsVideoModalOpen(true)}
                className="border-white/20 hover:bg-white/10 px-6 py-6"
                size="lg"
              >
                <Play className="mr-2 w-4 h-4 fill-current" /> Watch Demo
              </Button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              variants={fadeInUp}
              className="absolute bottom-10 left-0 right-0 flex justify-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-24 relative z-20 bg-[#0A0D16]/90">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: 0.2 
                } 
              }
            }}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              How It Works
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-zinc-300 max-w-2xl mx-auto"
            >
              Create videos from ideas in four simple steps
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <FeatureCard 
              icon={<Lightbulb className="w-8 h-8 text-yellow-400" />}
              title="Input Your Concept"
              description="Start with a simple idea, a detailed script, or existing media."
              delay={0.1}
            />
            
            {/* Step 2 */}
            <FeatureCard 
              icon={<Wand className="w-8 h-8 text-purple-400" />}
              title="AI Co-Creation"
              description="Let WZRD generate storylines, breakdown scenes, and suggest shot types."
              delay={0.2}
            />
            
            {/* Step 3 */}
            <FeatureCard 
              icon={<Image className="w-8 h-8 text-blue-400" />}
              title="Visualize & Refine"
              description="Generate stunning shot images, audio, and video sequences. Iterate quickly."
              delay={0.3}
            />
            
            {/* Step 4 */}
            <FeatureCard 
              icon={<Settings className="w-8 h-8 text-green-400" />}
              title="Customize & Control"
              description="Fine-tune styles, characters, audio, and export your final vision."
              delay={0.4}
            />
          </div>
        </div>
      </section>
      
      {/* Feature Deep Dive Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0A0D16] to-[#0F1320]">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-zinc-300 max-w-2xl mx-auto"
            >
              Everything you need to bring your vision to life
            </motion.p>
          </motion.div>
          
          {/* Feature 1: Intelligent Storyboarding */}
          <FeatureHighlight 
            title="Intelligent Storyboarding"
            description="Our AI assists in breaking down scripts and suggesting shots. Get from concept to visual boards in minutes instead of days."
            imageSrc="/lovable-uploads/1e1aab33-e5d2-4ef2-b40d-84a2e2679e3c.png"
            isImageRight={false}
          />
          
          {/* Feature 2: AI Image & Video Generation */}
          <FeatureHighlight 
            title="AI Image & Video Generation"
            description="Create stunning visuals with our state-of-the-art AI models. Control style, mood, and aesthetics with simple text prompts."
            imageSrc="/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png"
            isImageRight={true}
          />
          
          {/* Feature 3: Node-Based Workflow */}
          <FeatureHighlight 
            title="Node-Based Workflow"
            description="For advanced users, our Studio Mode lets you connect AI models visually, giving you unprecedented control over your creative pipeline."
            imageSrc="/lovable-uploads/1e1aab33-e5d2-4ef2-b40d-84a2e2679e3c.png"
            isImageRight={false}
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative z-20 bg-gradient-to-b from-[#0F1320] to-[#0A0D16]">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: 0.2 
                } 
              }
            }}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              Start Creating Today
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-zinc-300 mb-8"
            >
              Generate content using credits. Get started with free credits upon signup. Choose a plan that fits your creative flow.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-6 rounded-md shadow-glow-purple-sm hover:shadow-glow-purple-md transition-all-std group"
                size="lg"
              >
                Sign Up & Get Free Credits <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 bg-[#080B13] text-zinc-400 relative z-20 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-yellow-300/80 tracking-tight font-serif">WZRD.STUDIO</h3>
              <p className="text-sm text-zinc-500">© 2023 WZRD Technologies, Inc. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Video Modal (placeholder) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm" onClick={() => setIsVideoModalOpen(false)}>
          <div className="bg-zinc-900 p-4 rounded-lg w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="aspect-video bg-zinc-800 rounded flex items-center justify-center">
              <p className="text-zinc-400">Demo video would play here</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="ghost" onClick={() => setIsVideoModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        delay 
      } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="perspective-1000"
    >
      <div className="glass-card p-6 rounded-xl transform-style-3d hover:rotateX-3 hover:rotateY-3 hover:-translate-y-2 transition-all-std shadow-lg">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-zinc-400">{description}</p>
      </div>
    </motion.div>
  );
};

// Feature Highlight Component
const FeatureHighlight = ({ title, description, imageSrc, isImageRight }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={cn("flex flex-col md:flex-row items-center gap-8 mb-24", 
        isImageRight ? "md:flex-row-reverse" : ""
      )}
    >
      <div className="flex-1">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-lg text-zinc-300 mb-6">{description}</p>
        <Button variant="outline" className="border-white/20 hover:bg-white/10">
          Learn More <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 perspective-1000">
        <div className="transform-style-3d hover:rotateX-2 hover:rotateY-3 transition-all-std">
          <img 
            src={imageSrc} 
            alt={title} 
            className="rounded-lg shadow-2xl border border-white/10 w-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Landing;
