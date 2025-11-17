export class ValidationUtils {
  private static readonly EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  private static readonly PHONE_REGEX = /^\+?\d{9,11}$/;
  private static readonly USERNAME_REGEX = /^[a-z]+$/;

  static isBlank(value: string | null | undefined): boolean {
    if (!value) return true;
    return value.trim().length === 0;
  }

  static isValidEmail(email: string): boolean {
    if (this.isBlank(email)) return false;
    return this.EMAIL_REGEX.test(email);
  }

  static isValidPhone(phone: string): boolean {
    if (this.isBlank(phone)) return false;
    return this.PHONE_REGEX.test(phone);
  }

  static isValidUsername(username: string): boolean {
    if (this.isBlank(username)) return false;
    return this.USERNAME_REGEX.test(username);
  }

  static lengthBetween(value: string, min: number, max: number): boolean {
    if (!value) return false;
    const len = value.length;
    return len >= min && len <= max;
  }

  // Validate login form
  static validateLogin(username: string, password: string): string[] {
    const errors: string[] = [];

    if (this.isBlank(username)) {
      errors.push('Username is required');
    }
    if (this.isBlank(password)) {
      errors.push('Password is required');
    }

    return errors;
  }

  // Validate register form
  static validateRegister(data: {
    username: string;
    email: string;
    phone: string;
    password: string;
    realName: string;
  }): string[] {
    const errors: string[] = [];

    if (this.isBlank(data.username)) {
      errors.push('Username is required');
    } else if (!this.lengthBetween(data.username, 6, 50)) {
      errors.push('Username must be 6-50 characters');
    } else if (!this.isValidUsername(data.username)) {
      errors.push('Username must contain only lowercase letters');
    }

    if (this.isBlank(data.email)) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (this.isBlank(data.phone)) {
      errors.push('Phone is required');
    } else if (!this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format (9-11 digits)');
    }

    if (this.isBlank(data.password)) {
      errors.push('Password is required');
    } else if (!this.lengthBetween(data.password, 6, 50)) {
      errors.push('Password must be 6-50 characters');
    }

    if (this.isBlank(data.realName)) {
      errors.push('Real name is required');
    } else if (!this.lengthBetween(data.realName, 6, 50)) {
      errors.push('Real name must be 6-50 characters');
    }

    return errors;
  }

  // Validate update form
  static validateUpdate(data: {
    email?: string;
    phone?: string;
    password?: string;
    realName?: string;
  }): string[] {
    const errors: string[] = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format (9-11 digits)');
    }

    if (data.password && !this.lengthBetween(data.password, 6, 50)) {
      errors.push('Password must be 6-50 characters');
    }

    if (data.realName && !this.lengthBetween(data.realName, 6, 50)) {
      errors.push('Real name must be 6-50 characters');
    }

    return errors;
  }
}
