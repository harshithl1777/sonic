'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Switch } from '@/components/ui/switch';
import { Contact } from '@/containers/BacklogTable';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ChevronsUp, CloudUpload, Loader2, PartyPopper, Send } from 'lucide-react';
import axios from 'axios';

const formSchema = z.object({
    recipient: z.string(),
    subject: z.string(),
    body: z.string(),
    send_at: z.string(),
});

type Row = {
    name: string;
    email: string;
    subject: string;
    content: string;
    status: string;
    trigger_id: string;
    created_at: string;
    send_at?: string;
    sent_at?: string;
    lab_url: string;
    university: string;
};

export function UpdateEmailForm({
    row,
    close,
    refreshDBData,
    setGuardRails,
}: {
    row: Row;
    close: Function;
    refreshDBData: Function;
    setGuardRails: Function;
}) {
    const { toast } = useToast();
    const [submitLoading, setSubmitLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipient: row.email,
            subject: row.subject,
            body: row.content,
            send_at: row.send_at,
        },
    });

    const customContentRef = useRef<HTMLTextAreaElement>(null); // Create a ref for the customContent Textarea

    useEffect(() => {
        if (customContentRef.current) {
            customContentRef.current.focus();
        }
    }, []);

    const updateEmailSubmit = async () => {
        const formData = form.getValues();
        if (!formData.body || !formData.subject) {
            toast({
                title: 'Invalid Form',
                description: 'Some fields are missing. Please try again.',
                variant: 'destructive',
            });
        } else {
            const requestBody = {
                action: 'UPDATE',
                recipient: formData.recipient,
                subject: formData.subject,
                body: formData.body,
                triggerID: row.trigger_id,
            };

            try {
                setGuardRails(true);
                setSubmitLoading(true);
                const { data } = await axios.post(import.meta.env.VITE_APPS_SCRIPT_URL, requestBody, {
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                });
                if (!data.success) {
                    console.log(data);
                    toast({
                        title: 'Something went wrong!',
                        description: "Your email couldn't be updated. Please try again later.",
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: `Email Updated!`,
                        description: 'Your email has been updated.',
                    });
                }
                setGuardRails(false);
                setSubmitLoading(false);
                refreshDBData();
                close();
            } catch (error) {
                console.log(error);
                setGuardRails(false);
                toast({
                    title: 'Something went wrong!',
                    description: "Your email couldn't be updated. Please try again later.",
                    variant: 'destructive',
                });
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className='space-y-4 max-w-3xl mx-auto'>
                <>
                    <div className='grid grid-cols-12 gap-4'>
                        <div className='col-span-6'>
                            <FormField
                                control={form.control}
                                name='recipient'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled
                                                readOnly
                                                aria-disabled
                                                placeholder='shadcn'
                                                type=''
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='col-span-6'>
                            <FormField
                                control={form.control}
                                name='send_at'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Date & Time</FormLabel>
                                        <DateTimePicker
                                            onChange={() => {}}
                                            disabled
                                            value={new Date(form.getValues().send_at)}
                                        />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                        disabled={submitLoading}
                                        aria-disabled={submitLoading}
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
                                        disabled={submitLoading}
                                        aria-disabled={submitLoading}
                                        ref={customContentRef}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
                <div className='flex flex-row gap-2'>
                    <Button
                        onClick={() => close()}
                        disabled={submitLoading}
                        aria-disabled={submitLoading}
                        className='mr-auto block'
                        variant='secondary'
                    >
                        Close
                    </Button>
                    <Button
                        disabled={submitLoading}
                        aria-disabled={submitLoading}
                        onClick={() => updateEmailSubmit()}
                        className='ml-auto flex flex-row items-center'
                    >
                        {submitLoading ? 'Updating' : 'Update'}
                        {submitLoading && <Loader2 className='animate-spin' />}
                        {!submitLoading && <CloudUpload />}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
