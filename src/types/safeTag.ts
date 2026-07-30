export type SafeTagStatus =
  | 'PENDING_PRINT'
  | 'PRINTED'
  | 'PACKED'
  | 'SHIPPED'
  | 'ACTIVE'
  | 'LOST'
  | 'REISSUED'
  | 'DISABLED'
  | 'DESTROYED';

export interface SafeTag {
  id: number;
  qrId: string;
  tagNumber: string | null;
  tagSerial: string | null;
  status: SafeTagStatus;

  tagId: number;
  tagName: string;
  tagCategory: string;
  ownerEmail: string | null;
  ownerName: string | null;

  manufacturedAt: string | null;
  printedAt: string | null;
  packedAt: string | null;
  shippedAt: string | null;
  activatedAt: string | null;
  disabledAt: string | null;

  reissuedFromId: number | null;
  replacementCount: number;

  trackingNumber: string | null;
  courierName: string | null;
  shippingAddress: string | null;

  printVersion: string | null;
  securityVersion: string | null;
  printerProfile: string | null;
  adminNotes: string | null;

  securityTemplateId: string | null;
  printBatchId: string | null;
  printerCalibrationId: string | null;
  securityPatternVersion: string | null;
  microtextVersion: string | null;
  laminationType: string | null;
  paperType: string | null;

  qrColor: string;
  qrBackgroundColor: string;
  qrStyle: string;
  qrTitleAbove: string;
  qrTitleBelow: string;
  qrCenterText: string;

  createdAt: string;
  updatedAt: string;
}

export interface SafeTagUpdateRequest {
  tagSerial?: string;
  trackingNumber?: string;
  courierName?: string;
  shippingAddress?: string;
  adminNotes?: string;
  printerProfile?: string;
  securityTemplateId?: string;
  printBatchId?: string;
  printerCalibrationId?: string;
  securityPatternVersion?: string;
  microtextVersion?: string;
  laminationType?: string;
  paperType?: string;
  qrColor?: string;
  qrBackgroundColor?: string;
  qrStyle?: string;
  qrTitleAbove?: string;
  qrTitleBelow?: string;
  qrCenterText?: string;
}

export interface PrintBatchSummary {
  printBatchId: string;
  safeTagCount: number;
  securityTemplateIds: string[];
  printerCalibrationIds: string[];
  securityPatternVersions: string[];
  lastUpdatedAt: string | null;
}

export interface AdminTagSummary {
  id: number;
  tagName: string;
  category: string;
  ownerEmail: string | null;
  ownerName: string | null;
  hasSafeTag: boolean;
}

// Every non-terminal status's allowed next steps, mirrored from
// SafeTagService.ALLOWED_TRANSITIONS on the backend - kept here purely to drive which buttons the
// admin UI offers; the backend re-validates regardless, this is not the source of truth.
export const SAFETAG_TRANSITIONS: Record<string, SafeTagStatus[]> = {
  PENDING_PRINT: ['PRINTED', 'DISABLED'],
  PRINTED: ['PACKED', 'DISABLED'],
  PACKED: ['SHIPPED', 'DISABLED'],
  SHIPPED: ['ACTIVE', 'LOST', 'DISABLED'],
  ACTIVE: ['LOST', 'DISABLED'],
  LOST: ['ACTIVE', 'DISABLED', 'DESTROYED'],
  DISABLED: ['ACTIVE', 'DESTROYED'],
  REISSUED: [],
  DESTROYED: [],
};
