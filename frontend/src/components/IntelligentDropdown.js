import React, { useState, useEffect, useRef } from 'react';

const IntelligentDropdown = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Type or select...',
    onAddNew,
    onEdit,
    onDelete,
    disabled = false,
    required = false,
    allowNew = true,
    allowEdit = true,
    allowDelete = true
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editValue, setEditValue] = useState('');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
                setActiveIndex(-1);
                setEditingIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!inputValue) {
            setFilteredOptions(options);
        } else {
            const search = inputValue.toLowerCase();
            setFilteredOptions(options.filter(o => o.toLowerCase().includes(search)));
        }
        setActiveIndex(-1);
        itemRefs.current = [];
    }, [inputValue, options]);

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
            const item = itemRefs.current[activeIndex];
            const dropdown = dropdownRef.current;
            if (item && dropdown) {
                const itemRect = item.getBoundingClientRect();
                const dropdownRect = dropdown.getBoundingClientRect();
                
                // Check if item is above or below the visible area
                if (itemRect.top < dropdownRect.top) {
                    item.scrollIntoView({ block: 'start', behavior: 'smooth' });
                } else if (itemRect.bottom > dropdownRect.bottom) {
                    item.scrollIntoView({ block: 'end', behavior: 'smooth' });
                }
            }
        }
    }, [activeIndex]);

    const handleKeyDown = (e) => {
        if (!showDropdown) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                setShowDropdown(true);
                setActiveIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (editingIndex >= 0) {
                    const oldValue = filteredOptions[editingIndex];
                    if (editValue.trim() && editValue !== oldValue && onEdit) {
                        onEdit(oldValue, editValue.trim());
                        setEditingIndex(-1);
                        setEditValue('');
                        setShowDropdown(false);
                    }
                } else if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[activeIndex]);
                } else if (inputValue.trim() && allowNew && onAddNew) {
                    handleAdd();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setActiveIndex(-1);
                setEditingIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (selected) => {
        setInputValue(selected);
        setShowDropdown(false);
        setActiveIndex(-1);
        setEditingIndex(-1);
        onChange(selected);
    };

    const handleAdd = () => {
        if (onAddNew && inputValue.trim()) {
            onAddNew(inputValue.trim());
            setInputValue('');
            setShowDropdown(false);
            setActiveIndex(-1);
        }
    };

    const handleDelete = (item, e) => {
        e.stopPropagation();
        if (onDelete && window.confirm(`Delete "${item}"?`)) {
            onDelete(item);
            if (value === item) {
                setInputValue('');
                onChange('');
            }
            setShowDropdown(false);
        }
    };

    const startEdit = (item, index, e) => {
        e.stopPropagation();
        setEditingIndex(index);
        setEditValue(item);
        setShowDropdown(true);
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingIndex(-1);
        setEditValue('');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            inputRef.current?.focus();
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.25)',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {label}
                    {required && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowDropdown(true);
                        setEditingIndex(-1);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        paddingRight: '30px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#D69E2E'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
                {inputValue && !disabled && (
                    <button
                        onClick={() => { setInputValue(''); onChange(''); setShowDropdown(false); setActiveIndex(-1); }}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        type="button"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                )}
                {showDropdown && !disabled && (
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            background: '#111827',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                        className="dropdown-scroll"
                    >
                        <style>{`
                            .dropdown-scroll::-webkit-scrollbar {
                                display: none;
                                width: 0;
                                height: 0;
                            }
                        `}</style>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((item, index) => {
                                const isEditing = editingIndex === index;
                                const isActive = index === activeIndex;
                                return (
                                    <div
                                        key={index}
                                        ref={el => itemRefs.current[index] = el}
                                        style={{
                                            padding: '8px 14px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: isActive ? 'rgba(214,158,46,0.08)' : 'transparent',
                                            borderLeft: isActive ? '2px solid #D69E2E' : '2px solid transparent',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => {
                                            if (!isEditing) handleSelect(item);
                                        }}
                                    >
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '4px 8px',
                                                        background: 'rgba(255,255,255,0.08)',
                                                        border: '1px solid rgba(214,158,46,0.3)',
                                                        borderRadius: '4px',
                                                        color: '#FFFFFF',
                                                        fontSize: '13px',
                                                        outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            if (editValue.trim() && editValue !== item && onEdit) {
                                                                onEdit(item, editValue.trim());
                                                                setEditingIndex(-1);
                                                                setEditValue('');
                                                                setShowDropdown(false);
                                                            }
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setEditingIndex(-1);
                                                            setEditValue('');
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (editValue.trim() && editValue !== item && onEdit) {
                                                            onEdit(item, editValue.trim());
                                                            setEditingIndex(-1);
                                                            setEditValue('');
                                                            setShowDropdown(false);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: '#10B981',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'inherit'
                                                    }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingIndex(-1);
                                                        setEditValue('');
                                                    }}
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: 'rgba(239,68,68,0.1)',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        fontSize: '11px',
                                                        fontFamily: 'inherit'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{item}</span>
                                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                    {allowEdit && onEdit && (
                                                        <button
                                                            onClick={(e) => startEdit(item, index, e)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'rgba(255,255,255,0.1)',
                                                                cursor: 'pointer',
                                                                padding: '2px 6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.1)'}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                                                                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {allowDelete && onDelete && (
                                                        <button
                                                            onClick={(e) => handleDelete(item, e)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'rgba(255,255,255,0.1)',
                                                                cursor: 'pointer',
                                                                padding: '2px 6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.1)'}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: '13px' }}>
                                No options found
                            </div>
                        )}
                        {allowNew && inputValue.trim() && !options.some(o => o.toLowerCase() === inputValue.trim().toLowerCase()) && (
                            <div
                                onClick={handleAdd}
                                style={{
                                    padding: '8px 14px',
                                    borderTop: '1px solid rgba(255,255,255,0.04)',
                                    color: '#D69E2E',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(214,158,46,0.06)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="16"/>
                                    <line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                                Add "{inputValue.trim()}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntelligentDropdown;
