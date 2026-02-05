
import React, { useState, useEffect } from 'react';
import { FadeIn, Button } from '../components/Components';
import { 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  Zap, 
  Droplets, 
  Layout, 
  Heart, 
  ShoppingBag, 
  ExternalLink,
  CheckCircle2,
  Sun,
  Moon,
  Clock,
  ChevronDown,
  ChevronUp,
  Leaf,
  Coffee,
  Waves,
  Palette,
  Layers,
  Sparkle,
  ArrowRight,
  BookOpen,
  Trophy,
  Save,
  Search,
  Check,
  AlertTriangle,
  Info,
  Thermometer,
  ShieldCheck,
  Flower2,
  MessageSquare,
  UserCheck,
  Smile,
  Quote,
  Star,
  Book,
  Brain,
  ZapOff,
  Wind
} from 'lucide-react';
import { Screen, SavedLook } from '../types';
import { db, STORES } from '../services/db';

type GlowHubView = 'HUB' | 'CHALLENGES' | 'SKINCARE_HUB' | 'SKIN_TYPE' | 'K_BEAUTY' | 'J_BEAUTY' | 'DIY_INDIAN' | 'STYLE' | 'CONFIDENCE';

interface ChallengeProgress {
  id: string;
  completedSteps: string[];
  lastCheckIn: string;
}

interface StyleItem {
  name: string;
  category: string;
  image: string;
  why: string;
  tip: string;
  searchQuery: string;
}

interface Lookbook {
  id: string;
  title: string;
  occasion: string;
  category: 'College' | 'Party' | 'Casual' | 'Festive' | 'Office';
  moodTags: string[];
  mainImage: string;
  description: string;
  items: StyleItem[];
  logic: {
    colors: string;
    proportions: string;
    suitability: string;
  };
  variations: {
    budget: string;
    party: string;
    seasonal: string;
  };
}

const LOOKBOOKS: Lookbook[] = [
  {
    id: '1',
    title: 'The Contemporary Scholar',
    occasion: 'University / Daily Wear',
    category: 'College',
    moodTags: ['Effortless', 'Academic', 'Minimalist'],
    mainImage: 'https://i.pinimg.com/736x/52/bd/0b/52bd0b3eae726852978786ccdd163b05.jpg',
    description: 'A masterclass in balancing relaxed proportions with tailored precision for an intellectual aesthetic.',
    items: [
      {
        name: 'Poplin Oversized Shirt',
        category: 'Top',
        image: 'https://i.pinimg.com/736x/e9/17/d1/e917d1b6ad0baea8c87a4065b8c23045.jpg',
        why: 'The crisp cotton provides a sharp architectural frame while the oversized cut ensures breathability.',
        tip: 'Try a "French Tuck" — tucking only the front hem into your trousers — to define the waist while keeping the back loose.',
        searchQuery: 'white oversized poplin shirt women'
      },
      {
        name: 'Wide-Leg Tailored Trousers',
        category: 'Bottom',
        image: 'https://i.pinimg.com/736x/cb/5f/66/cb5f662a291bbc94dbee403d719c65fc.jpg',
        why: 'They provide a vertical line that elongates the silhouette, counteracting the volume of the shirt.',
        tip: 'Ensure the hem hits 1cm above the ground when wearing your chosen footwear for a clean drape.',
        searchQuery: 'beige wide leg tailored trousers'
      },
      {
        name: 'Minimalist White Sneakers',
        category: 'Shoes',
        image: 'https://i.pinimg.com/736x/45/9f/ab/459fab5e7b66f2cc247f8a13b838f92b.jpg',
        why: 'Sneakers ground the formal trousers, making the look approachable for a campus environment.',
        tip: 'Opt for leather over canvas for a more "expensive" finish that is easier to clean.',
        searchQuery: 'minimalist white leather sneakers'
      }
    ],
    logic: {
      colors: 'Utilizing a "Sand & Salt" palette. The warm beige of the trousers paired with crisp white creates a high-contrast but low-saturation look that feels expensive.',
      proportions: 'The 2/3 Rule: By tucking the shirt, you create a 1/3 top and 2/3 bottom proportion, which is the most visually pleasing ratio to the human eye.',
      suitability: 'Optimized for high-movement days. The fabrics are natural and breathable, suitable for transitioning from lecture halls to social cafes.'
    },
    variations: {
      budget: 'Swap silk-blend trousers for high-quality cotton chinos to achieve a similar structured drape.',
      party: 'Add a chunky gold chain and swap sneakers for pointed-toe ankle boots to transition to an evening gallery opening.',
      seasonal: 'For winter, layer a thin cashmere turtleneck underneath the shirt for a sophisticated layered look.'
    }
  },
  {
    id: '2',
    title: 'Midnight Executive',
    occasion: 'Corporate / Formal Events',
    category: 'Office',
    moodTags: ['Powerful', 'Sleek', 'Architectural'],
    mainImage: 'https://i.pinimg.com/736x/50/fa/f9/50faf976fa909fe08c82a6c2087af5a5.jpg',
    description: 'Redefining professional authority through monochromatic depth and sharp, masculine-inspired tailoring.',
    items: [
      {
        name: 'Double-Breasted Charcoal Blazer',
        category: 'Outerwear',
        image: 'https://i.pinimg.com/564x/8d/68/73/8d68735f1f2a36b3383838038c7f938b.jpg',
        why: 'The strong shoulder line projects confidence and creates an inverted triangle frame.',
        tip: 'Push the sleeves up to your elbows to reveal the thinnest part of your arm — the wrist — for a more dynamic look.',
        searchQuery: 'charcoal grey double breasted blazer women'
      },
      {
        name: 'Pointed Slingback Heels',
        category: 'Shoes',
        image: 'https://i.pinimg.com/736x/a2/0e/4d/a20e4d43b7af7fc8a86422c398b46a4d.jpg',
        why: 'The pointed toe extends the leg line, which is crucial when wearing oversized tailoring.',
        tip: 'A kitten heel height (3-5cm) is often more chic and sustainable for all-day office wear than high stilettos.',
        searchQuery: 'black pointed slingback heels leather'
      }
    ],
    logic: {
      colors: 'Monochromatic black and charcoal create a "Power Column". This technique minimizes visual breaks, making the wearer appear taller and more composed.',
      proportions: 'Volume on volume: The oversized blazer meets wide trousers. This is balanced by baring skin at the wrists and neck.',
      suitability: 'Commanding. Best for boardrooms, negotiations, or high-stakes networking where a strong presence is non-negotiable.'
    },
    variations: {
      budget: 'Focus on the fit. A $50 blazer tailored at a local shop for $20 will look better than a $500 blazer that doesn\'t fit the shoulders.',
      party: 'Remove the blazer and wear a silk camisole underneath with statement chandelier earrings.',
      seasonal: 'Add a long wool trench coat in a matching shade of grey to maintain the monochromatic column.'
    }
  },
  {
    id: '3',
    title: 'Modern Heritage',
    occasion: 'Festivals / Semi-Formal',
    category: 'Festive',
    moodTags: ['Graceful', 'Textured', 'Vibrant'],
    mainImage: 'https://i.pinimg.com/736x/f7/8d/b0/f78db02aa3849aa440b41af9d9de356b.jpg',
    description: 'An exploration of traditional Indian silhouettes fused with contemporary minimalist styling.',
    items: [
      {
        name: 'Embroidered Silk Anarkali',
        category: 'Top',
        image: 'https://i.pinimg.com/736x/a7/ae/46/a7ae467bf0dc085bbc315647c1522dea.jpg',
        why: 'The high-waisted flare provides dramatic movement and hides the lower body, focusing attention on the torso.',
        tip: 'Check that the flare starts exactly at the smallest part of your waist for the most flattering silhouette.',
        searchQuery: 'modern silk anarkali simple embroidery'
      }
    ],
    logic: {
      colors: 'Jewel tones (Emerald, Ruby, Sapphire) are scientifically proven to look vibrant under heavy festival lighting.',
      proportions: 'The "Pyramid Shape": Narrow at the top and wide at the base. This provides a sense of stability and grandeur.',
      suitability: 'Perfect for events with long durations. The loose lower half allows for comfort while the silk maintains a formal sheen.'
    },
    variations: {
      budget: 'Look for "Chanderi Cotton" — it has the sheen of silk but the price point and breathability of cotton.',
      party: 'Add a heavy sequinned dupatta and vintage silver jewelry to elevate the look for a night wedding.',
      seasonal: 'Swap the light leggings for velvet churidars to stay warm during winter outdoor ceremonies.'
    }
  }
];

const MIRROR_MESSAGES = [
  { id: 'm1', text: "You are the architect of your own light." },
  { id: 'm2', text: "Your worth is not a performance." },
  { id: 'm3', text: "Speak to yourself like someone you love." },
  { id: 'm4', text: "Small steps still cover ground." },
  { id: 'm5', text: "You are allowed to take up space." },
  { id: 'm6', text: "Your perspective is your superpower." }
];

const MICRO_CHALLENGES = [
  { id: 'c1', name: "Eye contact with a stranger", icon: <UserCheck className="w-5 h-5" /> },
  { id: 'c2', name: "Mirror affirmation (3 mins)", icon: <Sparkles className="w-5 h-5" /> },
  { id: 'c3', name: "Wear one bold accessory", icon: <Star className="w-5 h-5" /> },
  { id: 'c4', name: "Say 'No' without explaining", icon: <ZapOff className="w-5 h-5" /> },
  { id: 'c5', name: "Compliment yourself out loud", icon: <MessageSquare className="w-5 h-5" /> }
];

const COMMUNITY_WALL = [
  "Someone out there is rooting for you.",
  "Your mistakes are just sketches of your masterpiece.",
  "The world is better with you in it.",
  "Softness is a strength.",
  "You've survived 100% of your bad days.",
  "Confidence is a muscle, keep flexing it."
];

const HABIT_GROUPS = {
  'Self Care': [
    { name: "Face massage (2 mins)", desc: "Gentle lymphatic drainage." },
    { name: "Hand cream ritual", desc: "Sensory mindful application." },
    { name: "Solo dance session", desc: "5 mins of pure movement." }
  ],
  'Study': [
    { name: "Clean desk reset", desc: "Declutter for mental clarity." },
    { name: "25-min Deep Focus", desc: "Pomodoro style session." },
    { name: "Read 2 pages", desc: "Small input, zero friction." }
  ],
  'Health': [
    { name: "Morning Lemon Water", desc: "Internal hydration reset." },
    { name: "10-min Sunlight walk", desc: "Circadian rhythm alignment." },
    { name: "Posture check", desc: "Roll shoulders back." }
  ],
  'Mental Peace': [
    { name: "3 Deep belly breaths", desc: "Nervous system regulation." },
    { name: "Digital fast (10 min)", desc: "Zero screens, total presence." },
    { name: "Write 1 daily win", desc: "Log your progress." }
  ],
  'Discipline': [
    { name: "Make your bed", desc: "First win of the day." },
    { name: "Outfit prep", desc: "Reduce morning fatigue." },
    { name: "On-time arrival", desc: "Respect your own schedule." }
  ]
};

interface BlogScreenProps {
  onNavigate: (screen: Screen) => void;
  onSaveLook: (look: SavedLook) => void;
}

export const BlogScreen: React.FC<BlogScreenProps> = ({ onNavigate, onSaveLook }) => {
  const [activeView, setActiveView] = useState<GlowHubView>('HUB');
  const [challengeProgress, setChallengeProgress] = useState<Record<string, ChallengeProgress>>({});
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [selectedLook, setSelectedLook] = useState<Lookbook | null>(null);
  const [expandedSkinType, setExpandedSkinType] = useState<string | null>(null);
  const [randomMirrorMessage, setRandomMirrorMessage] = useState(MIRROR_MESSAGES[0]);
  const [mood, setMood] = useState('Feeling Good');

  useEffect(() => {
    loadGlowUpProgress();
    setRandomMirrorMessage(MIRROR_MESSAGES[Math.floor(Math.random() * MIRROR_MESSAGES.length)]);
  }, [activeView]);

  const loadGlowUpProgress = async () => {
    try {
      const allProgress = await db.getAll(STORES.GLOWUP);
      const progressMap: Record<string, ChallengeProgress> = {};
      allProgress.forEach(item => {
        progressMap[item.id] = item;
      });
      setChallengeProgress(progressMap);
    } catch (e) {
      console.error("Load Progress Error", e);
    }
  };

  const submitToGoogleForm = async (data: Record<string, string>) => {
    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfZouRvzOBgbrnw6SyUiIs0fzQPAySibU8NBPsXHyzWJwEQyQ/formResponse";
    const params = new URLSearchParams();
    
    // Using generic field IDs - in a real app these would match the form
    Object.entries(data).forEach(([key, val], idx) => {
      params.append(`entry.${12345 + idx}`, `${key}: ${val}`);
    });

    try {
      await fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      alert("Reflection Logged. Keep Glowing. ✨");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChallengeStep = async (challengeId: string, step: string) => {
    const current = challengeProgress[challengeId] || { id: challengeId, completedSteps: [], lastCheckIn: new Date().toISOString() };
    const alreadyDone = current.completedSteps.includes(step);
    
    const updatedSteps = alreadyDone 
      ? current.completedSteps.filter(s => s !== step)
      : [...current.completedSteps, step];
    
    const updated: ChallengeProgress = {
      ...current,
      completedSteps: updatedSteps,
      lastCheckIn: new Date().toISOString()
    };

    await db.put(STORES.GLOWUP, updated);
    setChallengeProgress(prev => ({ ...prev, [challengeId]: updated }));
  };

  const openSearch = (query: string, store: 'amazon' | 'myntra' | 'google') => {
    const q = encodeURIComponent(query);
    if (store === 'amazon') window.open(`https://www.amazon.in/s?k=${q}`, '_blank');
    if (store === 'myntra') window.open(`https://www.google.com/search?q=site:myntra.com+${q}`, '_blank');
    if (store === 'google') window.open(`https://www.google.com/search?tbm=shop&q=${q}`, '_blank');
  };

  const renderSkincareCTAs = () => (
    <div className="pt-20 space-y-12 border-t border-brand-sandstone/10">
      <div className="text-center space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-sandstone">Next Steps</h4>
        <h3 className="text-4xl font-serif font-bold text-brand-onyx">Ready to <span className="italic text-brand-sandstone">Glow?</span></h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
        <Button 
          variant="primary" 
          className="flex-1 py-7 rounded-[2rem] text-xs font-bold tracking-widest shadow-luxury"
          onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdLYZ--khQmX-4p1tCrgFRRC6dlDknQTxENsK_XtG1PkbmkJg/viewform', '_blank')}
          icon={<Zap className="w-4 h-4" />}
        >
          Join Glow Challenge
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 py-7 rounded-[2rem] text-xs font-bold tracking-widest border-brand-sandstone/20"
          onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfZouRvzOBgbrnw6SyUiIs0fzQPAySibU8NBPsXHyzWJwEQyQ/viewform', '_blank')}
          icon={<MessageSquare className="w-4 h-4" />}
        >
          Ask Personal Question
        </Button>
      </div>
      <p className="text-center text-[10px] font-bold text-brand-sandstone uppercase tracking-widest leading-relaxed max-w-md mx-auto">
        DISCLAIMER: Content is for educational purposes only. Always consult a dermatologist for medical conditions.
      </p>
    </div>
  );

  const renderHub = () => (
    <div className="space-y-16 py-12">
      <div className="text-center space-y-6">
        <FadeIn>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-champagne/10 border border-brand-champagne/20 text-brand-champagne text-[10px] font-bold uppercase tracking-[0.4em]">
            <Sparkles className="w-4 h-4" /> Self-Care Laboratory
          </div>
        </FadeIn>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-onyx leading-tight">
          Glow Hub ✨
        </h1>
        <p className="text-xl text-brand-slate font-serif italic max-w-2xl mx-auto opacity-80">
          Curated intelligence for your visual and personal evolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {[
          { id: 'CHALLENGES', title: "Habit Stacking", subtitle: "Soft habit engagement", icon: <Layers className="w-8 h-8" />, color: "bg-blue-50 text-blue-600" },
          { id: 'SKINCARE_HUB', title: "Skincare Science", subtitle: "Rituals & Biological care", icon: <Droplets className="w-8 h-8" />, color: "bg-teal-50 text-teal-600" },
          { id: 'STYLE', title: "Style Capsules", subtitle: "The logic of dressing", icon: <Layout className="w-8 h-8" />, color: "bg-amber-50 text-amber-600" },
          { id: 'CONFIDENCE', title: "Confidence Hub", subtitle: "Mirror work & Challenges", icon: <Heart className="w-8 h-8" />, color: "bg-rose-50 text-rose-600" }
        ].map((card, idx) => (
          <FadeIn key={card.id} delay={idx * 100}>
            <div 
              onClick={() => setActiveView(card.id as GlowHubView)}
              className="bg-white p-10 rounded-[3rem] border border-brand-sandstone/10 shadow-luxury hover:shadow-luxury-hover hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between h-full min-h-[250px]"
            >
              <div className="space-y-6">
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-brand-onyx">{card.title}</h3>
                  <p className="text-brand-slate font-serif italic mt-2 opacity-70">{card.subtitle}</p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-onyx group-hover:text-brand-sandstone transition-colors">
                Explore <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );

  const renderConfidence = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-24">
      <div className="space-y-6">
        <button onClick={() => setActiveView('HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </button>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-onyx">Confidence Hub ✨</h1>
        <p className="text-xl text-brand-slate font-serif italic max-w-2xl">Reclaiming your internal light through consistent, small acts of courage.</p>
      </div>

      {/* DAILY MIRROR MESSAGES */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><Sparkle className="w-6 h-6" /></div>
           <h3 className="text-3xl font-serif font-bold">Mirror Messages</h3>
        </div>
        <FadeIn className="bg-brand-onyx text-white p-12 lg:p-20 rounded-[4rem] text-center space-y-12 relative overflow-hidden shadow-luxury">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center">
              <Sparkles className="w-[80%] h-[80%] text-brand-champagne rotate-12" />
           </div>
           <Quote className="w-12 h-12 text-brand-champagne/40 mx-auto" />
           <h2 className="text-4xl lg:text-6xl font-serif font-bold italic leading-tight relative z-10">
              "{randomMirrorMessage.text}"
           </h2>
           <div className="pt-8 relative z-10">
              <Button 
                variant="secondary" 
                className="py-6 px-12 rounded-full text-[10px]" 
                icon={<Heart className="w-4 h-4 fill-current" />}
                onClick={() => submitToGoogleForm({ 
                  action: "Mirror Message Click", 
                  message_id: randomMirrorMessage.id, 
                  message_text: randomMirrorMessage.text,
                  timestamp: new Date().toISOString()
                })}
              >
                I Needed This Today 💗
              </Button>
           </div>
        </FadeIn>
      </section>

      {/* CONFIDENCE MICRO-CHALLENGES */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Zap className="w-6 h-6" /></div>
           <h3 className="text-3xl font-serif font-bold">Micro-Challenges</h3>
        </div>
        
        <div className="mb-8">
           <label className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone mb-3 block">Current Energy Level</label>
           <select 
             value={mood} 
             onChange={e => setMood(e.target.value)}
             className="bg-white border border-brand-sandstone/20 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:border-brand-onyx appearance-none cursor-pointer"
           >
              <option>Feeling Good</option>
              <option>Need a Push</option>
              <option>Socially Anxious</option>
              <option>Power Mode</option>
           </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
           {MICRO_CHALLENGES.map(c => (
             <div key={c.id} className="bg-white p-8 rounded-[3rem] border border-brand-sandstone/10 shadow-sm flex flex-col justify-between group hover:shadow-luxury transition-all">
                <div className="space-y-6">
                   <div className="w-12 h-12 bg-brand-ivory rounded-2xl flex items-center justify-center text-brand-onyx group-hover:bg-brand-onyx group-hover:text-white transition-all">
                      {c.icon}
                   </div>
                   <h4 className="text-xl font-serif font-bold">{c.name}</h4>
                </div>
                <button 
                  onClick={() => submitToGoogleForm({
                    action: "Micro Challenge Complete",
                    challenge_name: c.name,
                    category: "confidence",
                    user_mood: mood
                  })}
                  className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-slate hover:text-brand-onyx transition-colors"
                >
                  I Did This ✨ <ChevronRight className="w-4 h-4" />
                </button>
             </div>
           ))}
        </div>
      </section>

      {/* GIRL-TO-GIRL WALL */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><Smile className="w-6 h-6" /></div>
           <h3 className="text-3xl font-serif font-bold">Girl-to-Girl Wall</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {COMMUNITY_WALL.map((msg, idx) => (
             <div key={idx} className="p-8 bg-brand-ivory rounded-[2.5rem] border border-brand-sandstone/10 relative shadow-sm hover:rotate-1 transition-transform">
                <Quote className="absolute top-4 right-6 w-5 h-5 text-brand-sandstone/20" />
                <p className="text-lg font-serif italic text-brand-slate leading-relaxed pr-6">"{msg}"</p>
                <div className="mt-6 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-brand-sandstone/20"></div>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Anonymous Sister</span>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );

  const renderChallenges = () => {
    const scrollToCategory = (id: string) => {
      const el = document.getElementById(`habit-${id.replace(/\s+/g, '-').toLowerCase()}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
      <div className="max-w-6xl mx-auto py-12 space-y-24">
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <button onClick={() => setActiveView('HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-onyx">Habit Stacking ✨</h1>
          <p className="text-xl text-brand-slate font-serif italic">Soft consistency is superior to aggressive perfection. Choose your focus for the week.</p>
        </div>

        {/* GLOW FOCUS SELECTOR */}
        <section className="flex flex-wrap justify-center gap-4">
           {Object.keys(HABIT_GROUPS).map(cat => (
             <button 
               key={cat} 
               onClick={() => scrollToCategory(cat)}
               className="px-8 py-4 bg-white border border-brand-sandstone/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-onyx hover:text-brand-champagne shadow-sm transition-all active:scale-95"
             >
                {cat}
             </button>
           ))}
        </section>

        {/* GENTLE HABIT CARDS */}
        <section className="space-y-20">
           {Object.entries(HABIT_GROUPS).map(([cat, habits]) => (
             <FadeIn key={cat} id={`habit-${cat.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-10 scroll-mt-32">
                <div className="flex items-center gap-4 px-4 border-b border-brand-sandstone/10 pb-6">
                   <h3 className="text-3xl font-serif font-bold text-brand-onyx">{cat}</h3>
                   <span className="text-[10px] font-bold text-brand-sandstone uppercase tracking-widest">3 Micro-Habits</span>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                   {habits.map(h => (
                     <div key={h.name} className="bg-white p-10 rounded-[3rem] border border-brand-sandstone/10 shadow-sm flex flex-col justify-between group hover:shadow-luxury transition-all relative overflow-hidden">
                        <div className="space-y-4 relative z-10">
                           <h4 className="text-xl font-serif font-bold text-brand-onyx">{h.name}</h4>
                           <p className="text-sm text-brand-slate font-serif italic opacity-70">"{h.desc}"</p>
                        </div>
                        <div className="mt-10 space-y-4 relative z-10">
                           <label className="text-[8px] font-bold uppercase tracking-widest text-brand-sandstone block ml-1">Weekly Commitment</label>
                           <div className="flex flex-col gap-2">
                             {['3 days', '5 days', 'Full Week'].map(commit => (
                               <button 
                                 key={commit}
                                 onClick={() => submitToGoogleForm({
                                   habit_name: h.name,
                                   category: cat,
                                   selected_commitment: commit
                                 })}
                                 className="w-full py-3 bg-brand-ivory hover:bg-brand-onyx hover:text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all text-brand-onyx"
                               >
                                 Trying {commit} 🌱
                               </button>
                             ))}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </FadeIn>
           ))}
        </section>

        {/* WEEKLY REFLECTION CARD */}
        <section className="max-w-2xl mx-auto pt-20">
           <div className="bg-brand-onyx text-white p-12 lg:p-16 rounded-[4rem] text-center space-y-10 shadow-luxury relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-champagne/10 rounded-full blur-3xl"></div>
              <div className="space-y-4">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-brand-champagne mb-4"><Book className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-serif font-bold italic">Weekly Reflection</h3>
                 <p className="text-brand-slate text-lg font-serif italic opacity-80">Do you feel better than last week?</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 {['Yes', 'Same', 'Worse'].map(opt => (
                   <button 
                    key={opt}
                    onClick={() => submitToGoogleForm({
                      reflection_question: "Do you feel better than last week?",
                      selected_option: opt,
                      timestamp: new Date().toISOString()
                    })}
                    className="flex-1 py-5 px-8 rounded-2xl border border-white/10 hover:bg-white hover:text-brand-onyx transition-all font-bold uppercase text-[10px] tracking-widest"
                   >
                     {opt}
                   </button>
                 ))}
              </div>
           </div>
        </section>
      </div>
    );
  };

  /**
   * Fix: Added missing render functions for Skincare Hub and sub-categories
   */
  const renderSkincareHub = () => (
    <div className="max-w-6xl mx-auto py-12 space-y-16">
      <button onClick={() => setActiveView('HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-brand-onyx">Skincare Science 🧪</h1>
        <p className="text-lg text-brand-slate font-serif italic max-w-2xl mx-auto">Advanced rituals for biological skin health and radiance.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { id: 'SKIN_TYPE', title: "Know Your Skin Type", icon: <UserCheck className="w-8 h-8" />, desc: "Identify your skin's biological needs." },
          { id: 'K_BEAUTY', title: "K-Beauty Secrets", icon: <Sparkle className="w-8 h-8" />, desc: "The glass skin 10-step philosophy." },
          { id: 'J_BEAUTY', title: "J-Beauty Rituals", icon: <Waves className="w-8 h-8" />, desc: "Japanese minimalist functional care." },
          { id: 'DIY_INDIAN', title: "Natural & Indian DIY", icon: <Flower2 className="w-8 h-8" />, desc: "Ayurvedic and heritage-based kitchen remedies." }
        ].map(cat => (
          <div key={cat.id} onClick={() => setActiveView(cat.id as GlowHubView)} className="bg-white p-10 rounded-[3rem] border border-brand-sandstone/10 shadow-sm hover:shadow-luxury transition-all cursor-pointer group">
            <div className="w-14 h-14 bg-brand-ivory rounded-2xl flex items-center justify-center text-brand-onyx group-hover:bg-brand-onyx group-hover:text-brand-champagne transition-all mb-6">{cat.icon}</div>
            <h3 className="text-2xl font-serif font-bold mb-2">{cat.title}</h3>
            <p className="text-sm text-brand-slate italic font-serif">{cat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkinType = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button onClick={() => setActiveView('SKINCARE_HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Skincare
      </button>
      <div className="space-y-8">
        <h2 className="text-4xl font-serif font-bold">Skin Types & Analysis</h2>
        <div className="space-y-4">
          {[
            { type: "Oily", traits: "Large pores, shiny appearance, prone to acne.", advice: "Use lightweight gel cleansers and non-comedogenic moisturizers." },
            { type: "Dry", traits: "Tightness, flakiness, visible lines.", advice: "Focus on barrier repair and humectants like hyaluronic acid." },
            { type: "Combination", traits: "Oily T-zone, dry cheeks.", advice: "Spot-treat different areas with tailored products." },
            { type: "Sensitive", traits: "Redness, itching, easily irritated.", advice: "Fragrance-free, minimalist ingredient lists are mandatory." }
          ].map(item => (
            <div key={item.type} className="bg-white p-8 rounded-[2rem] border border-brand-sandstone/10">
              <h4 className="text-xl font-bold mb-2">{item.type} Skin</h4>
              <p className="text-sm mb-4"><span className="font-bold text-brand-sandstone uppercase text-[9px]">Traits:</span> {item.traits}</p>
              <p className="text-sm italic text-brand-slate font-serif">"{item.advice}"</p>
            </div>
          ))}
        </div>
      </div>
      {renderSkincareCTAs()}
    </div>
  );

  const renderKBeauty = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button onClick={() => setActiveView('SKINCARE_HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Skincare
      </button>
      <div className="space-y-10">
        <div className="aspect-video rounded-[3rem] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1200" className="w-full h-full object-cover" alt="K-Beauty" />
        </div>
        <h2 className="text-4xl font-serif font-bold">The K-Beauty Philosophy</h2>
        <p className="text-lg text-brand-slate font-serif italic leading-relaxed">Focusing on deep hydration and a "skin first" approach rather than masking with makeup. The goal is 'Glass Skin'.</p>
        <div className="grid gap-6">
           <div className="bg-teal-50/30 p-8 rounded-[2rem] border border-teal-100"><h4 className="font-bold mb-2">Double Cleansing</h4><p className="text-sm">Oil-based cleanser followed by water-based to ensure zero residue.</p></div>
           <div className="bg-teal-50/30 p-8 rounded-[2rem] border border-teal-100"><h4 className="font-bold mb-2">7-Skin Method</h4><p className="text-sm">Patting in multiple layers of toner to deeply quench the skin.</p></div>
        </div>
      </div>
      {renderSkincareCTAs()}
    </div>
  );

  const renderJBeauty = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button onClick={() => setActiveView('SKINCARE_HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Skincare
      </button>
      <div className="space-y-10">
        <div className="aspect-video rounded-[3rem] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1200" className="w-full h-full object-cover" alt="J-Beauty" />
        </div>
        <h2 className="text-4xl font-serif font-bold">J-Beauty: Functional Simplicity</h2>
        <p className="text-lg text-brand-slate font-serif italic leading-relaxed">Based on 'Mochi Hada' (rice-cake skin) — supple, matte, and firm. Focus is on efficacy and tradition.</p>
        <div className="grid gap-6">
           <div className="bg-brand-ivory p-8 rounded-[2rem] border border-brand-sandstone/20"><h4 className="font-bold mb-2">Lotion Masking</h4><p className="text-sm">Soaking cotton pads in lotion/toner for a 3-minute quick mask.</p></div>
           <div className="bg-brand-ivory p-8 rounded-[2rem] border border-brand-sandstone/20"><h4 className="font-bold mb-2">Sun Protection</h4><p className="text-sm">The non-negotiable step to prevent environmental aging.</p></div>
        </div>
      </div>
      {renderSkincareCTAs()}
    </div>
  );

  const renderNaturalCare = () => (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button onClick={() => setActiveView('SKINCARE_HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Skincare
      </button>
      <div className="space-y-10">
        <h2 className="text-4xl font-serif font-bold">Heritage & Natural Care 🌿</h2>
        <p className="text-lg text-brand-slate font-serif italic leading-relaxed">Time-tested remedies from the Indian subcontinent using potent kitchen ingredients.</p>
        <div className="grid sm:grid-cols-2 gap-6">
           <div className="p-8 bg-amber-50/40 rounded-[2.5rem] border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-2">The Glow Mask (Ubtan)</h4>
              <p className="text-sm">Gram flour, turmeric, and milk. Excellent for exfoliating and brightening.</p>
           </div>
           <div className="p-8 bg-amber-50/40 rounded-[2.5rem] border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-2">Rose Water Mist</h4>
              <p className="text-sm">Pure steam-distilled rose water to balance pH and soothe inflammation.</p>
           </div>
        </div>
      </div>
      {renderSkincareCTAs()}
    </div>
  );

  /**
   * Fix: Added missing render functions for Style section
   */
  const renderStyleList = () => (
    <div className="max-w-6xl mx-auto py-12 space-y-16">
      <button onClick={() => setActiveView('HUB')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-brand-onyx">Style Capsules 🧥</h1>
        <p className="text-lg text-brand-slate font-serif italic max-w-2xl mx-auto">The logic of dressing: Proportions, palettes, and silhouettes.</p>
      </div>
      
      <div className="flex justify-center gap-4 flex-wrap">
        {['All', 'College', 'Office', 'Festive', 'Casual'].map(f => (
          <button key={f} onClick={() => setStyleFilter(f)} className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${styleFilter === f ? 'bg-brand-onyx text-brand-champagne shadow-lg' : 'bg-white border border-brand-sandstone/10 text-brand-slate hover:border-brand-onyx'}`}>{f}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {LOOKBOOKS.filter(lb => styleFilter === 'All' || lb.category === styleFilter).map(lb => (
          <div key={lb.id} onClick={() => setSelectedLook(lb)} className="bg-white rounded-[3.5rem] overflow-hidden border border-brand-sandstone/10 shadow-sm group hover:shadow-luxury transition-all cursor-pointer flex flex-col">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={lb.mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={lb.title} />
            </div>
            <div className="p-10 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-brand-champagne uppercase tracking-[0.3em]">{lb.category}</span>
                  <div className="flex gap-1">
                    {lb.moodTags.slice(0, 2).map(tag => <span key={tag} className="text-[7px] font-bold uppercase text-brand-sandstone">#{tag}</span>)}
                  </div>
               </div>
               <h3 className="text-2xl font-serif font-bold text-brand-onyx leading-tight">{lb.title}</h3>
               <p className="text-xs text-brand-slate font-serif italic line-clamp-2 opacity-70">"{lb.description}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStyleDetail = (lb: Lookbook) => (
    <div className="max-w-5xl mx-auto py-12 space-y-20">
      <button onClick={() => setSelectedLook(null)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Lookbooks
      </button>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div className="sticky top-24 aspect-[3/4] rounded-[4rem] overflow-hidden shadow-luxury">
           <img src={lb.mainImage} className="w-full h-full object-cover" alt={lb.title} />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-onyx/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-champagne mb-4">Masterpiece Silhouette</span>
              <h2 className="text-5xl font-serif font-bold leading-tight">{lb.title}</h2>
           </div>
        </div>

        <div className="space-y-16">
           <div className="space-y-6">
              <h3 className="text-3xl font-serif font-bold text-brand-onyx">The Style Logic</h3>
              <div className="space-y-8">
                <div className="space-y-2"><h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Color Theory</h4><p className="text-sm italic font-serif opacity-80">{lb.logic.colors}</p></div>
                <div className="space-y-2"><h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone">Architectural Proportions</h4><p className="text-sm italic font-serif opacity-80">{lb.logic.proportions}</p></div>
              </div>
           </div>

           <div className="space-y-10">
              <h3 className="text-3xl font-serif font-bold text-brand-onyx">Component Breakdown</h3>
              <div className="space-y-6">
                 {lb.items.map((item, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-brand-sandstone/10 flex gap-6 group hover:shadow-md transition-all">
                      <div className="w-20 h-24 bg-brand-ivory rounded-2xl overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 flex flex-col justify-center">
                         <span className="text-[8px] font-bold text-brand-sandstone uppercase tracking-widest">{item.category}</span>
                         <h4 className="text-lg font-serif font-bold">{item.name}</h4>
                         <div className="flex gap-2 mt-3">
                           <button onClick={() => openSearch(item.searchQuery, 'google')} className="px-3 py-1.5 bg-brand-ivory hover:bg-brand-onyx hover:text-white rounded-lg text-[7px] font-bold uppercase transition-all">Google</button>
                           <button onClick={() => openSearch(item.searchQuery, 'amazon')} className="px-3 py-1.5 bg-brand-ivory hover:bg-brand-onyx hover:text-white rounded-lg text-[7px] font-bold uppercase transition-all">Amazon</button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-brand-onyx text-white p-10 rounded-[3rem] space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-champagne">Style Transitions</h4>
              <div className="grid gap-4">
                 <div className="flex gap-4"><Zap className="w-5 h-5 text-brand-champagne shrink-0" /><p className="text-xs italic font-serif">"Transition to Night: {lb.variations.party}"</p></div>
                 <div className="flex gap-4"><Wind className="w-5 h-5 text-brand-champagne shrink-0" /><p className="text-xs italic font-serif">"Seasonal Shift: {lb.variations.seasonal}"</p></div>
              </div>
           </div>
           
           <Button variant="primary" className="w-full py-6 rounded-2xl" icon={<Save className="w-4 h-4" />} onClick={() => onSaveLook({ id: lb.id, date: new Date().toLocaleDateString(), image: lb.mainImage, items: [lb.title], folder: 'Lookbook Inspired' })}>Save Inspiration to Closet</Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'HUB': return renderHub();
      case 'CHALLENGES': return renderChallenges();
      case 'SKINCARE_HUB': return renderSkincareHub();
      case 'SKIN_TYPE': return renderSkinType();
      case 'K_BEAUTY': return renderKBeauty();
      case 'J_BEAUTY': return renderJBeauty();
      case 'DIY_INDIAN': return renderNaturalCare();
      case 'STYLE': return selectedLook ? renderStyleDetail(selectedLook) : renderStyleList();
      case 'CONFIDENCE': return renderConfidence();
      default: return renderHub();
    }
  };

  return (
    <div className="container mx-auto px-6 lg:px-12 pb-40 min-h-screen">
      <FadeIn key={activeView}>
        {renderContent()}
      </FadeIn>
    </div>
  );
};
