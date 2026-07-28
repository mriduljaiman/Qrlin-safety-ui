export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  photoUrl: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  whatsappNumber: string | null;
  whatsappCountryCode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  photoUrl?: string;
  phone?: string;
  phoneCountryCode?: string;
  whatsappNumber?: string;
  whatsappCountryCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

export interface Preferences {
  theme: string;
  notificationSound: string;
  notificationFontSize: string;
  notificationFontFamily: string;
  notificationColor: string;
  notificationMuted: boolean;
}
