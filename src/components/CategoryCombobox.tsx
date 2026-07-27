import React, { useEffect, useRef, useState } from 'react';
import styles from './CategoryCombobox.module.css';

export const CATEGORY_OPTIONS = [
  // Requested defaults, shown first
  'Mobile', 'Earpods', 'School Bag / Travel Bag', 'Children Safety',
  'Person Safety', 'Vehicle Safety', 'Pet', 'Jewellery',
  // Extra suggestions so search has something to actually search
  'Keys', 'Wallet', 'Backpack', 'Luggage', 'Bike', 'Bicycle', 'Car',
  'Laptop', 'Tablet', 'Camera', 'Drone', 'Watch', 'Medicine Kit',
  'Umbrella', 'Water Bottle', 'Headphones',
];

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const CategoryCombobox: React.FC<CategoryComboboxProps> = ({ value, onChange, id }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onChange(query);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filtered = query.trim()
    ? CATEGORY_OPTIONS.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()))
    : CATEGORY_OPTIONS;

  const selectOption = (option: string) => {
    setQuery(option);
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <input
        id={id}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or type your own — Earbuds, Bike, Medicine Kit..."
        autoComplete="off"
        required
      />
      {open && (
        <div className={styles.dropdown}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>No match — keep typing to use "{query}" as a new category</div>
          ) : (
            filtered.map((option) => (
              <div
                key={option}
                className={styles.option}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
              >
                {option}
              </div>
            ))
          )}
          {query.trim() && !CATEGORY_OPTIONS.some((c) => c.toLowerCase() === query.trim().toLowerCase()) && (
            <div
              className={styles.option}
              style={{ fontStyle: 'italic', color: 'var(--gray-500)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(query.trim());
              }}
            >
              + Add "{query.trim()}" as a new category
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCombobox;
