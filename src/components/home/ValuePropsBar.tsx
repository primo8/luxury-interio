import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export const ValuePropsBar: React.FC = () => {
  const PROPS = [
    {
      icon: <Truck size={24} color="#d4af37" />,
      title: 'Free Delivery',
      subtitle: 'On all orders over $999',
    },
    {
      icon: <RotateCcw size={24} color="#d4af37" />,
      title: 'Easy Returns',
      subtitle: 'Within 30 Days',
    },
    {
      icon: <ShieldCheck size={24} color="#d4af37" />,
      title: 'Secure Payments',
      subtitle: '100% Secure Checkout',
    },
    {
      icon: <Headphones size={24} color="#d4af37" />,
      title: '24/7 Support',
      subtitle: "We're here to help",
    },
  ];

  return (
    <section style={{ padding: '20px 0 60px 0', backgroundColor: '#ffffff' }}>
      <div className="container">
        <div className="value-props-bar">
          {PROPS.map((prop, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '4px 8px',
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {prop.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                  {prop.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {prop.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
