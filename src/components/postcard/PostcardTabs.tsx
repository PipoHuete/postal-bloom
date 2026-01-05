import React from 'react';
import { cn } from '@/lib/utils';

interface PostcardTabsProps {
  activeTab: 'anverso' | 'dorso';
  onTabChange: (tab: 'anverso' | 'dorso') => void;
}

const TABS = [
  { id: 'anverso' as const, label: 'ANVERSO' },
  { id: 'dorso' as const, label: 'DORSO' },
];

export function PostcardTabs({ activeTab, onTabChange }: PostcardTabsProps) {
  return (
    <div className="flex w-full border-2 border-foreground rounded-lg overflow-hidden">
      {TABS.map((tab, index) => (
        <React.Fragment key={tab.id}>
          {index > 0 && <div className="w-px bg-foreground" />}
          <button
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'postcard-tab flex-1 transition-all duration-300',
              activeTab === tab.id 
                ? 'postcard-tab-active' 
                : 'postcard-tab-inactive'
            )}
          >
            {tab.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
