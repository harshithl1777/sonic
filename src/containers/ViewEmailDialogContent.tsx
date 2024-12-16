import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

const formSchema = z.object({
    name: z.string(),
    email: z.string(),
    subject: z.string(),
    content: z.string(),
    status: z.string(),
    trigger_id: z.string(),
    created_at: z.date(),
    send_at: z.date().optional(),
    sent_at: z.date().optional(),
    lab_url: z.string(),
    university: z.string(),
});

export const ViewEmailDialogContent = ({ row, close }: { row: Row; close: Function }) => {
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) });

    return (
        <DialogContent className='p-8 w-fit'>
            <DialogHeader className=''>
                <DialogTitle>View Email</DialogTitle>
                <DialogDescription className='!mb-2'>
                    Below you'll be able to see the details of the previously{' '}
                    {row.status === 'PENDING' ? 'scheduled' : 'sent'} email.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className='space-y-4 w-[600px] mx-auto'>
                    <div className='grid grid-cols-12 gap-4'>
                        <div className={'col-span-6'}>
                            <FormField
                                name='email'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Email Address</Label>
                                        <FormControl>
                                            <Input
                                                disabled
                                                readOnly
                                                aria-readonly
                                                placeholder='shadcn'
                                                type=''
                                                {...field}
                                                value={row.email}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='col-span-6'>
                            <FormField
                                name='send_at'
                                control={form.control}
                                render={() => (
                                    <FormItem className=''>
                                        <FormLabel>{row.status === 'PENDING' ? 'Send At' : 'Sent At'}</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                onChange={() => {}}
                                                value={
                                                    row.status === 'PENDING'
                                                        ? new Date(row.send_at as string)
                                                        : new Date(row.send_at as string)
                                                }
                                                disabled
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <FormField
                        name='subject'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Input
                                    placeholder='shadcn'
                                    type=''
                                    {...field}
                                    value={row.subject as string}
                                    disabled
                                    readOnly
                                    aria-readonly
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name='content'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Body</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='Placeholder'
                                        className='resize-none h-[300px]'
                                        {...field}
                                        value={row.content}
                                        disabled
                                        readOnly
                                        aria-readonly
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button onClick={() => close()} className='w-full !mt-8'>
                        Close
                    </Button>
                </form>
            </Form>
        </DialogContent>
    );
};
