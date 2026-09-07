import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAccount } from "@/lib/hooks/useAccount";
import React from "react";
import { Navigate } from "react-router";
import { Label } from "@/components/ui/label";

  

export function LoginForm({ ...props }: React.ComponentProps<"form">) {

    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

    const { login, isLoading, isError, isLoggedIn } = useAccount();

    if (isLoggedIn()) {
        return <Navigate to="/dashboard" replace />;
    }

    const validateInputs = (): boolean => {
        const username = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

        let isValid = true;

        if (!username || !username.value || username.value.trim().length === 0) {
            setUsernameError(true);
            setUsernameErrorMessage('Παρακαλώ εισάγετε το username.');
            isValid = false;
        } else {
            setUsernameError(false);
            setUsernameErrorMessage('');
        }

        if (!password || !password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        login({ email: username, password });
    };

    return (
        <form 
            onSubmit={handleSubmit}
            style={{display: 'flex', width: '320px', flexDirection: 'column', alignItems: 'flex-start', gap: '24px'}}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 w-full">
                    <h1 className="font-sans text-2xl font-medium tracking-tight text-foreground text-center">
                        Σύνδεση
                    </h1>
                    <p className="w-full font-sans text-sm font-normal leading-tight mt-1" style={{color: '#737373'}}>
                        Συμπληρώστε το username και τον κωδικό σας για να συνδεθείτε στην εφαρμογή.
                    </p>
                </div>
                
                <Field>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                        id="username" 
                        name="username"
                        type="text" 
                        placeholder="your-username" 
                        required
                        style={{
                            display: 'flex',
                            height: 'var(--Height-H-10, 40px)',
                            padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                        }}
                    />
                    {usernameError && (
                        <p style={{color: '#ff4444', fontSize: '12px', marginTop: '4px'}}>
                            {usernameErrorMessage}
                        </p>
                    )}
                </Field>

                <Field>
                    <Label htmlFor="password">Κωδικός</Label>
                    <Input 
                        id="password" 
                        name="password"
                        type="password" 
                        required
                        style={{
                            display: 'flex',
                            height: 'var(--Height-H-10, 40px)',
                            padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                        }}
                    />
                    {passwordError && (
                        <p style={{color: '#ff4444', fontSize: '12px', marginTop: '4px'}}>
                            {passwordErrorMessage}
                        </p>
                    )}
                </Field>
                <Field>
                    <Button 
                        variant="default"
                        type="submit"
                        disabled={isLoading}
                        className="w-full transition-all duration-200 hover:opacity-80"
                        style={{
                            display: 'flex',
                            height: 'var(--Height-H-10, 40px)',
                            padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            borderRadius: 'var(--Radius-Rounded-Medium, 6px)',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-foreground)', 
                        }}
                    >
                        {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
                    </Button>
                </Field>

                {isError && (
                    <div style={{color: '#ff4444', fontSize: '12px', textAlign: 'center', width: '100%'}}>
                        Λάθος username ή κωδικός. Προσπαθήστε ξανά.
                    </div>
                )}
            </FieldGroup>
        </form>
    )
}