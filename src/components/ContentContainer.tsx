import { FC } from 'react';
import Link from "next/link";
import Text from './Text';
import NavElement from './nav-element';
interface Props {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-grow w-full">
        {children}
      </main>
    </div>
  );
};
