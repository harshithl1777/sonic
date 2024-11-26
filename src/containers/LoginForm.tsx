import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/config/supabase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Reset errors
        setEmailError(null);
        setPasswordError(null);

        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (!password) {
            setPasswordError('Password is required');
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.toLowerCase().includes('email')) {
                    setEmailError(error.message);
                } else if (error.message.toLowerCase().includes('password')) {
                    setPasswordError(error.message);
                } else {
                    setPasswordError('Login failed. Please try again.');
                }
            } else {
                toast({
                    title: 'Login Successful',
                    description: 'Redirecting to your dashboard...',
                });

                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/app/home');
                }, 1000);
            }
        } catch (error) {
            setPasswordError('Unexpected error occurred. Please try again.');
        }
    };

    return (
        <Card className='mx-auto max-w-sm'>
            <CardHeader>
                <CardTitle className='text-2xl'>Log In to Sonic</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin}>
                    <div className='grid gap-4'>
                        <div className='grid gap-2 items-start'>
                            <Label className='mr-auto' htmlFor='email'>
                                Email
                            </Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='m@example.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={emailError ? 'border-red-500' : ''}
                            />
                            {emailError && <p className='text-red-500 text-sm'>{emailError}</p>}
                        </div>

                        <div className='grid gap-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                type='password'
                                placeholder='secret123@'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={passwordError ? 'border-red-500' : ''}
                            />
                            {passwordError && <p className='text-red-500 text-sm'>{passwordError}</p>}
                        </div>

                        <Button type='submit' className='w-full'>
                            Login
                        </Button>
                    </div>
                </form>

                {/* Signup Link */}
                <div className='mt-4 text-center text-sm'>
                    Don&apos;t have an account?{' '}
                    <a href='/auth/signup' className='underline'>
                        Join the waitlist
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
