"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, FileText, Users, Settings, BookOpen } from 'lucide-react';
import styles from './CommandPalette.module.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const actions = [
    { id: 'new', name: 'Start New Interview', icon: Plus, path: '/interview/new' },
    { id: 'interviews', name: 'View Interviews', icon: Users, path: '/history' },
    { id: 'reports', name: 'View Reports', icon: FileText, path: '/reports/1' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
    { id: 'resources', name: 'Resources', icon: BookOpen, path: '/resources' },
  ];

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          router.push(filteredActions[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, router, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} animate-fade-in`} onClick={handleOverlayClick}>
      <div className={`${styles.palette} animate-slide-up`} role="dialog" aria-modal="true" aria-label="Command Palette">
        <div className={styles.inputWrapper}>
          <Search className={styles.icon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-autocomplete="list"
            aria-expanded="true"
            role="combobox"
          />
        </div>
        <div className={styles.list} ref={listRef} role="listbox">
          {filteredActions.length > 0 ? (
            <div className={styles.group}>
              <div className={styles.groupTitle}>Actions</div>
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className={styles.item}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => {
                      router.push(action.path);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon className={styles.itemIcon} />
                    <span>{action.name}</span>
                    {index === 0 && !query && (
                      <div className={styles.shortcut}>
                        <kbd className={styles.key}>↵</kbd>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>No results found for "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
