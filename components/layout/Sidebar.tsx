"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Users, FileText, Settings, BookOpen, Menu, X, Command } from 'lucide-react';
import { CommandPalette } from '../../src/components/CommandPalette';
import styles from './Layout.module.css';

export function Sidebar({ children }: { children?: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItemsTop = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Interview', path: '/interview/new', icon: Plus },
    { name: 'Interviews', path: '/history', icon: Users },
    { name: 'Reports', path: '/reports/1', icon: FileText },
  ];

  const navItemsBottom = [
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavItems = (items: typeof navItemsTop) => (
    items.map(item => {
      const Icon = item.icon;
      const isActive = pathname === item.path;
      return (
        <Link
          key={item.path}
          href={item.path}
          className={`${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Icon className={styles.navIcon} />
          {item.name}
        </Link>
      );
    })
  );

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <div className={styles.sidebarTitle}>AI INTERVIEW</div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[5] md:hidden" 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 5 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>AI INTERVIEW</div>
        </div>

        <nav className={styles.navGroup}>
          {renderNavItems(navItemsTop)}
        </nav>

        <div className={styles.navDivider} />

        <nav className={styles.navGroup}>
          {renderNavItems(navItemsBottom)}
        </nav>

        <div className={styles.spacer} />

        <div 
          className={styles.navItem} 
          onClick={() => {
            setSidebarOpen(false);
            setCommandPaletteOpen(true);
          }}
        >
          <Command className={styles.navIcon} />
          <span>Search</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>⌘K</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </div>
  );
}
