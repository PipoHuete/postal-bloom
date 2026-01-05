import React from 'react';
import { cn } from '@/lib/utils';

interface PostcardTabsProps {
  activeTab: 'anverso' | 'dorso';
  onTabChange: (tab: 'anverso' | 'dorso') => void;
}

export function PostcardTabs({ activeTab, onTabChange }: PostcardTabsProps) {
  return (
    <div className="flex w-full border-2 border-foreground rounded-lg overflow-hidden">
      <button
        onClick={() => onTabChange('anverso')}
        className={cn(
          'postcard-tab flex-1 transition-all duration-300',
          activeTab === 'anverso' 
            ? 'postcard-tab-active' 
            : 'postcard-tab-inactive'
        )}
      >
        ANVERSO
      </button>
      <div className="w-px bg-foreground" />
      <button
        onClick={() => onTabChange('dorso')}
        className={cn(
          'postcard-tab flex-1 transition-all duration-300',
          activeTab === 'dorso' 
            ? 'postcard-tab-active' 
            : 'postcard-tab-inactive'
        )}
      >
        DORSO
      </button>
    </div>
  );
}
