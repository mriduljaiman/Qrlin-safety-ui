import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import Modal from '../components/Common/Modal';
import Button from '../components/Common/Button';
import PetProfileForm from '../components/Profile/PetProfileForm';
import ChildProfileForm from '../components/Profile/ChildProfileForm';
import ElderlyProfileForm from '../components/Profile/ElderlyProfileForm';
import ItemProfileForm from '../components/Profile/ItemProfileForm';
import ProfileCard from '../components/Profile/ProfileCard';
import { profilesAPI } from '../api/profiles';
import styles from './ProfileManagement.module.css';

const ProfileManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<any>({
    pets: [],
    children: [],
    elderly: [],
    items: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profilesAPI.getMyProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles', error);
    }
  };

  const handleCreateProfile = (type: string) => {
    setSelectedType(type);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    loadProfiles();
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'PET':
        return <PetProfileForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />;
      case 'CHILD':
        return <ChildProfileForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />;
      case 'ELDERLY':
        return <ElderlyProfileForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />;
      case 'ITEM':
        return <ItemProfileForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Manage Profiles</h1>
          <div className={styles.createButtons}>
            <Button onClick={() => handleCreateProfile('PET')}>🐾 Add Pet</Button>
            <Button onClick={() => handleCreateProfile('CHILD')}>👶 Add Child</Button>
            <Button onClick={() => handleCreateProfile('ELDERLY')}>👴 Add Elderly</Button>
            <Button onClick={() => handleCreateProfile('ITEM')}>🎒 Add Item</Button>
          </div>
        </div>

        <div className={styles.sections}>
          {profiles.pets.length > 0 && (
            <div className={styles.section}>
              <h2>🐾 Pets</h2>
              <div className={styles.grid}>
                {profiles.pets.map((pet: any) => (
                  <ProfileCard
                    key={pet.id}
                    type="PET"
                    name={pet.name}
                    details={`${pet.species} - ${pet.breed || 'Mixed'}`}
                    photoUrl={pet.photoUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {profiles.children.length > 0 && (
            <div className={styles.section}>
              <h2>👶 Children</h2>
              <div className={styles.grid}>
                {profiles.children.map((child: any) => (
                  <ProfileCard
                    key={child.id}
                    type="CHILD"
                    name="Protected"
                    details={child.publicMessage || 'Emergency contact required'}
                    photoUrl={child.photoUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {profiles.elderly.length > 0 && (
            <div className={styles.section}>
              <h2>👴 Elderly</h2>
              <div className={styles.grid}>
                {profiles.elderly.map((elderly: any) => (
                  <ProfileCard
                    key={elderly.id}
                    type="ELDERLY"
                    name={elderly.name}
                    details={elderly.helpMessage || 'Help me reach home'}
                    photoUrl={elderly.photoUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {profiles.items.length > 0 && (
            <div className={styles.section}>
              <h2>🎒 Items</h2>
              <div className={styles.grid}>
                {profiles.items.map((item: any) => (
                  <ProfileCard
                    key={item.id}
                    type="ITEM"
                    name={item.itemName}
                    details={item.description}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Create ${selectedType} Profile`}
      >
        {renderForm()}
      </Modal>
    </div>
  );
};

export default ProfileManagement;