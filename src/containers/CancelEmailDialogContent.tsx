'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';

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

export function CancelEmailForm({
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

    const cancelEmailSubmit = async () => {
        const requestBody = {
            action: 'DELETE',
            triggerID: row.trigger_id,
        };
        try {
            setSubmitLoading(true);
            setGuardRails(true);
            const { data } = await axios.post(import.meta.env.VITE_APPS_SCRIPT_URL, requestBody, {
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
            });
            if (!data.success) {
                console.log(data);
                toast({
                    title: 'Something went wrong!',
                    description: "Your email couldn't be cancelled. Please try again later.",
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: `Email Cancelled!`,
                    description: 'Your email has been cancelled.',
                });
            }
            setGuardRails(false);
            setSubmitLoading(false);
            refreshDBData();
            close();
        } catch (error) {
            setGuardRails(false);
            toast({
                title: 'Something went wrong!',
                description: "Your email couldn't be cancelled. Please try again later.",
                variant: 'destructive',
            });
        }
    };

    return (
        <div className='flex flex-row gap-2'>
            <Button
                onClick={() => close()}
                disabled={submitLoading}
                aria-disabled={submitLoading}
                className='w-full'
                variant='secondary'
            >
                Nevermind
            </Button>
            <Button onClick={() => cancelEmailSubmit()} className='w-full bg-rose-700' variant='destructive'>
                {!submitLoading && <Trash2Icon />}
                {!submitLoading ? "I'm sure!" : 'Cancelling'}
            </Button>
        </div>
    );
}
