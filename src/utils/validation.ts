export const validation = {
    email: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    phone: (phone: string): boolean => {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      return phoneRegex.test(phone);
    },
    
    password: (password: string): boolean => {
      return password.length >= 8;
    },
    
    required: (value: any): boolean => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    }
  };