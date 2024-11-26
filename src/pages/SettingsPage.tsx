import SettingsForm from '@/containers/SettingsForm';
import { Separator } from '@/components/ui/separator';

const SettingsPage = () => {
    return (
        <div className='ml-5 mt-5 space-y-6'>
            <div>
                <h3 className='text-lg font-medium'>Settings</h3>
                <p className='text-sm text-muted-foreground'>
                    Update your account settings. Set your preferred resume and template.
                </p>
            </div>
            <Separator />
            <SettingsForm />
        </div>
    );
};

export default SettingsPage;
