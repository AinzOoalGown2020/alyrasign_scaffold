import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../../components/Layout';
import AdminCard from '../../components/AdminCard';
import Card from '../../components/Card';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est administrateur
    const checkAdmin = async () => {
      if (connected && publicKey) {
        // Dans un environnement de test, nous vérifions simplement si l'adresse correspond à l'admin configuré
        const adminAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET || '';
        const isAdmin = publicKey.toString() === adminAddress;
        setIsAdmin(isAdmin);
        setIsLoading(false);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [connected, publicKey]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administration</h1>
          <p className="text-center text-gray-700">Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!connected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administration</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">Veuillez connecter votre portefeuille pour accéder à cette page.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administration</h1>
          <Card className="p-6">
            <p className="text-center text-red-600 mb-4">
              Cette page est réservée aux administrateurs.
            </p>
            <p className="text-center text-gray-700">
              Votre adresse: {publicKey?.toString()}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminCard 
            title="Gestion des autorisations de rôles" 
            description="Gérez les demandes d'accès et attribuez des rôles aux utilisateurs."
            icon="👮‍♂️"
            link="/admin/tokens"
          />
          <AdminCard 
            title="Gestion des formations" 
            description="Créez, modifiez et supprimez des formations."
            icon="📚"
            link="/admin/formations"
          />
          <AdminCard 
            title="Gestion des sessions" 
            description="Planifiez et organisez des sessions de formation."
            icon="📅"
            link="/admin/sessions"
          />
          <AdminCard 
            title="Gestion des étudiants" 
            description="Gérez les groupes d'étudiants et leurs sessions."
            icon="👨‍🎓"
            link="/admin/etudiants"
          />
          <AdminCard 
            title="Administration Blockchain" 
            description="Gérez les comptes de stockage Solana et les configurations blockchain."
            icon="🔗"
            link="/admin/blockchain"
          />
        </div>
      </div>
    </Layout>
  );
} 