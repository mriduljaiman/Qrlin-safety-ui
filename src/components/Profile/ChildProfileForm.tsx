import React, { useState } from 'react';
import { profilesAPI } from '../../api/profiles';
import Button from '../Common/Button';
import Input from '../Common/Input';
import styles from './ProfileForm.module.css';

interface ChildProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ChildProfileForm: React.FC<ChildProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    encryptedName: '',
    encryptedDateOfBirth: '',
    encryptedBloodGroup: '',
    encryptedSchoolName: '',
    publicMessage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profilesAPI.createChildProfile(formData);
      onSuccess();
    } catch (error) {
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.warning}>
        ⚠️ Child data will be encrypted for security
      </div>

      <Input
        label="Child's Name"
        value={formData.encryptedName}
        onChange={(e) => setFormData({ ...formData, encryptedName: e.target.value })}
        required
      />

      <Input
        label="Date of Birth"
        type="date"
        value={formData.encryptedDateOfBirth}
        onChange={(e) => setFormData({ ...formData, encryptedDateOfBirth: e.target.value })}
      />

      <Input
        label="Blood Group"
        value={formData.encryptedBloodGroup}
        onChange={(e) => setFormData({ ...formData, encryptedBloodGroup: e.target.value })}
      />

      <Input
        label="School Name"
        value={formData.encryptedSchoolName}
        onChange={(e) => setFormData({ ...formData, encryptedSchoolName: e.target.value })}
      />

      <div className={styles.formGroup}>
        <label>Public Message (Visible to Finder)</label>
        <textarea
          value={formData.publicMessage}
          onChange={(e) => setFormData({ ...formData, publicMessage: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Please contact guardian immediately"
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

export default ChildProfileForm;