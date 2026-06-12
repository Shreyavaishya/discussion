import React, { useState } from 'react';
import { apiRequest } from '../utils/api';

interface AuthProps {
  onAuthSuccess: (user: any, token: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // Call backend Login API
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        onAuthSuccess(data.user, data.token);
      } else {
        // Call backend Signup API
        await apiRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });
        alert('Registration successful! Please log in with your credentials.');
        setIsLogin(true); // Switch to login screen automatically
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
  {isLogin ? 'Login to Forum' : 'Create an Account'}
</h2>
      
      {error && (
        <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded border border-red-200">
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:outline-none" 
              placeholder="shreya_v"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:outline-none" 
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:outline-none" 
            placeholder="••••••••"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded-md font-semibold hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          {isLogin ? 'Sign In' : 'Register Account'}
        </button>
      </form>
      
      <p className="text-sm text-center mt-4 text-gray-600">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
        >
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
};