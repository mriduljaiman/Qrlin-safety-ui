// qr* fields were removed here in Phase 5 (SafeTag lockdown) - the backend still returns them on
// the wire for backward compatibility, but owners can no longer see, customize, or download a
// real QR through their own account, so nothing in this app should read them anymore. See
// PreviewQrOnly and the /api/tags/{id}/safetag-status endpoint for what replaced this.
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

export interface CustomField {
  label: string;
  value: string;
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
  customFields: CustomField[];
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
  customFields: CustomField[] | null;
}

export interface ChatMessage {
  id: number;
  senderRole: 'OWNER' | 'FINDER';
  messageType: 'TEXT' | 'VOICE_NOTE';
  body: string | null;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
  sentAt: string;
}

export interface ChatThread {
  id: number;
  status: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  sessionToken?: string;
}

export interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface CallInitiateResponse {
  sessionToken: string;
  iceServers: IceServer[];
}
