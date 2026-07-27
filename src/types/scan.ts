export interface ScanLog {
    id: number;
    scannedAt: string;
    ipAddress: string;
    latitude?: string;
    longitude?: string;
    city?: string;
    country?: string;
  }
  
  export interface ContactLog {
    id: number;
    contactType: string;
    contactedAt: string;
    message?: string;
    finderPhone?: string;
    finderName?: string;
  }