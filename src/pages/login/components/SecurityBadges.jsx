import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const certifications = [
    {
      id: 1,
      name: 'SOC 2 Type II',
      description: 'Security, Availability & Confidentiality',
      icon: 'Shield',
      verified: true
    },
    {
      id: 2,
      name: 'ISO 27001',
      description: 'Information Security Management',
      icon: 'Award',
      verified: true
    },
    {
      id: 3,
      name: 'GDPR Compliant',
      description: 'Data Protection Regulation',
      icon: 'Lock',
      verified: true
    },
    {
      id: 4,
      name: 'SSL/TLS Encrypted',
      description: 'End-to-End Encryption',
      icon: 'Key',
      verified: true
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Enterprise Security Standards</h3>
        <p className="text-sm text-muted-foreground">
          Your data is protected by industry-leading security certifications
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {certifications?.map((cert) => (
          <div
            key={cert?.id}
            className="bg-card/50 border border-border/50 rounded-lg p-4 text-center hover:bg-card/70 transition-smooth"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <Icon name={cert?.icon} size={20} className="text-success" />
              </div>
              {cert?.verified && (
                <div className="ml-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                </div>
              )}
            </div>
            
            <h4 className="text-sm font-medium text-foreground mb-1">{cert?.name}</h4>
            <p className="text-xs text-muted-foreground">{cert?.description}</p>
            
            {cert?.verified && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/20 text-success">
                  <Icon name="Check" size={12} className="mr-1" />
                  Verified
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Additional Security Information */}
      <div className="mt-8 bg-muted/30 border border-border/50 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Info" size={16} className="text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Security Commitment</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              NetStress Commander employs bank-grade security measures including multi-factor authentication, 
              encrypted data transmission, regular security audits, and compliance with international security 
              standards. All penetration testing activities are conducted within authorized environments only.
            </p>
          </div>
        </div>
      </div>
      {/* Trust Indicators */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={12} />
          <span>10,000+ Security Professionals</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Globe" size={12} />
          <span>50+ Countries</span>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name="Clock" size={12} />
          <span>99.9% Uptime</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;