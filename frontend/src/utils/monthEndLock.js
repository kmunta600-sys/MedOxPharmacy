// Month-End Lock System - Only activates during specific times
export const checkMonthEndLock = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysUntilEnd = Math.ceil((lastDay - today) / (1000 * 60 * 60 * 24));
    
    const inventoryDone = localStorage.getItem('physical_inventory_done');
    const inventoryMonth = localStorage.getItem('physical_inventory_month');
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const reminderShown = localStorage.getItem('physical_inventory_reminder_shown');
    const reminderMonth = localStorage.getItem('physical_inventory_reminder_month');
    const reminderShownForMonth = reminderShown === 'true' && reminderMonth === currentMonth;
    
    const isInventoryComplete = inventoryMonth === currentMonth && inventoryDone === 'true';
    const isMonthEnd = daysUntilEnd <= 3;
    const isReminderTime = daysUntilEnd === 3 || daysUntilEnd === 4;
    
    // REMINDER LOGIC
    if (isReminderTime && !isInventoryComplete) {
        if (!reminderShownForMonth) {
            localStorage.setItem('physical_inventory_reminder_shown', 'true');
            localStorage.setItem('physical_inventory_reminder_month', currentMonth);
        }
        return {
            locked: false,
            message: `Physical inventory is due in ${daysUntilEnd} days. Please prepare for month-end count.`,
            daysUntilEnd: daysUntilEnd,
            isReminder: true
        };
    }
    
    // LOCK LOGIC
    if (isMonthEnd && !isInventoryComplete) {
        return {
            locked: true,
            message: 'Month-end physical inventory required! Please complete physical count before processing transactions.',
            daysUntilEnd: daysUntilEnd,
            isReminder: false
        };
    }
    
    return {
        locked: false,
        message: '',
        daysUntilEnd: daysUntilEnd,
        isReminder: false
    };
};

export const isMonthEndLocked = () => {
    const result = checkMonthEndLock();
    return result.locked;
};

export const getMonthEndMessage = () => {
    const result = checkMonthEndLock();
    return result.message;
};

export const isReminderActive = () => {
    const result = checkMonthEndLock();
    return result.isReminder || false;
};

export const getReminderMessage = () => {
    const result = checkMonthEndLock();
    return result.isReminder ? result.message : '';
};
