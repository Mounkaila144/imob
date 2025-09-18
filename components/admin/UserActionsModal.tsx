'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  UserX,
  Trash2,
  Shield,
  AlertTriangle,
  X
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserActionsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, userId: number, data?: any) => Promise<void>;
}

export default function UserActionsModal({ user, isOpen, onClose, onAction }: UserActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const resetForm = () => {
    setSelectedAction('');
    setNewStatus('');
    setNewRole('');
    setReason('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAction = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      const actionData: any = { reason };

      switch (selectedAction) {
        case 'update_status':
          actionData.status = newStatus;
          await onAction('updateStatus', user.id, actionData);
          break;
        case 'update_role':
          actionData.role = newRole;
          await onAction('updateRole', user.id, actionData);
          break;
        case 'delete':
          await onAction('delete', user.id);
          break;
      }

      handleClose();
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'lister': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'update_status':
        return newStatus === 'active' ? UserCheck : UserX;
      case 'update_role':
        return Shield;
      case 'delete':
        return Trash2;
      default:
        return AlertTriangle;
    }
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'update_status':
        return `Modifier le statut de ${user.name}`;
      case 'update_role':
        return `Modifier le rôle de ${user.name}`;
      case 'delete':
        return `Supprimer l'utilisateur ${user.name}`;
      default:
        return `Actions pour ${user.name}`;
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case 'update_status':
        return 'Modifiez le statut de cet utilisateur. Cette action sera immédiatement appliquée.';
      case 'update_role':
        return 'Modifiez le rôle de cet utilisateur. Cela changera ses permissions sur la plateforme.';
      case 'delete':
        return 'Supprimez définitivement cet utilisateur. Cette action est irréversible.';
      default:
        return 'Sélectionnez une action à effectuer sur cet utilisateur.';
    }
  };

  const canPerformAction = () => {
    switch (selectedAction) {
      case 'update_status':
        return newStatus && newStatus !== user.status;
      case 'update_role':
        return newRole && newRole !== user.role;
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  const isDangerousAction = selectedAction === 'delete' ||
    (selectedAction === 'update_status' && newStatus === 'suspended');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{getActionTitle()}</DialogTitle>
              <DialogDescription>
                {getActionDescription()}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Informations utilisateur */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{user.name}</span>
              <div className="flex gap-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role === 'lister' ? 'Agent' : user.role === 'client' ? 'Client' : 'Admin'}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status === 'active' ? 'Actif' :
                   user.status === 'pending' ? 'En attente' : 'Suspendu'}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>

          {/* Sélection de l'action */}
          {!selectedAction && (
            <div className="space-y-3">
              <Label>Choisissez une action :</Label>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedAction('update_status')}
                >
                  <UserCheck className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Modifier le statut</div>
                    <div className="text-sm text-gray-500">Activer, suspendre ou mettre en attente</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedAction('update_role')}
                >
                  <Shield className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Modifier le rôle</div>
                    <div className="text-sm text-gray-500">Changer les permissions de l'utilisateur</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setSelectedAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Supprimer l'utilisateur</div>
                    <div className="text-sm text-gray-500">Suppression définitive</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Formulaire pour modifier le statut */}
          {selectedAction === 'update_status' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Nouveau statut</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez la raison de ce changement..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Formulaire pour modifier le rôle */}
          {selectedAction === 'update_role' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Nouveau rôle</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="lister">Agent immobilier</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison (optionnel)</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez la raison de ce changement..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Confirmation pour suppression */}
          {selectedAction === 'delete' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div className="text-red-800 font-medium">Attention</div>
                </div>
                <div className="text-red-700 text-sm mt-1">
                  Cette action supprimera définitivement l'utilisateur et toutes ses données associées.
                  Cette action est irréversible.
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison de la suppression</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez pourquoi vous supprimez cet utilisateur..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedAction && (
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedAction('')} disabled={loading}>
                Retour
              </Button>
              <Button
                onClick={handleAction}
                disabled={!canPerformAction() || loading}
                variant={isDangerousAction ? "destructive" : "default"}
                className="flex-1"
              >
                {loading ? (
                  'En cours...'
                ) : (
                  <>
                    {React.createElement(getActionIcon(selectedAction), { className: "h-4 w-4 mr-2" })}
                    {selectedAction === 'update_status' && 'Modifier le statut'}
                    {selectedAction === 'update_role' && 'Modifier le rôle'}
                    {selectedAction === 'delete' && 'Supprimer'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}