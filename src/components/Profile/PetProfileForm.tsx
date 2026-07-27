import React, { useState } from 'react';
import { profilesAPI } from '../../api/profiles';
import Button from '../Common/Button';
import Input from '../Common/Input';
import styles from './ProfileForm.module.css';

interface PetProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PetProfileForm: React.FC<PetProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    description: '',
    microchipNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profilesAPI.createPetProfile({
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      });
      onSuccess();
    } catch (error) {
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Pet Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <div className={styles.formGroup}>
        <label>Species</label>
        <select
          value={formData.species}
          onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          className={styles.select}
        >
          <option>Dog</option>
          <option>Cat</option>
          <option>Bird</option>
          <option>Other</option>
        </select>
      </div>

      <Input
        label="Breed"
        value={formData.breed}
        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
      />

      <Input
        label="Age"
        type="number"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
      />

      <div className={styles.formGroup}>
        <label>Gender</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className={styles.select}
        >
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          rows={4}
        />
      </div>

      <Input
        label="Microchip Number"
        value={formData.microchipNumber}
        onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
};

export default PetProfileForm;