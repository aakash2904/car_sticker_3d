'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-medium"
      style={{
        background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        color: dark ? '#94a3b8' : '#64748b',
      }}
    >
      {dark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      {dark ? 'Dark' : 'Light'}

      {/* Pill toggle */}
      <div className="relative w-8 h-4 rounded-full transition-colors duration-300 flex items-center px-0.5"
        style={{ background: dark ? '#3b82f6' : '#cbd5e1' }}>
        <div className="w-3 h-3 rounded-full bg-white shadow transition-transform duration-300"
          style={{ transform: dark ? 'translateX(16px)' : 'translateX(0)' }} />
      </div>
    </button>
  );
}
