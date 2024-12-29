// frontend/src/utils/validation.ts
import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .optional();

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9-_\s]+$/,
      'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  framework: z.enum(['react', 'vue', 'angular']),
  styling: z.enum(['tailwind', 'css', 'scss']),
});

// Validation helper functions
export const validateForm = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      };
    }
    return { success: false, error: 'Validation failed' };
  }
};

export const validateField = async <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): Promise<{ success: boolean; error?: string }> => {
  try {
    await schema.parseAsync(value);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
};

export const isValidEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const isStrongPassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  errors.errors.forEach(error => {
    const field = error.path.join('.');
    formattedErrors[field] = error.message;
  });
  return formattedErrors;
};

// Utility functions for form handling
export const validateFormField = (
  value: string,
  rules: { required?: boolean; minLength?: number; maxLength?: number; pattern?: RegExp }
): string | null => {
  if (rules.required && !value) {
    return 'This field is required';
  }
  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Cannot exceed ${rules.maxLength} characters`;
  }
  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }
  return null;
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};