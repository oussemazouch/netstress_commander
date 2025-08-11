import React from 'react';

const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-slate-900" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
      </div>

      {/* Floating security icons */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Security icon elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-3 h-3 bg-success/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-warning/20 rounded-full animate-pulse delay-2000" />
        <div className="absolute bottom-20 right-10 w-4 h-4 bg-primary/20 rounded-full animate-pulse delay-3000" />
        
        {/* Larger floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-success/5 rounded-full blur-xl animate-pulse delay-1500" />
      </div>

      {/* Subtle scan lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-2"
          style={{
            animation: 'scan-line 8s linear infinite'
          }}
        />
      </div>

      {/* Corner security badges */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 opacity-30">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground font-mono">SECURE</span>
      </div>
      
      <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-30">
        <span className="text-xs text-muted-foreground font-mono">ENCRYPTED</span>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-1000" />
      </div>

      <div className="absolute bottom-4 left-4 flex items-center space-x-2 opacity-30">
        <div className="w-2 h-2 bg-warning rounded-full animate-pulse delay-2000" />
        <span className="text-xs text-muted-foreground font-mono">MONITORED</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-30">
        <span className="text-xs text-muted-foreground font-mono">AUDITED</span>
        <div className="w-2 h-2 bg-success rounded-full animate-pulse delay-3000" />
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundPattern;