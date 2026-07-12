import React, { useState, useEffect, useRef } from 'react';

const TestDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [items, setItems] = useState([
        'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
        'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10',
        'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 15'
    ]);
    const dropdownRef = useRef(null);
    const itemRefs = useRef([]);

    useEffect(() => {
        if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
            const item = itemRefs.current[activeIndex];
            const container = dropdownRef.current;
            if (item && container) {
                const containerRect = container.getBoundingClientRect();
                const itemRect = item.getBoundingClientRect();
                
                console.log('Scrolling to item:', activeIndex);
                console.log('Item top:', itemRect.top, 'Container top:', containerRect.top);
                console.log('Item bottom:', itemRect.bottom, 'Container bottom:', containerRect.bottom);
                
                if (itemRect.top < containerRect.top) {
                    item.scrollIntoView({ block: 'start', behavior: 'smooth' });
                } else if (itemRect.bottom > containerRect.bottom) {
                    item.scrollIntoView({ block: 'end', behavior: 'smooth' });
                }
            }
        }
    }, [activeIndex]);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setActiveIndex(0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setActiveIndex(-1);
                break;
        }
    };

    return (
        <div style={{ padding: '40px', background: '#0A0F1E', minHeight: '100vh' }}>
            <h1 style={{ color: '#FFFFFF' }}>Test Dropdown</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Press Arrow Down to open, Arrow Up/Down to navigate</p>
            
            <div style={{ position: 'relative', maxWidth: '400px', marginTop: '20px' }}>
                <input
                    type="text"
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Click or press Arrow Down..."
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                />
                {isOpen && (
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
                            maxHeight: '150px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={index}
                                ref={el => itemRefs.current[index] = el}
                                style={{
                                    padding: '8px 14px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    background: index === activeIndex ? 'rgba(214,158,46,0.08)' : 'transparent',
                                    borderLeft: index === activeIndex ? '2px solid #D69E2E' : '2px solid transparent',
                                    color: '#FFFFFF',
                                    fontSize: '13px'
                                }}
                                onClick={() => {
                                    setActiveIndex(index);
                                    setTimeout(() => setIsOpen(false), 200);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: '30px', color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>
                <p>Active Index: {activeIndex}</p>
                <p>Items: {items.length}</p>
                <p>Open: {isOpen ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
};

export default TestDropdown;
