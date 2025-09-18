'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  User,
  Home
} from 'lucide-react';

// Mock data - à remplacer par de vraies données API
const mockMessages = [
  {
    id: 1,
    sender_name: 'Jean Dupont',
    sender_email: 'jean.dupont@email.com',
    property_title: 'Appartement moderne à Paris',
    subject: 'Demande de visite',
    message: 'Bonjour, je suis intéressé par votre appartement. Serait-il possible d\'organiser une visite ce week-end ?',
    status: 'unread',
    created_at: '2024-01-23T10:30:00',
  },
  {
    id: 2,
    sender_name: 'Marie Martin',
    sender_email: 'marie.martin@email.com',
    property_title: 'Maison avec jardin à Lyon',
    subject: 'Question sur le prix',
    message: 'Le prix affiché est-il négociable ? Y a-t-il des travaux à prévoir ?',
    status: 'read',
    created_at: '2024-01-22T14:15:00',
  },
  {
    id: 3,
    sender_name: 'Pierre Bernard',
    sender_email: 'pierre.bernard@email.com',
    property_title: 'Studio meublé centre-ville',
    subject: 'Disponibilité',
    message: 'Bonjour, le studio est-il toujours disponible ? Quelle est la date d\'entrée possible ?',
    status: 'replied',
    created_at: '2024-01-21T09:45:00',
  },
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredMessages = mockMessages.filter(message =>
    message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.property_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread': return 'Non lu';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <MessageSquare className="h-4 w-4" />;
      case 'read': return <Clock className="h-4 w-4" />;
      case 'replied': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      // Ici on enverrait la réponse via l'API
      console.log('Sending reply:', replyText);
      setReplyText('');
      // Marquer le message comme répondu
      // setSelectedMessage({ ...selectedMessage, status: 'replied' });
    }
  };

  const unreadCount = mockMessages.filter(m => m.status === 'unread').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-gray-600">
          Gérez vos conversations avec les clients
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{mockMessages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Non Lus</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Répondus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockMessages.filter(m => m.status === 'replied').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des messages */}
        <Card>
          <CardHeader>
            <CardTitle>Boîte de Réception</CardTitle>
            <CardDescription>
              {filteredMessages.length} message(s)
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans les messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{message.sender_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getStatusColor(message.status)}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1">{getStatusLabel(message.status)}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{message.property_title}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(message.created_at)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Détail du message */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMessage ? 'Détail du Message' : 'Sélectionnez un Message'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-6">
                {/* En-tête du message */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                    <Badge variant="secondary" className={getStatusColor(selectedMessage.status)}>
                      {getStatusLabel(selectedMessage.status)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>De:</strong> {selectedMessage.sender_name} ({selectedMessage.sender_email})</div>
                    <div><strong>Propriété:</strong> {selectedMessage.property_title}</div>
                    <div><strong>Date:</strong> {formatDate(selectedMessage.created_at)}</div>
                  </div>
                </div>

                {/* Contenu du message */}
                <div>
                  <h4 className="font-medium mb-2">Message:</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Formulaire de réponse */}
                <div>
                  <h4 className="font-medium mb-2">Répondre:</h4>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Tapez votre réponse ici..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setReplyText('')}>
                        Annuler
                      </Button>
                      <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez un message pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}