import React, { useState } from 'react';
import { profilesAPI } from '../../api/profiles';
import Button from '../Common/Button';
import Input from '../Common/Input';
import styles from './ProfileForm.module.css';

interface ElderlyProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ElderlyProfileForm: React.FC<ElderlyProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    helpMessage: '',
    encryptedBloodGroup: '',
    encryptedMedicalConditions: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profilesAPI.createElderlyProfile({
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
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        label="Age"
        type="number"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
      />

      <div className={styles.formGroup}>
        <label>Help Message</label>
        <textarea
          value={formData.helpMessage}
          onChange={(e) => setFormData({ ...formData, helpMessage: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Please help me reach home"
        />
      </div>

      <Input
        label="Blood Group"
        value={formData.encryptedBloodGroup}
        onChange={(e) => setFormData({ ...formData, encryptedBloodGroup: e.target.value })}
      />

      <div className={styles.formGroup}>
        <label>Medical Conditions</label>
        <textarea
          value={formData.encryptedMedicalConditions}
          onChange={(e) => setFormData({ ...formData, encryptedMedicalConditions: e.target.value })}
          className={styles.textarea}
          rows={3}
        />
      </div>

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
export default ElderlyProfileForm;