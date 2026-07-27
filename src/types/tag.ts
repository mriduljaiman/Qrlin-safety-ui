export interface Tag {
  id: number;
  qrCode: string;
  category: string;
  tagName: string;
  photoUrl: string | null;
  description: string | null;
  active: boolean;
  lostMode: boolean;
  hasSafetyInfo: boolean;
  createdAt: string;
}

export interface TagRequest {
  category: string;
  tagName: string;
  photoUrl?: string;
  description?: string;
}

export interface SafetyInfo {
  bloodGroup: string | null;
  medicalConditions: string | null;
  allergies: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  doctorName: string | null;
  doctorPhone: string | null;
  publicMessage: string | null;
  address: string | null;
  whatsappNumber: string | null;
  showContactName: boolean;
  showContactPhone: boolean;
  showAddress: boolean;
  showWhatsapp: boolean;
}

export interface PublicTag {
  category: string;
  tagName: string;
  photoUrl: string | null;
  description: string | null;
  lostMode: boolean;
  publicMessage: string | null;
  maskedContact: string | null;
  contactName: string | null;
  contactPhone: string | null;
  address: string | null;
  whatsappNumber: string | null;
}

export interface ChatMessage {
  id: number;
  senderRole: 'OWNER' | 'FINDER';
  body: string;
  sentAt: string;
}

export interface ChatThread {
  id: number;
  status: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  sessionToken?: string;
}
