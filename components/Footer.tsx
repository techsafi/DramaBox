
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-12 px-4 border-t border-zinc-900 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-extrabold tracking-tighter text-red-600 uppercase">
              Drama<span className="text-white">box</span>
            </span>
            <p className="text-zinc-500 text-sm max-w-xs">
              Experience the best dramas and movies worldwide. Streaming high-quality content anytime, anywhere.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm text-zinc-500">
            <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold mb-2">Platform</h4>
              <button className="text-left hover:text-white transition-colors">Browse</button>
              <button className="text-left hover:text-white transition-colors">Subscriptions</button>
              <button className="text-left hover:text-white transition-colors">FAQ</button>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold mb-2">Legal</h4>
              <button className="text-left hover:text-white transition-colors">Terms of Use</button>
              <button className="text-left hover:text-white transition-colors">Privacy Policy</button>
              <button className="text-left hover:text-white transition-colors">Cookies</button>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-white font-bold mb-2">Connect</h4>
              <button className="text-left hover:text-white transition-colors">Twitter</button>
              <button className="text-left hover:text-white transition-colors">Instagram</button>
              <button className="text-left hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © 2024 Dramabox Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="w-5 h-5 bg-zinc-800 rounded-full"></div>
            <div className="w-5 h-5 bg-zinc-800 rounded-full"></div>
            <div className="w-5 h-5 bg-zinc-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
