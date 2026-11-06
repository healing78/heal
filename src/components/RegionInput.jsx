import React, { useEffect, useRef, useState } from 'react';
import { searchKoreaRegions } from '../core/koreaRegions';

/**
 * 전국 구·시·군 스마트 검색 자동완성 입력 컴포넌트
 * - 자유 텍스트 직접 입력 100% 허용 (비강제)
 * - 타이핑 시 전국 행정구역 숏네임 자동완성 추천 드롭다운 지원
 */
export default function RegionInput({
  id = 'prof-city',
  value = '',
  onChange,
  required = false,
  placeholder = '서울 구, 지방 시·군 입력 (예: 강남, 수원)'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Update suggestions when value changes
  useEffect(() => {
    if (!value || !value.trim()) {
      setSuggestions([]);
      return;
    }
    const results = searchKoreaRegions(value, 8);
    setSuggestions(results);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="region-input-wrapper"
      style={{ position: 'relative', width: '100%' }}
    >
      <input
        id={id}
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        style={{ width: '100%', boxSizing: 'border-box', height: '40px' }}
        onChange={(e) => {
          if (onChange) onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (value && value.trim()) {
            setIsOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      />

      {/* Smart Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="region-autocomplete-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-divider, #e2e8f0)',
            borderRadius: 'var(--radius-base, 8px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxHeight: '220px',
            overflowY: 'auto',
            margin: 0,
            padding: '4px 0',
            listStyle: 'none'
          }}
        >
          {suggestions.map((item) => (
            <li
              key={`${item.province}-${item.value}`}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(item.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(item.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                borderBottom: '1px solid var(--color-subtle-bg, #f8fafc)',
                color: 'var(--color-text-primary, #0f172a)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--color-subtle-bg, #f1f5f9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-primary, #2563eb)' }}>
                  {item.value}
                </strong>
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted, #64748b)'
                  }}
                >
                  {item.label}
                </span>
              </div>
              <span
                className="location-pill"
                style={{ fontSize: '11px', padding: '1px 6px' }}
              >
                {item.province}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
