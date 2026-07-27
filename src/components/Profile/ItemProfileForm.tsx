import React, { useState } from 'react';
import { profilesAPI } from '../../api/profiles';
import Button from '../Common/Button';
import Input from '../Common/Input';
import styles from './ProfileForm.module.css';

interface ItemProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ItemProfileForm: React.FC<ItemProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    itemType: 'Backpack',
    itemName: '',
    description: '',
    rewardMessage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profilesAPI.createItemProfile(formData);
      onSuccess();
    } catch (error) {
      alert('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Item Type</label>
        <select
          value={formData.itemType}
          onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
          className={styles.select}
        >
          <option>Backpack</option>
          <option>Laptop</option>
          <option>Keys</option>
          <option>Wallet</option>
          <option>Phone</option>
          <option>Other</option>
        </select>
      </div>

      <Input
        label="Item Name"
        value={formData.itemName}
        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
        required
      />

      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Reward Message (Optional)</label>
        <textarea
          value={formData.rewardMessage}
          onChange={(e) => setFormData({ ...formData, rewardMessage: e.target.value })}
          className={styles.textarea}
          rows={2}
          placeholder="Reward offered for return"
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

export default ItemProfileForm;