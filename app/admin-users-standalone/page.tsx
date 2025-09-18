'use client';

import { useState } from 'react';

// Données mock pour démonstration
const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'client',
    status: 'active',
    phone: '+33 1 23 45 67 89',
    created_at: '2024-01-15',
    profile: {
      company: null,
      about: null
    },
    stats: {
      listings_count: 0,
      inquiries_count: 2,
      deals_count: 0
    }
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    role: 'lister',
    status: 'active',
    phone: '+33 1 23 45 67 90',
    created_at: '2024-01-10',
    profile: {
      company: 'Agence Martin Immobilier',
      about: 'Agent immobilier expérimenté'
    },
    stats: {
      listings_count: 12,
      inquiries_count: 5,
      deals_count: 3
    }
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    role: 'client',
    status: 'pending',
    phone: '+33 1 23 45 67 91',
    created_at: '2024-01-20',
    profile: {
      company: null,
      about: null
    },
    stats: {
      listings_count: 0,
      inquiries_count: 1,
      deals_count: 0
    }
  },
  {
    id: 4,
    name: 'Sophie Bernard',
    email: 'sophie.bernard@example.com',
    role: 'lister',
    status: 'active',
    phone: '+33 1 23 45 67 92',
    created_at: '2024-01-12',
    profile: {
      company: 'Agence Sophie B.',
      about: 'Spécialiste en vente de propriétés'
    },
    stats: {
      listings_count: 8,
      inquiries_count: 3,
      deals_count: 2
    }
  },
  {
    id: 5,
    name: 'Admin Test',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active',
    phone: '+33 1 23 45 67 93',
    created_at: '2024-01-01',
    profile: {
      company: null,
      about: 'Compte administrateur'
    },
    stats: {
      listings_count: 0,
      inquiries_count: 0,
      deals_count: 0
    }
  },
];

const mockStatistics = {
  total_users: mockUsers.length,
  by_role: {
    admin: mockUsers.filter(u => u.role === 'admin').length,
    lister: mockUsers.filter(u => u.role === 'lister').length,
    client: mockUsers.filter(u => u.role === 'client').length,
  },
  by_status: {
    active: mockUsers.filter(u => u.status === 'active').length,
    suspended: 0,
    pending: mockUsers.filter(u => u.status === 'pending').length,
  },
  recent_registrations: 2,
};

export default function AdminUsersStandalone() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm';
      case 'lister': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm';
      case 'client': return 'bg-green-100 text-green-800 px-2 py-1 rounded text-sm';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 px-2 py-1 rounded text-sm';
      case 'pending': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm';
      case 'suspended': return 'bg-red-100 text-red-800 px-2 py-1 rounded text-sm';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm';
    }
  };

  const handleUserAction = (action: string, userId: number) => {
    console.log('Action:', action, 'User ID:', userId);
    alert(`Action "${action}" sur l'utilisateur ${userId} - Fonctionnalité en cours de développement.

Fonctionnalités implémentées dans le backend :
- Lister les utilisateurs avec filtres
- Voir les détails d'un utilisateur
- Modifier le statut (activer/suspendre)
- Modifier le rôle (admin/lister/client)
- Supprimer un utilisateur
- Statistiques utilisateurs

L'API backend est fonctionnelle à l'adresse http://localhost:8000/api/admin/users`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f3f4f6', margin: '0 0 8px 0' }}>
                🎯 Gestion des Utilisateurs - DEMO
              </h1>
              <p style={{ color: '#9ca3af', margin: '0' }}>
                Interface admin pour gérer tous les utilisateurs de la plateforme Gida-Center
              </p>
            </div>
            <button
              style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '8px 16px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onClick={() => handleUserAction('refresh', 0)}
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px', border: '1px solid #4b5563' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f3f4f6' }}>
              {mockStatistics.total_users}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Total utilisateurs</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px', border: '1px solid #4b5563' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
              {mockStatistics.by_role.lister}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Agents</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px', border: '1px solid #4b5563' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399' }}>
              {mockStatistics.by_role.client}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Clients</div>
          </div>
          <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px', border: '1px solid #4b5563' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>
              {mockStatistics.by_status.pending}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>En attente</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{
          backgroundColor: '#374151',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #4b5563',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#f3f4f6' }}>Filtres et Actions</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '8px 12px',
                backgroundColor: '#4b5563',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white'
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#4b5563',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white'
              }}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="lister">Agent</option>
              <option value="client">Client</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#4b5563',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div style={{
          backgroundColor: '#374151',
          borderRadius: '8px',
          border: '1px solid #4b5563',
          overflow: 'auto'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #4b5563' }}>
            <h3 style={{ margin: '0', color: '#f3f4f6' }}>Liste des Utilisateurs</h3>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #4b5563' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Utilisateur</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Rôle</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Téléphone</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Entreprise</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Annonces</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#d1d5db' }}>Inscription</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#d1d5db' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #4b5563' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#f3f4f6' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={getRoleColor(user.role)}>
                        {user.role === 'lister' ? 'Agent' : user.role === 'client' ? 'Client' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={getStatusColor(user.status)}>
                        {user.status === 'active' ? 'Actif' :
                         user.status === 'pending' ? 'En attente' : 'Suspendu'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#d1d5db' }}>{user.phone || '-'}</td>
                    <td style={{ padding: '12px', color: '#d1d5db' }}>{user.profile.company || '-'}</td>
                    <td style={{ padding: '12px', color: '#d1d5db', textAlign: 'center' }}>
                      <span style={{ fontWeight: '500' }}>{user.stats.listings_count}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#d1d5db' }}>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleUserAction('view', user.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            color: '#9ca3af',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                          title="Voir les détails"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleUserAction('manage', user.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            color: '#9ca3af',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                          title="Gérer l'utilisateur"
                        >
                          ⚙️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info API */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#1e40af',
          borderRadius: '8px',
          border: '1px solid #3730a3'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#dbeafe' }}>📡 API Backend Fonctionnelle</h4>
          <p style={{ margin: '0', color: '#bfdbfe', fontSize: '0.875rem' }}>
            L'API complète de gestion des utilisateurs est implémentée et accessible à l'adresse :
            <br />
            <strong>http://localhost:8000/api/admin/users</strong>
            <br />
            Fonctionnalités : Liste avec filtres, Détails, Modification du statut/rôle, Suppression, Statistiques
          </p>
        </div>
      </div>
    </div>
  );
}