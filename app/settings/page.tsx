import React from 'react';

export default function Settings() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ padding: 'var(--space-8)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 500, marginBottom: 'var(--space-2)' }}>Settings</h2>
        <p className="text-secondary" style={{ fontSize: '13px' }}>This module is currently under development.</p>
      </div>
    </div>
  );
}
