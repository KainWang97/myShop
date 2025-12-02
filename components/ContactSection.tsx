import React, { useState } from 'react';

interface ContactSectionProps {
  onSubmit?: (name: string, email: string, message: string) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(name, email, message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <section className="py-24 bg-stone-100 border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-serif text-sumi mb-12">Inquiries</h2>
        
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6 text-left">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors rounded-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Message</label>
            <textarea 
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-2 focus:outline-none focus:border-sumi transition-colors resize-none rounded-none"
            ></textarea>
          </div>
          
          <div className="text-center pt-8">
            <button 
              disabled={submitted}
              className={`px-12 py-3 border border-sumi text-sumi uppercase text-xs tracking-[0.2em] transition-all ${
                submitted ? 'bg-stone-800 text-washi border-stone-800' : 'hover:bg-sumi hover:text-washi'
              }`}
            >
              {submitted ? 'Sent' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;