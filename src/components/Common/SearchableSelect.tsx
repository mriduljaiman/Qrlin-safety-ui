import React, { useEffect, useRef, useState } from 'react';
import styles from './SearchableSelect.module.css';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, options, placeholder, disabled, id }) => {
  const selectedLabel = options.find((o) => o.value === value)?.label || '';
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selectedLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLabel]);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const selectOption = (option: SearchableSelectOption) => {
    setQuery(option.label);
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <input
        id={id}
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && !disabled && (
        <div className={styles.dropdown}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>No match</div>
          ) : (
            filtered.map((option) => (
              <div
                key={option.value}
                className={styles.option}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(option);
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
