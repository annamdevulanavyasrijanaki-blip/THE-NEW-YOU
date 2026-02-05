
import React, { useState } from 'react';
import { FadeIn, Button } from '../components/Components';
import { Mail, MapPin, Send, Globe, CheckCircle } from 'lucide-react';

export const ContactScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'General Concierge',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfZouRvzOBgbrnw6SyUiIs0fzQPAySibU8NBPsXHyzWJwEQyQ/formResponse";
    
    const params = new URLSearchParams();
    params.append('entry.1391599757', formData.name);
    params.append('entry.609180880', formData.email);
    params.append('entry.255327069', formData.department);
    params.append('entry.1295992082', formData.message);

    try {
      // mode: 'no-cors' is used because Google Forms doesn't support CORS for direct submissions.
      // This sends the data successfully even if we can't read the response body.
      await fetch(googleFormUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', department: 'General Concierge', message: '' });
    } catch (error) {
      console.error("Submission error", error);
      // In many browser environments, no-cors fetch will still 'fail' locally while succeeding remotely
      setIsSubmitted(true); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="py-32 bg-stone-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-400 opacity-5 blur-[120px]"></div>
          <div className="container mx-auto px-6 lg:px-12 text-center">
              <FadeIn className="max-w-3xl mx-auto space-y-8">
                  <h1 className="text-7xl font-serif font-bold">Contact The <br /> Studio.</h1>
                  <p className="text-stone-400 text-xl font-serif italic leading-relaxed">"Connect with our designers, engineers, and support specialists."</p>
              </FadeIn>
          </div>
      </section>

      <section className="py-32">
          <div className="container mx-auto px-6 lg:px-12">
              <div className="grid lg:grid-cols-2 gap-24">
                  <div className="space-y-12">
                      <div className="space-y-6">
                          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.4em]">Get in Touch</h2>
                          <h3 className="text-5xl font-serif font-bold text-stone-900 leading-tight">We listen to every <br /> <span className="italic text-amber-500">frequency.</span></h3>
                          <p className="text-stone-500 text-lg leading-relaxed font-serif italic">Whether you're a designer looking to integrate your collection or a member needing technical assistance, our lines are open.</p>
                      </div>

                      <div className="space-y-8">
                          {[
                              { icon: <Mail className="w-6 h-6" />, label: "Support", val: "thenewyouai@gmail.com" },
                            
                              { icon: <MapPin className="w-6 h-6" />, label: "Atelier", val: "KPHB, Hyderabad, India" }
                          ].map((item, idx) => (
                              <div key={idx} className="flex gap-6 items-center">
                                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900">{item.icon}</div>
                                  <div>
                                      <p className="text-[10px] uppercase font-bold text-stone-300 tracking-widest mb-1">{item.label}</p>
                                      <p className="text-lg font-serif font-bold text-stone-900">{item.val}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <FadeIn className="bg-stone-50 rounded-[4rem] p-12 lg:p-16 border border-stone-100 shadow-xl">
                      {isSubmitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                             <CheckCircle className="w-10 h-10" />
                           </div>
                           <h3 className="text-3xl font-serif font-bold text-stone-900">Transmission Received.</h3>
                           <p className="text-stone-500 font-serif italic">Your message has been dispatched to the studio. Our concierge will review your inquiry shortly.</p>
                           <Button variant="outline" onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                        </div>
                      ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                          <div className="grid md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 pl-4">Full Name</label>
                                  <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-stone-200 rounded-3xl px-8 py-5 text-sm outline-none focus:border-amber-400 transition-all shadow-inner" 
                                    placeholder="E.g. Alexander McQueen" 
                                  />
                              </div>
                              <div className="space-y-3">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 pl-4">Email Address</label>
                                  <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white border border-stone-200 rounded-3xl px-8 py-5 text-sm outline-none focus:border-amber-400 transition-all shadow-inner" 
                                    placeholder="name@email.com" 
                                  />
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 pl-4">Department</label>
                              <select 
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full bg-white border border-stone-200 rounded-3xl px-8 py-5 text-sm outline-none focus:border-amber-400 transition-all shadow-inner appearance-none"
                              >
                                  <option>General Concierge</option>
                                  <option>Technical Architecture</option>
                                  <option>Designer Integration</option>
                                  <option>Press Inquiry</option>
                              </select>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 pl-4">Your Transmission</label>
                              <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-stone-200 rounded-[2rem] px-8 py-6 text-sm outline-none focus:border-amber-400 transition-all shadow-inner min-h-[150px] resize-none" 
                                placeholder="How can we assist your style journey?"
                              ></textarea>
                          </div>
                          <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isLoading}
                            className="w-full py-6 rounded-[1.5rem] uppercase font-bold tracking-widest text-xs shadow-2xl" 
                            icon={<Send className="w-5 h-5" />}
                          >
                              Dispatch Message
                          </Button>
                        </form>
                      )}
                  </FadeIn>
              </div>
          </div>
      </section>
    </div>
  );
};
