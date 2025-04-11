import React from 'react';
import Link from 'next/link';
import Card from './Card';

interface AdminCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon, link }) => {
  return (
    <Link href={link}>
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">{icon}</span>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
        <div className="flex justify-end mt-4">
          <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Accéder →
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default AdminCard; 