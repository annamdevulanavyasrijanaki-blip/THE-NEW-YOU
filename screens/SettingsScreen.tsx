
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Shield, Bell, Smartphone, HardDrive, 
  HelpCircle, FileText, LogOut, ChevronRight, Camera, 
  Trash2, Download, Check, X, AlertTriangle, Moon, 
  Globe, Ruler, Mail, Phone, Lock, Smartphone as DeviceIcon, RefreshCw
} from 'lucide-react';
import { auth } from '../services/firebase';
import { updateProfile, updateEmail, updatePassword, signOut, deleteUser } from 'firebase/auth';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/firestore';
import { Button, LoadingOverlay, FadeIn } from '../components/Components';
import { UserProfile, Screen, SavedLook } from '../types';
import { db, STORES } from '../services/db';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onClearSavedLooks: () => void;
  savedLooks: SavedLook[];
}

type SettingsSection = 'main' | 'profile' | 'security' | 'privacy' | 'notifications' | 'app' | 'data';

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onLogout, onClearSavedLooks, savedLooks }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Record<string, any>>({});

  // Edit states
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    fetchProfileAndPrefs();
  }, []);

  const fetchProfileAndPrefs = async () => {
    const user = auth.currentUser;
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        setEditName(p.name);
        setEditUsername(p.username || '');
        setEditEmail(p.email);
        setEditPhone(p.phone || '');
      }
    }
    
    // Load local preferences from IndexedDB
    try {
      const allPrefs = await db.getAll(STORES.SETTINGS);
      const prefMap: Record<string, any> = {};
      allPrefs.forEach(p => {
        prefMap[p.key] = p.value;
      });
      setLocalPrefs(prefMap);
    } catch(e) {}

    setIsLoading(false);
  };

  const handleUpdatePreference = async (key: string, value: any) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    try {
      await db.put(STORES.SETTINGS, { key, value });
    } catch (e) {
      console.error("Failed to update local preference", e);
    }
  };

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user || !profile) return;
    setIsActionLoading(true);
    try {
      if (editName !== user.displayName) await updateProfile(user, { displayName: editName });
      await updateUserProfile(user.uid, { name: editName, username: editUsername, phone: editPhone });
      setProfile({ ...profile, name: editName, username: editUsername, phone: editPhone });
      alert("Profile updated successfully.");
    } catch (e) {
      alert("Failed to update profile.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!editEmail.trim()) return;
    setIsActionLoading(true);
    try {
      await updateEmail(user, editEmail);
      await updateUserProfile(user.uid, { email: editEmail });
      alert("Email updated. You might need to re-login.");
    } catch (e: any) {
      alert(e.message || "Failed to update email.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    const user = auth.currentUser;
    if (!user || !newPass.trim()) return;
    setIsActionLoading(true);
    try {
      await updatePassword(user, newPass);
      setNewPass('');
      alert("Password updated successfully.");
    } catch (e: any) {
      alert(e.message || "Failed to update password.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const downloadMyData = () => {
    if (!profile) return;
    const data = {
        profile,
        localPrefs,
        savedLooks,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thenewyou_data_${profile.uid}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAppCache = async () => {
    await db.clear(STORES.SETTINGS);
    setLocalPrefs({});
    alert("Local settings purged from IndexedDB.");
  };

  const deleteAccountPermanently = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsActionLoading(true);
    try {
      await deleteUserProfile(user.uid);
      await deleteUser(user);
      onLogout();
    } catch (e: any) {
      alert("Account deletion failed. You may need to re-authenticate first.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <LoadingOverlay message="Fetching Studio Config..." />;

  const Toggle = ({ label, id }: { label: string, id: string }) => (
    <div className="flex items-center justify-between py-5 border-b border-brand-sandstone/10">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-onyx">{label}</span>
        <button 
            onClick={() => handleUpdatePreference(id, !localPrefs[id])}
            className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${localPrefs[id] ? 'bg-brand-onyx' : 'bg-brand-sandstone/20'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${localPrefs[id] ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
  );

  const SectionItem = ({ icon: Icon, title, desc, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between py-6 hover:bg-brand-ivory transition-all group px-4 -mx-4 rounded-2xl">
        <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-brand-ivory rounded-xl flex items-center justify-center text-brand-onyx group-hover:bg-brand-onyx group-hover:text-brand-champagne transition-all">
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-onyx">{title}</h4>
                {desc && <p className="text-[9px] text-brand-slate italic font-serif">{desc}</p>}
            </div>
        </div>
        <ChevronRight className="w-4 h-4 text-brand-sandstone group-hover:translate-x-1 transition-transform" />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 pb-40">
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => activeSection === 'main' ? onNavigate(Screen.ACCOUNT) : setActiveSection('main')}
          className="w-12 h-12 bg-white border border-brand-sandstone/10 rounded-2xl flex items-center justify-center text-brand-onyx hover:bg-brand-onyx hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-4xl font-serif font-bold text-brand-onyx uppercase tracking-tighter">
            {activeSection === 'main' ? 'Studio Settings' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </h1>
      </div>

      <FadeIn key={activeSection} className="bg-white rounded-[3.5rem] border border-brand-sandstone/10 shadow-luxury overflow-hidden">
        <div className="p-10 lg:p-16">
          {activeSection === 'main' && (
            <div className="space-y-2">
              <SectionItem icon={User} title="Profile Settings" desc="Identity, biometrics, and contact information." onClick={() => setActiveSection('profile')} />
              <SectionItem icon={Shield} title="Security Protocol" desc="Passwords, sessions, and verification." onClick={() => setActiveSection('security')} />
              <SectionItem icon={Lock} title="Privacy Control" desc="Manage your silhouette visibility." onClick={() => setActiveSection('privacy')} />
              <SectionItem icon={Bell} title="Notification Dispatch" desc="Email and style alert configurations." onClick={() => setActiveSection('notifications')} />
              <SectionItem icon={Smartphone} title="App Preferences" desc="Visual mode, language, and units." onClick={() => setActiveSection('app')} />
              <SectionItem icon={HardDrive} title="Data & Account" desc="Export data or terminate account." onClick={() => setActiveSection('data')} />
              
              <div className="h-px bg-brand-sandstone/10 my-10" />

              <SectionItem icon={HelpCircle} title="FAQ Hub" onClick={() => onNavigate(Screen.FAQ)} />
              <SectionItem icon={Mail} title="Contact Support" onClick={() => onNavigate(Screen.CONTACT)} />
              <SectionItem icon={Shield} title="Privacy Policy" onClick={() => onNavigate(Screen.PRIVACY)} />
              <SectionItem icon={FileText} title="Terms of Atelier" onClick={() => onNavigate(Screen.BRAND_GUIDE)} />

              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-6 py-6 text-red-500 hover:bg-red-50 transition-all group px-4 -mx-4 rounded-2xl mt-8"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <LogOut className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out from Studio</span>
              </button>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Full Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-brand-ivory border border-brand-sandstone/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-onyx" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Username</label>
                    <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="@username" className="w-full bg-brand-ivory border border-brand-sandstone/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-onyx" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Phone Number</label>
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+1 (000) 000-0000" className="w-full bg-brand-ivory border border-brand-sandstone/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-onyx" />
                </div>
                <Button variant="primary" className="w-full py-5" onClick={handleProfileUpdate}>Commit Profile Changes</Button>
              </div>

              <div className="h-px bg-brand-sandstone/10" />

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Authentication Methods</h3>
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">Registered Email</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-brand-ivory border border-brand-sandstone/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-onyx" />
                </div>
                <Button variant="outline" className="w-full py-5" onClick={handleEmailUpdate}>Update Account Email</Button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Access Protocol</h3>
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-sandstone">New Neural Key (Password)</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 8 characters" className="w-full bg-brand-ivory border border-brand-sandstone/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-brand-onyx" />
                </div>
                <Button variant="primary" className="w-full py-5" onClick={handlePasswordUpdate}>Update Password</Button>
              </div>

              <div className="h-px bg-brand-sandstone/10" />

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Verification Layers</h3>
                <Toggle label="Two-Step Verification" id="two_step" />
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Active Sessions</h3>
                <div className="p-6 bg-brand-ivory rounded-3xl border border-brand-sandstone/10 space-y-4">
                    <div className="flex items-center gap-4">
                        <DeviceIcon className="w-5 h-5 text-brand-onyx" />
                        <div className="text-[10px] font-bold uppercase tracking-widest">iPhone 15 Pro • Current Session</div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <Toggle label="Private Silhouette Profile" id="is_private" />
              <Toggle label="Personalized Neural Recommendations" id="personalized_recs" />
              <Toggle label="Anonymous Usage Analytics" id="allow_analytics" />
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <Toggle label="Push Neural Notifications" id="notify_push" />
              <Toggle label="Style Dispatch Emails" id="notify_email" />
              <Toggle label="New Silhouette Suggestions" id="notify_styles" />
              <Toggle label="Security Archive Alerts" id="notify_security" />
            </div>
          )}

          {activeSection === 'app' && (
            <div className="space-y-12">
              <Toggle label="Visual Dark Mode" id="dark_mode" />
              
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Studio Language</h3>
                <div className="flex gap-2">
                    {['English', 'Hindi', 'Telugu'].map(lang => (
                        <button 
                            key={lang} 
                            onClick={() => handleUpdatePreference('language', lang)}
                            className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${localPrefs['language'] === lang ? 'bg-brand-onyx text-brand-champagne border-brand-onyx' : 'bg-white text-brand-onyx border-brand-sandstone/20 hover:border-brand-onyx'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-onyx">Measurement Protocol</h3>
                <div className="flex gap-2">
                    {['cm', 'inches'].map(unit => (
                        <button 
                            key={unit} 
                            onClick={() => handleUpdatePreference('units', unit)}
                            className={`flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${localPrefs['units'] === unit ? 'bg-brand-onyx text-brand-champagne border-brand-onyx' : 'bg-white text-brand-onyx border-brand-sandstone/20 hover:border-brand-onyx'}`}
                        >
                            {unit}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-10">
              <div className="space-y-4">
                <button onClick={downloadMyData} className="w-full flex items-center justify-between p-6 bg-brand-ivory rounded-2xl border border-brand-sandstone/10 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-6">
                        <Download className="w-5 h-5 text-brand-onyx" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Export Neural Archive (My Data)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:translate-x-1" />
                </button>
                <button onClick={clearAppCache} className="w-full flex items-center justify-between p-6 bg-brand-ivory rounded-2xl border border-brand-sandstone/10 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-6">
                        <RefreshCw className="w-5 h-5 text-brand-onyx" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Purge Local Configuration Archive</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:translate-x-1" />
                </button>
                <button onClick={onClearSavedLooks} className="w-full flex items-center justify-between p-6 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-6">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Erase Digital Closet (Saved Looks)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-20 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="pt-12 border-t border-brand-sandstone/10">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-[0.2em] mb-4">Critical Zone</h4>
                <p className="text-[10px] text-brand-slate italic font-serif leading-relaxed mb-8">Permanently terminating your membership will discard all biometrics and archival data.</p>
                <Button variant="danger" className="w-full py-5" onClick={() => setShowDeleteModal(true)}>Terminate digital account</Button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-onyx/80 backdrop-blur-xl">
          <FadeIn className="bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-2xl text-center space-y-12">
            <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="space-y-4">
                <h3 className="text-4xl font-serif font-bold text-brand-onyx leading-tight">Irreversible.</h3>
                <p className="text-brand-slate font-serif italic text-lg leading-relaxed">Are you sure you want to permanently delete your account? This action cannot be undone and all data will be lost from both studio servers and your biometric profile.</p>
            </div>
            <div className="flex flex-col gap-4">
                <Button variant="danger" className="w-full py-5 rounded-2xl" onClick={deleteAccountPermanently}>Confirm Termination</Button>
                <button onClick={() => setShowDeleteModal(false)} className="py-4 text-[10px] font-bold uppercase tracking-widest text-brand-sandstone hover:text-brand-onyx">Cancel and Retain Profile</button>
            </div>
          </FadeIn>
        </div>
      )}

      {isActionLoading && <LoadingOverlay message="Synchronizing Archives..." />}
    </div>
  );
};
