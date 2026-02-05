
// DO cast result of db.get to any to resolve property access on unknown type
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, User, Ruler, Palette, ChevronRight, Camera, 
  Trash2, AlertTriangle, LogOut, X, Shield, Bell, HelpCircle, Sparkles, Scan, Fingerprint, RefreshCw, Info, Copy, ArrowRight,
  Calendar as CalendarIcon, ChevronLeft, ListTodo, Clock, Plus, Edit, Heart, Check
} from 'lucide-react';
import { auth } from '../services/firebase';
import { updateProfile, signOut } from 'firebase/auth';
import { getUserProfile, updateUserProfile } from '../services/firestore';
import { Button, LoadingOverlay, FadeIn } from '../components/Components';
import { analyzeColorTheory } from '../services/geminiService';
import { UserProfile, Screen } from '../types';
import { db, STORES } from '../services/db';

interface AccountScreenProps {
  onTryOnFromShop?: (img: string, name: string) => void;
  onNavigate?: (screen: Screen) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or null
  notes: string | null;
  type: 'task' | 'event' | 'routine';
  completed: boolean;
}

const STYLE_PROFILES = {
  "Casual Chic": {
    desc: "Effortless, comfortable, and timelessly cool.",
    items: "Denim, White Tees, Linen, Flats",
    colors: ["#F5F5F5", "#D2B48C", "#4682B4"]
  },
  "Trendy Diva": {
    desc: "Bold, experimental, and ahead of the curve.",
    items: "Crop Tops, Statement Sets, Neon, Heels",
    colors: ["#FF1493", "#39FF14", "#000000"]
  },
  "Elegant Classic": {
    desc: "Sophisticated, refined, and perpetually polished.",
    items: "Silk Dresses, Blazers, Pearls, Pumps",
    colors: ["#2F4F4F", "#FDF5E6", "#708090"]
  },
  "Sporty Cool": {
    desc: "High-energy, functional, and urban-inspired.",
    items: "Hoodies, Tech-wear, Sneakers, Caps",
    colors: ["#000000", "#808080", "#FF4500"]
  },
  "Desi Queen": {
    desc: "Regal, vibrant, and rich in heritage.",
    items: "Lehengas, Kurtis, Juttis, Maroons",
    colors: ["#800000", "#FFD700", "#008080"]
  }
};

const QUIZ_QUESTIONS = [
  { id: 1, q: "Describe your ideal daily outfit?", options: [{ text: "Jeans + Basic Tee", type: "Casual Chic" }, { text: "Crop Top + Baggy Pants", type: "Trendy Diva" }, { text: "Kurti or Simple Dress", type: "Elegant Classic" }, { text: "Hoodie + Sneakers", type: "Sporty Cool" }, { text: "Ethnic wear", type: "Desi Queen" }] },
  { id: 2, q: "Your weekend evening look?", options: [{ text: "Oversized Tee", type: "Casual Chic" }, { text: "Party dress", type: "Trendy Diva" }, { text: "Maxi dress", type: "Elegant Classic" }, { text: "Tracksuit", type: "Sporty Cool" }, { text: "Lehenga skirt", type: "Desi Queen" }] },
  { id: 3, q: "Favorite footwear style?", options: [{ text: "Comfortable Flats", type: "Casual Chic" }, { text: "High Heels", type: "Trendy Diva" }, { text: "Ballet shoes", type: "Elegant Classic" }, { text: "Sneakers", type: "Sporty Cool" }, { text: "Juttis", type: "Desi Queen" }] },
  { id: 4, q: "What is your primary color palette?", options: [{ text: "Denim / Beige", type: "Casual Chic" }, { text: "Neon / Bold", type: "Trendy Diva" }, { text: "Pastels", type: "Elegant Classic" }, { text: "Black / Grey", type: "Sporty Cool" }, { text: "Maroon / Gold", type: "Desi Queen" }] },
  { id: 5, q: "How do you prefer to shop?", options: [{ text: "Focus on comfort", type: "Casual Chic" }, { text: "Trend-focused", type: "Trendy Diva" }, { text: "Classic pieces", type: "Elegant Classic" }, { text: "Sportswear", type: "Sporty Cool" }, { text: "Ethnic sets", type: "Desi Queen" }] },
  { id: 6, q: "What is your Instagram vibe?", options: [{ text: "Street cafés", type: "Casual Chic" }, { text: "Glam selfies", type: "Trendy Diva" }, { text: "Aesthetic portraits", type: "Elegant Classic" }, { text: "Fitness travel", type: "Sporty Cool" }, { text: "Festive photos", type: "Desi Queen" }] },
  { id: 7, q: "Favorite events to attend?", options: [{ text: "College hangouts", type: "Casual Chic" }, { text: "Parties", type: "Trendy Diva" }, { text: "Formal events", type: "Elegant Classic" }, { text: "Adventure trips", type: "Sporty Cool" }, { text: "Weddings", type: "Desi Queen" }] },
  { id: 8, q: "Your fashion inspiration source?", options: [{ text: "Simple influencer", type: "Casual Chic" }, { text: "Model runway", type: "Trendy Diva" }, { text: "Royal elegance", type: "Elegant Classic" }, { text: "Fitness icon", type: "Sporty Cool" }, { text: "Traditional beauty", type: "Desi Queen" }] }
];

export const AccountScreen: React.FC<AccountScreenProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'identity' | 'calendar' | 'settings'>('identity'); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editMeasurements, setEditMeasurements] = useState<Record<string, string>>({ height: '-', bust: '-', waist: '-', hips: '-' });
  const [colorAnalysis, setColorAnalysis] = useState<{season: string, colors: string[], advice: string} | null>(null);
  const [analysisPhoto, setAnalysisPhoto] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0); 
  const [styleScores, setStyleScores] = useState<Record<string, number>>({
    CasualChic: 0, TrendyDiva: 0, ElegantClassic: 0, SportyCool: 0, DesiQueen: 0
  });
  const [userStyle, setUserStyle] = useState<string | null>(null);

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({ type: 'task' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
    loadCalendarData();
    loadStyleResult();
  }, []);

  const loadStyleResult = async () => {
    try {
      // DO cast result to any to avoid Property 'value' does not exist on type 'unknown'
      const saved = await db.get(STORES.PERSONALIZATION, 'style_profile') as any;
      if (saved && saved.value) {
        setUserStyle(saved.value.styleType);
      }
    } catch (e) {}
  };

  const startQuiz = () => {
    setQuizStep(1);
    setStyleScores({ CasualChic: 0, TrendyDiva: 0, ElegantClassic: 0, SportyCool: 0, DesiQueen: 0 });
    setShowQuiz(true);
  };

  const handleQuizAnswer = (type: string) => {
    const key = type.replace(/\s/g, '');
    setStyleScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
    if (quizStep < 8) setQuizStep(quizStep + 1);
    else setQuizStep(9);
  };

  const getWinner = () => {
    const map = { CasualChic: "Casual Chic", TrendyDiva: "Trendy Diva", ElegantClassic: "Elegant Classic", SportyCool: "Sporty Cool", DesiQueen: "Desi Queen" };
    const winnerKey = Object.entries(styleScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return map[winnerKey as keyof typeof map];
  };

  const saveQuizResult = async () => {
    const winner = getWinner();
    const result = { styleType: winner, savedAt: new Date().toISOString().split('T')[0] };
    await db.put(STORES.PERSONALIZATION, { key: 'style_profile', value: result });
    setUserStyle(winner);
    setShowQuiz(false);
  };

  const loadCalendarData = async () => {
    try {
      const savedEvents = await db.getAll(STORES.CALENDAR);
      setEvents(savedEvents || []);
    } catch (e) {
      setEvents([]);
    }
  };

  const saveCalendarEvent = async (event: CalendarEvent) => {
    await db.put(STORES.CALENDAR, event);
    loadCalendarData();
  };

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        setEditName(p.name || '');
        setEditMeasurements(p.measurements || { height: '-', bust: '-', waist: '-', hips: '-' });
      }
    }
    setIsLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsActionLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const user = auth.currentUser;
      if (user) {
        try {
          await updateProfile(user, { photoURL: base64 });
          await updateUserProfile(user.uid, { photoURL: base64 });
          setProfile(prev => prev ? { ...prev, photoURL: base64 } : null);
        } catch (err) { alert("Failed to upload photo."); }
      }
      setIsActionLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateName = async () => {
    const user = auth.currentUser;
    if (!user || !profile) return;
    setIsActionLoading(true);
    try {
      await updateProfile(user, { displayName: editName });
      await updateUserProfile(user.uid, { name: editName });
      setProfile({ ...profile, name: editName });
      setIsEditingProfile(false);
    } catch (e) { alert("Update failed."); }
    finally { setIsActionLoading(false); }
  };

  const handleUpdateMeasurements = async () => {
    const user = auth.currentUser;
    if (!user || !profile) return;
    setIsActionLoading(true);
    try {
      await updateUserProfile(user.uid, { measurements: editMeasurements as any });
      setProfile({ ...profile, measurements: editMeasurements as any });
      setIsEditingMeasurements(false);
    } catch (e) { alert("Update failed."); }
    finally { setIsActionLoading(false); }
  };

  const handleColorAnalysis = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsActionLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const fullBase64 = reader.result as string;
      setAnalysisPhoto(fullBase64);
      const pureBase64 = fullBase64.split(',')[1];
      try {
        const result = await analyzeColorTheory(pureBase64);
        setColorAnalysis(result);
        // Persist color theory result to personalization store
        await db.put(STORES.PERSONALIZATION, { key: 'color_theory', value: result });
      } catch (err) { alert("Color analysis failed."); setAnalysisPhoto(null); }
      setIsActionLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // CALENDAR LOGIC
  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date) return;
    const newEvent: CalendarEvent = {
      id: eventForm.id || crypto.randomUUID(),
      title: eventForm.title,
      date: eventForm.date,
      time: eventForm.time || '',
      notes: eventForm.notes || null,
      type: eventForm.type as 'task' | 'event' | 'routine' || 'task',
      completed: eventForm.completed || false
    };
    await saveCalendarEvent(newEvent);
    setIsEventModalOpen(false);
    setEventForm({ type: 'task' });
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      await db.delete(STORES.CALENDAR, id);
      loadCalendarData();
    }
  };

  const handleToggleEventCompleted = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      const updated = { ...event, completed: !event.completed };
      await saveCalendarEvent(updated);
    }
  };

  const renderCalendarMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const selectedDayEvents = events.filter(e => e.date === selectedDate);

    return (
      <div className="space-y-12">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-4xl font-serif font-bold text-brand-onyx">{currentDate.toLocaleString('default', { month: 'long' })}</h4>
            <p className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.4em]">{year}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-1 bg-brand-ivory p-1.5 rounded-2xl border border-brand-sandstone/10">
              <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <Button onClick={() => { setEventForm({ date: selectedDate, type: 'task' }); setIsEventModalOpen(true); }} className="py-3 px-8 rounded-2xl shadow-luxury" icon={<Plus className="w-4 h-4" />}>Add Task</Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-brand-sandstone uppercase py-2 tracking-[0.2em]">{d}</div>
          ))}
          {days.map((day, i) => {
            const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const dayEvents = day ? events.filter(e => e.date === dateStr) : [];
            const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();
            const isSelected = day && selectedDate === dateStr;

            return (
              <div 
                key={i} 
                onClick={() => {
                   if(day) {
                     setSelectedDate(dateStr);
                   }
                }} 
                className={`aspect-square border border-brand-sandstone/10 rounded-3xl p-3 cursor-pointer transition-all flex flex-col items-center justify-between group relative overflow-hidden
                  ${day ? 'bg-white hover:border-brand-onyx/30 hover:shadow-luxury' : 'bg-transparent border-none pointer-events-none'}
                  ${isSelected ? 'ring-2 ring-brand-onyx bg-brand-ivory z-10' : ''}
                  ${isToday ? 'border-brand-onyx' : ''}
                `}
              >
                {day && (
                  <>
                    <span className={`text-[12px] font-bold ${isToday ? 'text-brand-onyx' : 'text-brand-slate opacity-40'} ${isSelected ? 'opacity-100' : ''}`}>
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-center mt-auto">
                      {dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          className={`w-1.5 h-1.5 rounded-full
                            ${e.type === 'event' ? 'bg-blue-500' : e.type === 'task' ? 'bg-yellow-500' : 'bg-green-500'}
                            ${e.completed ? 'opacity-20' : 'opacity-100'}
                          `}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Task List Panel */}
        <FadeIn className="pt-10 space-y-8">
          <div className="flex items-center justify-between border-b border-brand-sandstone/20 pb-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-brand-onyx text-brand-champagne rounded-2xl flex items-center justify-center shadow-lg"><ListTodo className="w-6 h-6" /></div>
               <div>
                  <h5 className="text-[11px] font-bold text-brand-onyx uppercase tracking-[0.4em]">Engagements for {new Date(selectedDate).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h5>
                  <p className="text-[9px] text-brand-sandstone font-bold uppercase tracking-widest mt-1">Neural Itinerary</p>
               </div>
             </div>
             <span className="text-[10px] font-bold text-brand-sandstone bg-brand-ivory px-4 py-2 rounded-full uppercase tracking-widest">{selectedDayEvents.length} Items</span>
          </div>
          
          <div className="grid gap-4">
            {selectedDayEvents.length === 0 ? (
              <div className="py-20 bg-brand-ivory/30 rounded-[3rem] border border-dashed border-brand-sandstone/20 text-center flex flex-col items-center gap-4">
                 <CalendarIcon className="w-10 h-10 text-brand-sandstone opacity-20" />
                 <p className="text-sm text-brand-slate italic font-serif opacity-50">No engagements established for this date.</p>
                 <Button onClick={() => setIsEventModalOpen(true)} variant="outline" className="py-2 px-6 text-[9px]">Add First Entry</Button>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div key={event.id} className="group bg-white p-8 rounded-[2.5rem] border border-brand-sandstone/10 flex items-center justify-between hover:shadow-luxury transition-all">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleEventCompleted(event.id); }}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${event.completed ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' : 'border-brand-sandstone/30 hover:border-brand-onyx'}`}
                    >
                      {event.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div className="space-y-1">
                      <h6 className={`text-base font-bold tracking-tight transition-all ${event.completed ? 'text-brand-slate line-through opacity-40' : 'text-brand-onyx'}`}>{event.title}</h6>
                      <div className="flex items-center gap-4">
                        {event.time && <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-sandstone uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /> {event.time}</span>}
                        <span className={`px-3 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] ${event.type === 'event' ? 'bg-blue-50 text-blue-600' : event.type === 'task' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                          {event.type}
                        </span>
                      </div>
                      {event.notes && <p className="text-xs text-brand-slate italic font-serif leading-relaxed mt-2 opacity-60">"{event.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEventForm(event); setIsEventModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-brand-ivory rounded-xl text-brand-slate hover:bg-brand-onyx hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </FadeIn>
      </div>
    );
  };

  if (isLoading) return <LoadingOverlay message="Synchronizing Member Profile..." />;

  const tabs = [
    { id: 'profile', label: 'Member Profile', icon: <User className="w-4 h-4" /> },
    { id: 'identity', label: 'Neural Identity', icon: <Fingerprint className="w-4 h-4" /> },
    { id: 'calendar', label: 'Style Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Studio Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[320px_1fr] gap-16 py-12 px-6 pb-40">
      {/* Sidebar Nav */}
      <aside className="space-y-6">
        <div className="bg-white p-8 rounded-[3rem] border border-brand-sandstone/10 shadow-luxury space-y-8 sticky top-24">
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[2rem] p-1 bg-brand-ivory border border-brand-sandstone/20 overflow-hidden shadow-inner">
                        <img src={profile?.photoURL || auth.currentUser?.photoURL || `https://api.dicebear.com/9.x/micah/svg?seed=${profile?.uid}`} className="w-full h-full object-cover rounded-[1.8rem]" alt="Avatar" />
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-brand-onyx text-brand-champagne p-3 rounded-xl shadow-xl hover:scale-110 transition-transform"><Camera className="w-4 h-4" /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-brand-onyx">{profile?.name}</h2>
                <p className="text-[10px] uppercase font-bold text-brand-sandstone tracking-widest mt-1">Studio Member</p>
            </div>

            <div className="space-y-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => { if (tab.id === 'settings') onNavigate?.(Screen.SETTINGS); else setActiveTab(tab.id as any); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-onyx text-brand-champagne shadow-luxury' : 'text-brand-slate hover:bg-brand-ivory'}`} >{tab.icon} {tab.label}</button>
                ))}
            </div>

            <div className="pt-4 border-t border-brand-sandstone/10">
              {userStyle ? (
                <div className="bg-brand-ivory p-6 rounded-[2rem] border border-brand-sandstone/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-onyx flex items-center justify-center text-brand-champagne"><Sparkles className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[8px] font-bold text-brand-sandstone uppercase tracking-widest">Neural Persona</p>
                      <h4 className="text-xs font-bold text-brand-onyx uppercase tracking-widest">{userStyle}</h4>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full py-3 text-[8px]" onClick={startQuiz}>Retake Analysis</Button>
                </div>
              ) : (
                <button onClick={startQuiz} className="w-full p-6 bg-brand-champagne/10 border border-brand-champagne/40 rounded-[2rem] text-center hover:bg-brand-champagne/20 transition-all group">
                  <Heart className="w-6 h-6 text-brand-onyx mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-[10px] font-bold text-brand-onyx uppercase tracking-widest">Aesthetic Calibration</h4>
                  <p className="text-[8px] text-brand-slate mt-1 font-medium italic">Discover your visual frequency</p>
                </button>
              )}
            </div>
            
            <div className="h-px bg-brand-sandstone/10"></div>
            <button onClick={() => signOut(auth)} className="w-full flex items-center gap-4 px-6 py-4 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-h-[600px] space-y-16">
        {activeTab === 'profile' && (
          <FadeIn key="profile-tab" className="space-y-12">
            <div className="bg-white p-12 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury">
                <h3 className="text-4xl font-serif font-bold text-brand-onyx mb-10">Archive Identity</h3>
                <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone pl-1">Full Member Name</label>{isEditingProfile ? (<input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-2xl px-6 py-4 text-sm font-bold text-brand-onyx outline-none focus:border-brand-champagne" />) : (<div className="text-xl font-serif font-bold text-brand-onyx px-1">{profile?.name}</div>)}</div>
                        <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest text-brand-sandstone pl-1">Neural Credential (Email)</label><div className="text-lg font-serif font-bold text-brand-slate px-1 opacity-60">{profile?.email}</div></div>
                    </div>
                    <div className="flex flex-col justify-end gap-4">{isEditingProfile ? (<div className="flex gap-4"><Button variant="primary" className="flex-1" onClick={handleUpdateName}>Synchronize</Button><Button variant="outline" onClick={() => setIsEditingProfile(false)}>Discard</Button></div>) : (<Button variant="outline" className="w-fit px-10" onClick={() => setIsEditingProfile(true)}>Edit Credentials</Button>)}</div>
                </div>
            </div>
          </FadeIn>
        )}

        {activeTab === 'identity' && (
          <FadeIn key="identity-tab" className="space-y-16">
            <div className="bg-brand-onyx p-12 lg:p-20 rounded-[4rem] shadow-luxury text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-champagne/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-brand-champagne/10 border border-brand-champagne/20 text-brand-champagne text-[10px] font-bold uppercase tracking-[0.4em]"><Sparkles className="w-4 h-4" /> Biometric Spectral DNA</div>
                            <h3 className="text-6xl font-serif font-bold leading-tight">Neural Color <br /> <span className="italic text-brand-sandstone">Registry.</span></h3>
                            <p className="text-brand-slate text-xl leading-relaxed font-serif italic max-w-xl">"Elevate your visual presence by aligning your wardrobe with your biological undertones."</p>
                        </div>
                        {!colorAnalysis ? (<div className="space-y-10"><button onClick={() => colorInputRef.current?.click()} className="bg-brand-champagne text-brand-onyx px-14 py-7 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-4 hover:bg-white transition-all shadow-2xl group"><Scan className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Start Chromatic Scan</button><div className="flex items-start gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/10"><Info className="w-6 h-6 text-brand-sandstone shrink-0 mt-1" /><p className="text-sm text-brand-slate italic leading-relaxed font-serif">For high-fidelity calibration, provide a selfie in natural daylight without artificial enhancements.</p></div></div>) : (
                          <div className="space-y-12 animate-fade-in-up">
                                <div className="space-y-8"><div className="flex items-end justify-between border-b border-white/10 pb-4"><p className="text-[10px] font-bold text-brand-sandstone uppercase tracking-[0.4em]">Identified Palette</p><span className="text-3xl font-serif italic text-white">{colorAnalysis.season}</span></div><div className="grid grid-cols-4 sm:grid-cols-8 gap-4">{(colorAnalysis?.colors || []).map((c, i) => (<div key={i} className="group relative"><div className="w-full aspect-[3/4] rounded-2xl shadow-2xl border border-white/10 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-3 cursor-pointer overflow-hidden" style={{ backgroundColor: c }} onClick={() => { navigator.clipboard.writeText(c); alert(`HEX ${c} logged to clipboard.`); }}><div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Copy className="w-5 h-5 text-white" /></div></div><span className="absolute -bottom-6 inset-x-0 text-[9px] font-bold uppercase tracking-widest text-brand-slate text-center opacity-0 group-hover:opacity-100 transition-opacity">{c}</span></div>))}</div></div>
                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 space-y-4"><h4 className="text-[11px] font-bold text-brand-champagne uppercase tracking-[0.5em]">Stylist Directive</h4><p className="text-brand-slate text-xl italic font-serif leading-relaxed">"{colorAnalysis.advice}"</p></div>
                                <button onClick={() => {setColorAnalysis(null); setAnalysisPhoto(null);}} className="text-[10px] font-bold uppercase tracking-widest text-brand-champagne hover:text-white transition-colors flex items-center gap-3"><RefreshCw className="w-5 h-5" /> Recalibrate Identity</button>
                          </div>
                        )}
                        <input type="file" ref={colorInputRef} className="hidden" accept="image/*" onChange={handleColorAnalysis} />
                    </div>
                    <div className="w-full lg:w-96 shrink-0">{analysisPhoto ? (<div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden border-4 border-white/10 shadow-2xl group"><img src={analysisPhoto} className="w-full h-full object-cover" alt="Scan Subject" /><div className="absolute inset-0 bg-brand-onyx/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Scan className="w-12 h-12 text-brand-champagne animate-pulse" /><p className="text-[11px] font-bold uppercase tracking-[0.4em] mt-6">Analyzing Pigment</p></div></div>) : (<div className="aspect-[3/4] bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-16 text-center relative overflow-hidden group"><Palette className="w-16 h-16 text-brand-sandstone mb-10 opacity-20 group-hover:scale-110 transition-all duration-1000" /><p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-slate leading-relaxed">Identity Scanner Ready</p><p className="mt-4 text-[9px] text-brand-slate/40 italic">Awaiting Chromatic Input</p></div>)}</div>
                </div>
            </div>
            <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-brand-sandstone/10 shadow-luxury"><div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-16"><div className="flex items-center gap-6 text-center sm:text-left"><div className="w-16 h-16 bg-brand-ivory rounded-3xl flex items-center justify-center text-brand-onyx shadow-inner"><Ruler className="w-8 h-8" /></div><div><h3 className="text-4xl font-serif font-bold text-brand-onyx leading-none">Silhouette Data</h3><p className="text-[11px] font-bold text-brand-sandstone uppercase tracking-[0.5em] mt-3">Biometric Calibration</p></div></div>{!isEditingMeasurements ? (<Button variant="outline" className="py-4 px-12 rounded-2xl text-[10px]" onClick={() => setIsEditingMeasurements(true)}>Update Dimensions</Button>) : (<div className="flex gap-4"><Button variant="primary" className="py-4 px-12 rounded-2xl text-[10px]" onClick={handleUpdateMeasurements}>Synchronize</Button><Button variant="outline" className="py-4 px-12 rounded-2xl text-[10px]" onClick={() => setIsEditingMeasurements(false)}>Cancel</Button></div>)}</div><div className="grid grid-cols-2 lg:grid-cols-4 gap-8">{Object.entries(editMeasurements || {}).map(([key, val]) => (<div key={key} className="bg-brand-ivory p-10 rounded-[3rem] border border-brand-sandstone/10 flex flex-col gap-3 hover:border-brand-onyx transition-all group shadow-sm"><span className="text-[11px] text-brand-sandstone font-bold uppercase tracking-[0.3em] group-hover:text-brand-onyx transition-colors">{key}</span>{isEditingMeasurements ? (<input type="text" value={val} onChange={e => setEditMeasurements({...editMeasurements, [key]: e.target.value})} className="bg-white border border-brand-sandstone/20 rounded-xl text-2xl font-serif font-bold text-brand-onyx outline-none focus:border-brand-onyx w-full py-3 px-4 shadow-inner" />) : (<span className="text-4xl font-serif font-bold text-brand-onyx">{val}</span>)}</div>))}</div></div>
          </FadeIn>
        )}

        {activeTab === 'calendar' && (
          <FadeIn key="calendar-tab">
            <div className="bg-white p-12 lg:p-20 rounded-[5rem] border border-brand-sandstone/10 shadow-luxury overflow-hidden">
                {renderCalendarMonth()}
            </div>
          </FadeIn>
        )}
      </div>

      {/* TASK MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[250] bg-brand-onyx/80 backdrop-blur-md flex items-center justify-center p-6">
          <FadeIn className="w-full max-w-xl bg-white rounded-[4rem] p-12 lg:p-16 shadow-2xl relative">
            <button onClick={() => { setIsEventModalOpen(false); setEventForm({ type: 'task' }); }} className="absolute top-10 right-10 p-2 text-brand-sandstone hover:text-brand-onyx transition-all"><X className="w-8 h-8" /></button>
            <div className="space-y-10">
              <div className="space-y-3">
                <h3 className="text-4xl font-serif font-bold text-brand-onyx">{eventForm.id ? 'Refine Entry' : 'New Engagement'}</h3>
                <p className="text-[11px] font-bold text-brand-sandstone uppercase tracking-[0.4em]">Neural Itinerary Interface</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brand-onyx uppercase tracking-[0.3em] ml-1">Event Directive *</label>
                  <input 
                    type="text" 
                    required
                    value={eventForm.title || ''} 
                    onChange={e => setEventForm({...eventForm, title: e.target.value})}
                    placeholder="E.g. Paris Editorial Launch"
                    className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-[1.5rem] py-5 px-8 text-base font-bold text-brand-onyx outline-none focus:border-brand-onyx shadow-inner transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brand-onyx uppercase tracking-[0.3em] ml-1">Target Date</label>
                    <input 
                      type="date" 
                      value={eventForm.date || ''} 
                      onChange={e => setEventForm({...eventForm, date: e.target.value})}
                      className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-[1.5rem] py-5 px-8 text-sm font-bold text-brand-onyx outline-none focus:border-brand-onyx shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-brand-onyx uppercase tracking-[0.3em] ml-1">Target Time</label>
                    <input 
                      type="time" 
                      value={eventForm.time || ''} 
                      onChange={e => setEventForm({...eventForm, time: e.target.value})}
                      className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-[1.5rem] py-5 px-8 text-sm font-bold text-brand-onyx outline-none focus:border-brand-onyx shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-brand-onyx uppercase tracking-[0.3em] ml-1">Classification Type</label>
                   <div className="flex gap-3">
                      {(['event', 'task', 'routine'] as const).map(t => (
                        <button 
                          key={t} 
                          onClick={() => setEventForm({...eventForm, type: t})}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] border-2 transition-all ${eventForm.type === t ? 'bg-brand-onyx text-brand-champagne border-brand-onyx shadow-xl' : 'bg-white text-brand-onyx border-brand-sandstone/10 hover:border-brand-onyx'}`}
                        >
                          {t}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brand-onyx uppercase tracking-[0.3em] ml-1">Contextual Brief (Optional)</label>
                  <textarea 
                    value={eventForm.notes || ''} 
                    onChange={e => setEventForm({...eventForm, notes: e.target.value})}
                    placeholder="Dress code, accessory requirements, venue context..."
                    className="w-full bg-brand-ivory border border-brand-sandstone/20 rounded-[2rem] py-6 px-8 text-base italic font-serif text-brand-onyx outline-none focus:border-brand-onyx min-h-[120px] resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button variant="primary" className="flex-1 py-7 rounded-[2.5rem] text-sm shadow-xl" onClick={handleSaveEvent} disabled={!eventForm.title || !eventForm.date}>Establish Directive</Button>
                <button onClick={() => { setIsEventModalOpen(false); setEventForm({ type: 'task' }); }} className="px-10 py-7 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-sandstone hover:text-brand-onyx">Dismiss</button>
              </div>
            </div>
          </FadeIn>
        </div>
      )}

      {showQuiz && (
        <div className="fixed inset-0 z-[200] bg-brand-ivory flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-[5rem] shadow-luxury p-12 md:p-24 relative overflow-hidden">
            <button onClick={() => setShowQuiz(false)} className="absolute top-12 right-12 p-3 text-brand-sandstone hover:text-brand-onyx transition-all"><X className="w-10 h-10" /></button>
            
            {quizStep === 0 && (
              <FadeIn className="text-center space-y-12">
                <div className="w-28 h-28 bg-brand-onyx rounded-[3rem] flex items-center justify-center mx-auto text-brand-champagne shadow-2xl relative">
                  <Sparkles className="w-12 h-12" />
                  <Heart className="absolute -top-4 -right-4 w-10 h-10 text-brand-champagne fill-current shadow-luxury" />
                </div>
                <div className="space-y-6">
                  <h2 className="text-6xl font-serif font-bold text-brand-onyx leading-tight">Neural Style <br /> <span className="italic text-brand-sandstone">Discovery.</span></h2>
                  <p className="text-xl text-brand-slate font-serif italic leading-relaxed max-w-xl mx-auto">"Allow our design algorithms to align with your personal aesthetic frequency."</p>
                </div>
                <Button onClick={() => setQuizStep(1)} variant="primary" className="w-full py-8 rounded-[3rem] text-sm font-bold tracking-[0.4em] shadow-2xl shadow-brand-onyx/20">Initialize Calibration</Button>
              </FadeIn>
            )}

            {quizStep >= 1 && quizStep <= 8 && (
              <FadeIn key={quizStep} className="space-y-16">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-brand-sandstone">Neural Step {quizStep} / 8</span>
                  <div className="w-48 h-2 bg-brand-ivory rounded-full overflow-hidden border border-brand-sandstone/10 shadow-inner">
                    <div className="h-full bg-brand-onyx transition-all duration-700 ease-out" style={{ width: `${(quizStep / 8) * 100}%` }}></div>
                  </div>
                </div>
                <h3 className="text-5xl font-serif font-bold text-brand-onyx leading-[1.1]">{QUIZ_QUESTIONS[quizStep - 1].q}</h3>
                <div className="grid gap-6">
                  {QUIZ_QUESTIONS[quizStep - 1].options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleQuizAnswer(opt.type)}
                      className="w-full p-10 rounded-[3rem] border-2 border-brand-sandstone/10 bg-brand-ivory/30 text-left hover:border-brand-onyx hover:bg-brand-onyx hover:text-white transition-all group flex items-center justify-between shadow-sm hover:shadow-xl"
                    >
                      <span className="text-2xl font-serif italic text-brand-onyx group-hover:text-white transition-colors">{opt.text}</span>
                      <ChevronRight className="w-6 h-6 text-brand-sandstone group-hover:text-brand-champagne group-hover:translate-x-2 transition-all" />
                    </button>
                  ))}
                </div>
              </FadeIn>
            )}

            {quizStep === 9 && (
              <FadeIn className="text-center space-y-16">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.6em] text-brand-sandstone">Persona Identified</p>
                  <h2 className="text-7xl font-serif font-bold text-brand-onyx leading-tight">The <span className="italic text-brand-sandstone">{getWinner()}</span> Profile. ✨</h2>
                </div>
                
                <div className="bg-brand-ivory/50 p-12 rounded-[4rem] border border-brand-sandstone/20 text-left space-y-12 relative overflow-hidden shadow-inner">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-champagne/10 rounded-full blur-3xl"></div>
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-sandstone">Aesthetic Analysis</h4>
                      <p className="text-2xl font-serif italic text-brand-onyx leading-relaxed">"{STYLE_PROFILES[getWinner() as keyof typeof STYLE_PROFILES].desc}"</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-sandstone">Registry Essentials</h4>
                      <p className="text-base font-bold text-brand-onyx uppercase tracking-[0.3em] leading-relaxed">{STYLE_PROFILES[getWinner() as keyof typeof STYLE_PROFILES].items}</p>
                    </div>
                    <div className="flex gap-4">
                      {STYLE_PROFILES[getWinner() as keyof typeof STYLE_PROFILES].colors.map(c => (
                        <div key={c} className="w-14 h-14 rounded-2xl shadow-xl border border-white/50" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <Button variant="primary" className="flex-1 py-8 rounded-[2.5rem] text-sm font-bold tracking-[0.4em] shadow-luxury" onClick={saveQuizResult}>Commit Result</Button>
                  <Button variant="outline" className="flex-1 py-8 rounded-[2.5rem] text-sm font-bold tracking-[0.4em]" onClick={() => setQuizStep(1)}>Retry Calibration</Button>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      )}

      {isActionLoading && <LoadingOverlay message="Synchronizing Records..." />}
    </div>
  );
};
