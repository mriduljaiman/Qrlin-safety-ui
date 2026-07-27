export interface QRCode {
    id: number;
    qrCode: string;
    profileType: string;
    profileId: number;
    active: boolean;
    lostMode: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProfileResponse {
    profileType: string;
    data: Record<string, any>;
    maskedContact: string;
    lostMode: boolean;
  }