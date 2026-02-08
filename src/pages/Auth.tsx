import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const { registerUser, googleLogin, currentUser, users } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // If already logged in, redirect home
  if (currentUser) {
    navigate('/');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (!email || !password) return alert("Please fill all fields");
      // Special admin shortcut
      if (email === 'admin' && password === 'admin') {
        useAppStore.getState().login('admin_1');
        navigate('/');
        return;
      }
      
      const foundUser = Object.values(users).find(u => u.username === email);
      if (foundUser) {
        useAppStore.getState().login(foundUser.id);
        navigate('/');
      } else {
        alert("Invalid email or password. Please Sign up if you don't have an account.");
      }
    } else {
      if (!name || !email || !password) return alert("Please fill all fields");
      const exists = Object.values(users).find(u => u.username === email);
      if (exists) {
         return alert("Email already exists. Please log in.");
      }
      registerUser(name, email, password);
      navigate('/');
    }
  };

  const handleGoogle = () => {
    googleLogin();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[30px] shadow-2xl overflow-hidden relative z-10 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 sm:p-10 text-center">
          <div className="w-12 h-12 bg-red-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4">
            I
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome to Interest
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Find new ideas to try</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="text-left">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 pl-2">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}
            
            <div className="text-left">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 pl-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="text-left mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 pl-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-100 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all border border-slate-200 dark:border-slate-700"
              />
            </div>

            <button type="submit" className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-md transition-all active:scale-95">
              {isLogin ? "Log in" : "Sign up"}
            </button>
            
            <div className="flex items-center gap-2 my-2 opacity-50">
               <hr className="flex-1 border-slate-300 dark:border-slate-600" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OR</span>
               <hr className="flex-1 border-slate-300 dark:border-slate-600" />
            </div>

            {/* Google Authentication Simulation */}
            <button 
              type="button" 
              onClick={handleGoogle}
              className="w-full py-3.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-full font-bold text-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Continue with Google
            </button>
            
          </form>

          <p className="text-slate-500 dark:text-slate-400 mt-8 text-sm">
            {isLogin ? "Not on Interest yet?" : "Already a member?"} 
            <Link to={isLogin ? "/signup" : "/login"} className="text-red-600 font-bold ml-1 hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>

          {/* Quick Adsterra Info for user */}
          <div className="mt-8 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4">
            By continuing, you agree to Interest's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};