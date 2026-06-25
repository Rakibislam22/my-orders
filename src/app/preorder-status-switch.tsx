'use client';

import { useTransition } from 'react';
import { togglePreorderStatus } from './preorder';
import { cn } from './utils';

type PreorderStatusSwitchProps = {
  id: string;
  status: boolean;
};

export function PreorderStatusSwitch({ id, status }: PreorderStatusSwitchProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      togglePreorderStatus(id, status);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50',
        status ? 'bg-gray-800' : 'bg-gray-200'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          status ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}