import { BacklogTable, Contact } from '@/containers/BacklogTable';
import { useEffect } from 'react';
import { useState } from 'react';
import supabase from '@/config/supabase';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ScheduleEmailForm from '@/containers/ScheduleEmailForm';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';

const RESUME_NAME = 'Apekshya_Pokharel_CV.pdf';

const BacklogPage = () => {
    const [contacts, setContacts] = useState([]);
    const [pendingEmails, setPendingEmailsCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState('');
    const [resumeURL, setResumeURL] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [selectedRow, setSelectedRow] = useState<Contact | null>(null);
    const [scheduleStage, setScheduleStage] = useState(0);
    const [guardRails, setGuardRails] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        getSetData();
    }, []);

    const getSetNotionData = async () => {
        const response = await supabase.functions.invoke(
            import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_NAME + '?status=Email',
            {
                method: 'POST',
            },
        );
        setContacts(response.data);
    };

    const getSetData = async () => {
        setLoading(true);
        await getSetNotionData();
        const { data } = await supabase.from('global').select('*').eq('email', 'apekshyapokharel@gmail.com');
        const pendingEmails = await supabase.from('emails').select('*').eq('status', 'PENDING');

        setPendingEmailsCount(pendingEmails.data!.length);
        setTemplate(data![0].template);
        setSubject(data![0].subject);

        const { data: files, error } = await supabase.storage.from('resumes').list('');
        const fileExists = files ? files!.some((file) => file.name === RESUME_NAME) : false;

        if (fileExists && !error) {
            const resumeResponse = supabase.storage.from('resumes').getPublicUrl(RESUME_NAME);
            setResumeURL(resumeResponse.data.publicUrl);
        }
        setLoading(false);
    };

    const generateDialogContent = () => {
        if (selectedRow !== null) {
            return (
                <DialogContent className={`${scheduleStage === 2 ? 'w-[400px]' : 'w-[750px]'} pt-8 pl-8 pr-8 pb-4`}>
                    <DialogHeader className=''>
                        <DialogTitle>
                            {scheduleStage === 0
                                ? 'Schedule Email'
                                : scheduleStage === 1
                                ? 'Preview Email'
                                : 'Confirm Immediate Send'}
                        </DialogTitle>
                        <DialogDescription className='!mb-2'>
                            {scheduleStage === 0
                                ? 'Review over the below details and enter in your custom content to schedule an email.'
                                : scheduleStage === 1
                                ? "Review over the below email preview and make any changes you'd like."
                                : 'This action cannot be undone and the email will be sent immediately.'}
                        </DialogDescription>
                        <div className='!mt-4'>
                            <ScheduleEmailForm
                                template={template}
                                subject={subject}
                                row={selectedRow}
                                close={() => {
                                    setSelectedRow(null);
                                    setScheduleStage(0);
                                }}
                                stage={scheduleStage}
                                setStage={(stage: number) => setScheduleStage(stage)}
                                attachmentURL={resumeURL as string}
                                refreshNotionData={getSetNotionData}
                                setGuardRails={setGuardRails}
                            />
                        </div>
                    </DialogHeader>
                    <DialogFooter className='sm:justify-start'>
                        <DialogClose asChild></DialogClose>
                    </DialogFooter>
                </DialogContent>
            );
        }
    };

    return (
        <div className='ml-2 mr-2 mt-5 space-y-6'>
            <Dialog
                open={selectedRow !== null}
                onOpenChange={() => {
                    if (!guardRails) {
                        setSelectedRow(null);
                        setScheduleStage(0);
                    }
                }}
            >
                {generateDialogContent()}
            </Dialog>
            <div>
                <h3 className='text-lg font-medium'>Backlog</h3>
                <p className='text-sm text-muted-foreground'>Schedule and view emails in backlog.</p>
            </div>
            <Separator className='mb-0' />
            <BacklogTable
                data={contacts}
                scheduleEmailFn={(row: Contact) => {
                    if (template && resumeURL) {
                        if (pendingEmails && pendingEmails! > 25) {
                            toast({
                                title: 'Scheduled Emails Limit Reached.',
                                description:
                                    "You've reached your limit of 25 scheduled emails. Please wait for them to deliver to schedule more",
                                variant: 'destructive',
                            });
                        } else {
                            setSelectedRow(row);
                        }
                    } else {
                        toast({
                            title: 'Template or Resume Missing.',
                            description: 'Add a template & resume in settings to schedule an email.',
                            variant: 'destructive',
                            action: (
                                <ToastAction onClick={() => navigate('/app/settings')} altText='Settings'>
                                    Settings
                                </ToastAction>
                            ),
                        });
                    }
                }}
                isLoading={loading}
                refreshNotionDataFn={getSetData}
            />
        </div>
    );
};

export default BacklogPage;
