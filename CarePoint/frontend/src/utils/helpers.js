// Date formatting utilities
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// String utilities
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// Number utilities
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

// Validation utilities
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
}

// Storage utilities
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Array utilities
export function sortByDate(array, key, order = 'desc') {
  return array.sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

export function filterByStatus(array, status) {
  return array.filter(item => item.status === status);
}

// Color utilities
export function getStatusColor(status) {
  const colors = {
    active: 'green',
    inactive: 'slate',
    pending: 'amber',
    completed: 'green',
    cancelled: 'red',
    'in-progress': 'blue',
    scheduled: 'purple',
    resolved: 'green',
    'on-leave': 'amber',
    available: 'green',
    booked: 'blue',
    blocked: 'red',
    'in-stock': 'green',
    'low-stock': 'amber',
    critical: 'red'
  };
  return colors[status] || 'slate';
}

// Debounce utility
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Calculate percentage
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default {
  formatDate,
  formatTime,
  capitalize,
  getInitials,
  formatCurrency,
  formatNumber,
  validateEmail,
  validatePhone,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  sortByDate,
  filterByStatus,
  getStatusColor,
  debounce,
  generateId,
  calculatePercentage
};
