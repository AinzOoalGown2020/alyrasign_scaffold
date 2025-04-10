import { FC } from 'react';
import Link from 'next/link';

export const Footer: FC = () => {
    return (
        <div className="flex-none p-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center md:justify-start">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} AlyraSign. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};
