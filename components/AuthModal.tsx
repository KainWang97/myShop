import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for admin
    const isAdmin = email === 'admin@komorebi.com';

    // Mock authentication
    const mockUser: User = {
      name: name || (isLogin ? (isAdmin ? 'Admin' : 'Hikaru Tanaka') : 'New Member'),
      email: email || 'user@example.com',
      orders: [],
      role: isAdmin ? 'ADMIN' : 'USER'
    };
    
    onLogin(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-washi w-full max-w-md p-12 shadow-xl animate-fade-in-up">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-stone-400 hover:text-sumi"
        >
          ✕
        </button>

        <h2 className="text-2xl font-serif text-center mb-8 text-sumi">
          {isLogin ? 'Sign In' : 'Membership'}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
           {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? "Try: admin@komorebi.com" : ""}
              className="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" 
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Password</label>
            <input type="password" className="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-stone-400 rounded-none" />
          </div>

          <button className="w-full bg-sumi text-washi py-3 uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-colors">
            {isLogin ? 'Enter' : 'Join'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-stone-500 border-b border-transparent hover:border-stone-500 transition-colors"
          >
            {isLogin ? "Create an account" : "Already a member?"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;