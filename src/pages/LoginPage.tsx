import { LoginForm } from '@/containers/LoginForm';
import Logo from '@/assets/Logo.svg';

const LoginPage = () => {
    return (
        <div className='flex h-screen w-full items-center justify-center flex-col gap-8'>
            <img className='w-[200px]' alt='Sonic Logo' src={Logo} />
            <LoginForm />
        </div>
    );
};

export default LoginPage;
