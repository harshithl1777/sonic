import { BacklogTable, Contact } from '@/containers/BacklogTable';
import { useEffect, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const RESUME_NAME = 'Apekshya_Pokharel_CV.pdf';

dayjs.extend(relativeTime);

const BacklogPage = () => {
    const [contacts, setContacts] = useState([]);
    const [pendingEmails, setPendingEmailsCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState('');
    const [resumeURL, setResumeURL] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [selectedRow, setSelectedRow] = useState<Contact | null>(null);
    const [draftLoading, setDraftLoading] = useState(false);
    const [selectedDraftRow, setSelectedDraftRow] = useState<Contact | null>(null);
    const [drafts, setDrafts] = useState<{ [email: string]: string }>({});
    const [draft, setDraft] = useState('');
    const [saved, setSaved] = useState(true);
    const [scheduleStage, setScheduleStage] = useState(0);
    const [guardRails, setGuardRails] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        getSetData();
    }, []);

    const getSetNotionData = async () => {
        const response = await supabase.functions.invoke(
            import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_NAME + '?status=Email,Stalled',
            {
                method: 'POST',
            },
        );
        setContacts(response.data);
    };

    const getSetDrafts = async () => {
        const drafts = await supabase.from('drafts').select('*');
        const emailToDraftMap: { [email: string]: string } = {};
        drafts.data!.forEach((row) => {
            emailToDraftMap[row.email as string] = row.draft;
        });
        setDrafts(emailToDraftMap);
    };

    const getSetData = async () => {
        setLoading(true);
        await getSetNotionData();
        const { data } = await supabase.from('global').select('*').eq('email', 'apekshyapokharel@gmail.com');
        const pendingEmails = await supabase.from('emails').select('*').eq('status', 'PENDING');
        await getSetDrafts();

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
                                draft={selectedRow.email in drafts ? drafts[selectedRow.email] : ''}
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

    const saveDraftSubmit = async (newDraft: string) => {
        try {
            setDraftLoading(true);
            const { error } = await supabase
                .from('drafts')
                .upsert({ email: selectedDraftRow!.email, draft: newDraft }, { onConflict: 'email' });
            setSaved(true);
            if (error) throw new Error();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Unable to Save Draft',
                description: 'Something went wrong. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            await getSetDrafts();
            setDraftLoading(false);
        }
    };

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setDraft(newValue);
        setSaved(false);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
            await saveDraftSubmit(newValue);
        }, 1500);
    };

    type UniversityNames = 'Waterloo' | 'Toronto' | 'Western' | 'McMaster' | 'Laurier' | 'Queens' | 'Manitoba';

    const universityDefaultNames: Record<UniversityNames, string> = {
        Waterloo: 'the University of Waterloo',
        Toronto: 'the University of Toronto',
        Western: 'Western University',
        McMaster: 'McMaster University',
        Laurier: 'Wilfrid Laurier University',
        Queens: 'Queens University',
        Manitoba: 'the University of Manitoba',
    };

    function fillPlaceholders(emailText: string, name: string, university: UniversityNames, stage: 1 | 2) {
        const text = emailText.split('{CUSTOM}')[stage - 1];
        const lastName = name.split(' ').at(-1);
        const universityReplacement = universityDefaultNames[university];

        const namePattern = /\[NAME\]/g;
        const universityThePattern = /\b(?:the\s+)*\[UNIVERSITY\]/gi;
        const universityRegularPattern = /\[UNIVERSITY\]/g;

        const processedText = text
            .replace(namePattern, `Dr. ${lastName}`)
            .replace(universityThePattern, universityReplacement)
            .replace(universityRegularPattern, universityReplacement)
            .trim();

        return processedText;
    }

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
            <Dialog open={selectedDraftRow !== null} onOpenChange={() => {}}>
                {selectedDraftRow !== null && (
                    <DialogContent className={`w-[750px] pt-8 pl-8 pr-8 pb-4 [&>button]:hidden`}>
                        <DialogHeader className=''>
                            <DialogTitle className='flex items-center gap-2'>
                                {saved && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div className='w-2 h-2 bg-blue-500 rounded-full' />
                                        </TooltipTrigger>
                                        <TooltipContent side='bottom'>Unsaved</TooltipContent>
                                    </Tooltip>
                                )}
                                Draft Email
                            </DialogTitle>
                            <DialogDescription className='!mb-2'>
                                Start drafting your cold email below with the formatted full email template visible.
                            </DialogDescription>
                            <div className='!mt-4 whitespace-pre-line text-sm text-slate-300 !ml-2'>
                                {fillPlaceholders(
                                    template,
                                    selectedDraftRow.name,
                                    selectedDraftRow.university as UniversityNames,
                                    1,
                                )}
                                <Textarea
                                    className='w-full h-24 !my-4'
                                    id='customContent'
                                    placeholder='Enter your customized content here..'
                                    value={draft}
                                    onChange={(e) => handleChange(e)}
                                />
                                {fillPlaceholders(
                                    template,
                                    selectedDraftRow.name,
                                    selectedDraftRow.university as UniversityNames,
                                    2,
                                )}
                            </div>
                        </DialogHeader>
                        <DialogFooter className='!my-4'>
                            <Button
                                onClick={() => {
                                    if (saved) {
                                        toast({
                                            title: 'Draft Unsaved',
                                            description:
                                                "Your draft couldn't be saved. Are you sure you want to leave?",
                                            action: (
                                                <Button
                                                    variant='outline'
                                                    className='bg-transparent border-white hover:bg-transparent hover:brightness-90'
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(draft);
                                                        setDraft('');
                                                        setSelectedDraftRow(null);
                                                        setSaved(true);
                                                        toast({
                                                            title: 'Content Copied',
                                                            description:
                                                                'Just in case, your draft has been copied to your clipboard. 🙂',
                                                        });
                                                    }}
                                                >
                                                    Yes
                                                </Button>
                                            ),
                                            variant: 'destructive',
                                        });
                                    } else {
                                        setDraft('');
                                        setSelectedDraftRow(null);
                                        setSaved(true);
                                    }
                                }}
                                className='bg-slate-600 hover:bg-slate-500 w-full flex flex-row gap-2'
                                disabled={draftLoading}
                            >
                                {draftLoading && <Loader2 className='animate-spin' />}
                                {draftLoading ? 'Saving' : 'Close'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
            <div>
                <h3 className='text-lg font-medium'>Backlog</h3>
                <p className='text-sm text-muted-foreground'>Schedule and view emails in backlog.</p>
            </div>
            <Separator className='mb-0' />
            <BacklogTable
                data={contacts}
                drafts={drafts}
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
                draftEmailFn={(row: Contact) => {
                    if (!(template && resumeURL)) {
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
                    } else {
                        if (row.email in drafts) setDraft(drafts[row.email]);
                        setSelectedDraftRow(row);
                    }
                }}
                isLoading={loading}
                refreshNotionDataFn={getSetData}
            />
        </div>
    );
};

export default BacklogPage;
