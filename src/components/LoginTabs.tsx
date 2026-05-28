'use client';

import { useState } from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { SignIn } from 'components/SignIn';
import { SignUp } from 'components/SignUp';

interface LoginTabsProps {
  redirectRoute: string;
  fromPath: string;
}

type TabValue = 'signIn' | 'signUp';

export const LoginTabs = ({ redirectRoute, fromPath }: LoginTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('signIn');

  const isMangaTheme = fromPath.startsWith('/manga');
  const titleText = isMangaTheme ? 'Manga Login' : 'Login';

  return (
    <div className="flex flex-col items-center gap-y-6 w-full h-screen">
      <div className="mt-[5%] input-box flex max-w-[572px] flex-col gap-y-2 rounded bg-white shadow p-8">
        <h1 className="mb-4 overflow-visible text-2xl text-neutral-300 text-center">{titleText}</h1>
        <Tabs
          value={activeTab}
          onChange={(_event, value: TabValue) => setActiveTab(value)}
          variant="fullWidth"
          className="mb-4"
          sx={{
            '& .MuiTab-root': { color: 'var(--color-brand-700)' },
            '& .Mui-selected': { color: 'var(--color-brand-700)' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-brand-700)' }
          }}
        >
          <Tab label="Sign In" value="signIn" data-testid="signInTab" />
          <Tab label="Sign Up" value="signUp" data-testid="signUpTab" />
        </Tabs>
        {activeTab === 'signIn' ? (
          <SignIn redirectRoute={redirectRoute} />
        ) : (
          <SignUp redirectRoute={redirectRoute} />
        )}
      </div>
    </div>
  );
};
