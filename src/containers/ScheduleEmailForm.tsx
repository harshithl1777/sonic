'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Switch } from '@/components/ui/switch';
import { Contact } from '@/containers/BacklogTable';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper, Send } from 'lucide-react';
import axios from 'axios';

const formSchema = z.object({
    contactTitle: z.string(),
    universityName: z.string(),
    emailAddress: z.string(),
    subject: z.string(),
    customizedContent: z.string(),
    body: z.string(),
    sendAt: z.coerce.date(),
    sendImmediately: z.boolean(),
});

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

export default function ScheduleEmailForm({
    row,
    close,
    subject,
    template,
    draft,
    attachmentURL,
    setStage,
    stage,
    refreshNotionData,
    setGuardRails,
}: {
    row: Contact;
    close: Function;
    subject: string;
    attachmentURL: string;
    template: string;
    draft: string;
    setStage: Function;
    stage: number;
    refreshNotionData: Function;
    setGuardRails: Function;
}) {
    const { toast } = useToast();
    const [sendImmediately, setSendImmediately] = useState(false);
    const [previewData, setPreviewData] = useState<{
        name: string;
        recipient: string;
        subject: null | string;
        body: null | string;
        attachmentURL: string;
        send_at: Date | null;
        university: string;
        lab_url: string;
    }>({
        name: row.name,
        recipient: row.email,
        subject: subject,
        body: null,
        attachmentURL,
        send_at: null,
        university: row.university,
        lab_url: row.labURL,
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showCustomContentExample, setShowCustomContentExample] = useState(false);

    const customContentRef = useRef<HTMLTextAreaElement>(null); // Create a ref for the customContent Textarea

    useEffect(() => {
        if (stage === 0 && customContentRef.current) {
            customContentRef.current.focus();
        }
    }, [stage]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            contactTitle: 'Dr. ' + row.name.split(' ').at(-1),
            emailAddress: row.email,
            subject: subject,
            body: previewData.body as string,
            customizedContent: draft,
            universityName: universityDefaultNames[row.university as UniversityNames],
            sendImmediately: false,
        },
    });

    function fillPlaceholders(emailText: string, name: string, university: UniversityNames, customContent: string) {
        const lastName = name.split(' ').at(-1);
        const universityReplacement = universityDefaultNames[university];

        const namePattern = /\[NAME\]/g;
        const universityThePattern = /\b(?:the\s+)*\[UNIVERSITY\]/gi;
        const universityRegularPattern = /\[UNIVERSITY\]/g;
        const customPattern = /\{CUSTOM\}/g;

        const processedText = emailText
            .replace(customPattern, customContent)
            .replace(namePattern, `Dr. ${lastName}`)
            .replace(universityThePattern, universityReplacement)
            .replace(universityRegularPattern, universityReplacement)
            .trim();

        return processedText;
    }

    function stageZeroSubmit() {
        const formData = form.getValues();
        if ((!formData.sendAt && !formData.sendImmediately) || !formData.contactTitle || !formData.universityName) {
            toast({
                title: 'Invalid Form',
                description: 'Some fields are missing. Please try again.',
                variant: 'destructive',
            });
        } else if (
            previewData.send_at &&
            previewData.send_at!.getTime() <= new Date().setMinutes(new Date().getMinutes() + 2)
        ) {
            toast({
                title: 'Invalid Deliery Date',
                description: 'Your delivery date must be at least 2 minutes after the current time.',
                variant: 'destructive',
            });
        } else {
            setStage(1);
            const body = fillPlaceholders(
                template,
                row.name,
                row.university as UniversityNames,
                formData.customizedContent,
            );
            setPreviewData({ ...previewData, body, send_at: formData.sendAt });
            form.setValue('body', previewData.body as string);
        }
    }

    const scheduleOrSendEmailSubmit = async (action: 'CREATE' | 'SEND') => {
        const requestBody = {
            ...previewData,
            send_at: previewData.send_at?.toUTCString(),
            action,
        };

        setSubmitLoading(true);
        setGuardRails(true);
        try {
            const { data } = await axios.post(import.meta.env.VITE_APPS_SCRIPT_URL, requestBody, {
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            });
            if (!data.success) {
                toast({
                    title: 'Something went wrong!',
                    description: `Your email couldn't be ${
                        action === 'CREATE' ? 'scheduled' : 'sent'
                    }. Please try again later.`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: `Email ${action === 'CREATE' ? 'scheduled' : 'sent'}!`,
                    description: `Your email has been ${
                        action === 'CREATE' ? `scheduled for ${previewData.send_at?.toString()}` : 'sent'
                    }.`,
                });
            }
            setGuardRails(false);
            setSubmitLoading(false);
            refreshNotionData();
            close();
        } catch (error) {
            setGuardRails(false);
            toast({
                title: 'Something went wrong!',
                description: `Your email couldn't be ${
                    action === 'CREATE' ? 'scheduled' : 'sent'
                }. Please try again later.`,
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className='space-y-4 mx-auto  max-w-4xl'>
                {stage === 0 ? (
                    <>
                        <div className='grid grid-cols-12 gap-4'>
                            <div className='col-span-6'>
                                <FormField
                                    control={form.control}
                                    name='contactTitle'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder='shadcn' type='' {...field} />
                                            </FormControl>
                                            <FormDescription>How your email mentions the contact.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='col-span-6'>
                                <FormField
                                    control={form.control}
                                    name='universityName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>University Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder='shadcn' type='' {...field} />
                                            </FormControl>
                                            <FormDescription>How your email mentions the university.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name='customizedContent'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Enter your customized content here.'
                                            className='resize-none'
                                            {...field}
                                            value={form.getValues().customizedContent}
                                            ref={customContentRef}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {!showCustomContentExample ? (
                                            'You can add custom content personalized to the contact here.'
                                        ) : (
                                            <span className='text-slate-400 text-[13px]'>
                                                I read a few of your publications on polar bear BCIs and facial
                                                asymmetry recently. Specifically, I think it's incredibly interesting
                                                that facial asymmetry is an indicator of environmental stress,
                                                especially considering what this reveals about the effects of climate
                                                change. I’m really interested in getting involved with your research,
                                                especially as someone who’s hoping to pursue Wildlife Ecology.
                                            </span>
                                        )}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <Separator className='!mt-6' />

                        <div className='grid grid-cols-12 gap-4 !mt-6'>
                            <div className='col-span-6'>
                                <FormField
                                    control={form.control}
                                    name='sendAt'
                                    render={() => (
                                        <FormItem className='flex flex-col gap-1'>
                                            <FormLabel className={sendImmediately ? 'text-slate-500' : ''}>
                                                Delivery Date & Time
                                            </FormLabel>
                                            <DateTimePicker
                                                value={previewData.send_at as Date}
                                                disabled={sendImmediately}
                                                onChange={(value: Date) => {
                                                    setPreviewData({ ...previewData, send_at: value });
                                                    form.setValue('sendAt', value);
                                                }}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='col-span-6 mt-[-5px]'>
                                <FormField
                                    control={form.control}
                                    name='sendImmediately'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-center justify-between rounded-lg gap-2'>
                                            <div className='space-y-1'>
                                                <FormLabel className='text-rose-500'>Send Immediately?</FormLabel>
                                                <FormDescription>
                                                    If chosen, this email will be sent immediately without a scheduled
                                                    date.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    className='data-[state=checked]:bg-rose-500'
                                                    onCheckedChange={() => {
                                                        field.onChange(!sendImmediately);
                                                        setSendImmediately(!sendImmediately);
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className='flex flex-row gap-2 ml-auto !mt-8'>
                            <Button
                                variant='secondary'
                                onClick={() => setShowCustomContentExample(!showCustomContentExample)}
                            >
                                {!showCustomContentExample ? 'Show' : 'Hide'} Example
                            </Button>
                            <Button onClick={() => close()} className='ml-auto block' variant='secondary'>
                                Cancel
                            </Button>
                            <Button onClick={() => stageZeroSubmit()}>Next</Button>
                        </div>
                    </>
                ) : stage === 1 ? (
                    <>
                        <div className='grid grid-cols-12 gap-4'>
                            <div className={!sendImmediately ? 'col-span-6' : 'col-span-12'}>
                                <FormField
                                    control={form.control}
                                    name='emailAddress'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    readOnly
                                                    aria-readonly
                                                    placeholder='shadcn'
                                                    type=''
                                                    {...field}
                                                    value={previewData.recipient}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {!sendImmediately && (
                                <div className='col-span-6'>
                                    <FormField
                                        control={form.control}
                                        name='sendAt'
                                        render={() => (
                                            <FormItem className=''>
                                                <FormLabel className={sendImmediately ? 'text-slate-500' : ''}>
                                                    Delivery Date & Time
                                                </FormLabel>
                                                <DateTimePicker
                                                    onChange={() => {}}
                                                    value={previewData.send_at as Date}
                                                    disabled
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                        <FormField
                            control={form.control}
                            name='subject'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='shadcn'
                                            type=''
                                            {...field}
                                            value={previewData.subject as string}
                                            disabled={submitLoading}
                                            aria-disabled={submitLoading}
                                            onChange={(e) => {
                                                setPreviewData({ ...previewData, subject: e.target.value });
                                                form.setValue('subject', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='body'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='Placeholder'
                                            className='resize-none h-[300px]'
                                            {...field}
                                            value={previewData.body as string}
                                            disabled={submitLoading}
                                            aria-disabled={submitLoading}
                                            onChange={(e) => {
                                                setPreviewData({ ...previewData, body: e.target.value });
                                                form.setValue('body', e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex flex-row'>
                            <Button
                                onClick={() => setStage(0)}
                                disabled={submitLoading}
                                aria-disabled={submitLoading}
                                className='mr-auto block !mt-8'
                                variant='secondary'
                            >
                                Back
                            </Button>
                            <div className='flex flex-row gap-2 ml-auto !mt-8'>
                                <Button
                                    onClick={() => {
                                        if (
                                            !previewData.body ||
                                            !previewData.subject ||
                                            previewData.subject!.includes('{LAB}')
                                        ) {
                                            toast({
                                                title: 'Subject Lab Field Unfilled',
                                                description:
                                                    'You have not filled in the lab field in the subject. Please edit!',
                                                variant: 'destructive',
                                            });
                                        } else {
                                            if (sendImmediately) setStage(2);
                                            else scheduleOrSendEmailSubmit('CREATE');
                                        }
                                    }}
                                    disabled={submitLoading}
                                    aria-disabled={submitLoading}
                                >
                                    {submitLoading && <Loader2 className='animate-spin' />}
                                    {submitLoading && 'Scheduling'}
                                    {!sendImmediately && !submitLoading && <PartyPopper />}
                                    {!submitLoading && (sendImmediately ? 'Next' : 'Schedule')}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='flex flex-row gap-2'>
                        <Button
                            onClick={() => setStage(1)}
                            disabled={submitLoading}
                            aria-disabled={submitLoading}
                            className='w-full'
                            variant='secondary'
                        >
                            Back
                        </Button>
                        <Button
                            disabled={submitLoading}
                            aria-disabled={submitLoading}
                            onClick={() => scheduleOrSendEmailSubmit('SEND')}
                            className='w-full'
                        >
                            {submitLoading ? 'Sending' : 'Send'}
                            {submitLoading && <Loader2 className='animate-spin' />}
                            {!submitLoading && <Send />}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
