// frontend/src/components/auth/SignupForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must include uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const { register: registerUser, loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      setError('root', {
        message: 'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Create an account
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Start building amazing applications with AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            helperText="Must be at least 8 characters with uppercase, lowercase, number and special character"
          />

          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-700"
            >
              I agree to the{' '}
              <Link
                to="/terms"
                className="font-medium text-primary hover:text-primary/90"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-medium text-primary hover:text-primary/90"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
        >
          Create account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};