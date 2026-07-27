export interface PetProfile {
    id?: number;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    gender?: string;
    photoUrl?: string;
    description?: string;
    encryptedMedicalNotes?: string;
    encryptedVetName?: string;
    encryptedVetPhone?: string;
    microchipNumber?: string;
  }
  
  export interface ChildProfile {
    id?: number;
    encryptedName: string;
    photoUrl?: string;
    encryptedDateOfBirth?: string;
    encryptedBloodGroup?: string;
    encryptedSchoolName?: string;
    encryptedSchoolAddress?: string;
    encryptedMedicalConditions?: string;
    encryptedAllergies?: string;
    encryptedEmergencyContact?: string;
    publicMessage?: string;
  }
  
  export interface ElderlyProfile {
    id?: number;
    name: string;
    photoUrl?: string;
    age?: number;
    encryptedBloodGroup?: string;
    encryptedMedicalConditions?: string;
    encryptedMedications?: string;
    encryptedHomeAddress?: string;
    helpMessage?: string;
    encryptedDoctorName?: string;
    encryptedDoctorPhone?: string;
  }
  
  export interface ItemProfile {
    id?: number;
    itemType: string;
    itemName: string;
    photoUrl?: string;
    description?: string;
    rewardMessage?: string;
  }
  
  export interface Vaccination {
    id?: number;
    vaccineName: string;
    vaccinationDate: string;
    nextDueDate?: string;
    veterinarian?: string;
    notes?: string;
  }