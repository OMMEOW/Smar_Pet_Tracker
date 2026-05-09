export const validateIndianPhone = (phone: string) => {
  const phoneRegex = /^(?:\+91|91)?[6789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const formatIndianPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    return cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2)}`;
  }
  return phone; // fallback
};

export const validateName = (name: string) => {
  if (name.trim().length < 2) return false;
  if (/^\d+$/.test(name.trim())) return false; // numeric only
  return true;
};

export const capitalizeName = (name: string) => {
  return name.replace(/\b\w/g, l => l.toUpperCase());
};

export const validateIndianPIN = (pin: string) => {
  const pinRegex = /^[1-9][0-9]{5}$/;
  return pinRegex.test(pin.replace(/\s+/g, ''));
};

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};
