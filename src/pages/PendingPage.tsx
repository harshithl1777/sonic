import { Contact, PendingTable } from '@/containers/PendingTable';
import { useEffect } from 'react';
import { useState } from 'react';
import supabase from '@/config/supabase';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Separator } from '@/components/ui/separator';
import { ViewEmailDialogContent } from '@/containers/ViewEmailDialogContent';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UpdateEmailForm } from '@/containers/UpdateEmailForm';
import { CancelEmailForm } from '@/containers/CancelEmailDialogContent';

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

const PendingPage = () => {
    const [rows, setRows] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Row | null>(null);
    const [selectedUpdateRow, setSelectedUpdateRow] = useState<Row | null>(null);
    const [selectedCancelRow, setSelectedCancelRow] = useState<Row | null>(null);
    const [guardRails, setGuardRails] = useState(false);

    useEffect(() => {
        getSetDBData();
    }, []);

    const getSetDBData = async () => {
        setLoading(true);
        const response = await supabase.from('emails').select('*').eq('status', 'PENDING');
        const formattedData = response.data!.map((item) => ({
            ...item,
            sendAt: dayjs(item.send_at).local().format('ddd, MMM D, YYYY @ h:mm A z'),
            labURL: item.lab_url,
        }));
        setRows(formattedData);
        setLoading(false);
    };

    return (
        <div className='ml-2 mr-2 mt-5 space-y-6'>
            <Dialog open={selectedRow !== null} onOpenChange={() => setSelectedRow(null)}>
                {selectedRow !== null && (
                    <ViewEmailDialogContent row={selectedRow as Row} close={() => setSelectedRow(null)} />
                )}
            </Dialog>
            <Dialog
                open={selectedUpdateRow !== null}
                onOpenChange={() => {
                    if (!guardRails) {
                        setSelectedUpdateRow(null);
                    }
                }}
            >
                {selectedUpdateRow !== null && (
                    <DialogContent className='p-8 w-fit'>
                        <DialogHeader className=''>
                            <DialogTitle>Update Email</DialogTitle>
                            <DialogDescription className='!mb-2'>
                                Edit any of the below details (other than the timestamp) prior to the scheduled sending
                                of your email.
                            </DialogDescription>
                        </DialogHeader>
                        <UpdateEmailForm
                            row={selectedUpdateRow}
                            close={() => setSelectedUpdateRow(null)}
                            setGuardRails={(value: boolean) => setGuardRails(value)}
                            refreshDBData={getSetDBData}
                        />
                    </DialogContent>
                )}
            </Dialog>
            <Dialog
                open={selectedCancelRow !== null}
                onOpenChange={() => {
                    if (!guardRails) {
                        setSelectedCancelRow(null);
                    }
                }}
            >
                {selectedCancelRow !== null && (
                    <DialogContent className='p-8 w-[400px]'>
                        <DialogHeader className=''>
                            <DialogTitle>Cancel Email</DialogTitle>
                            <DialogDescription className='!mb-2'>
                                Are you sure you want to cancel this email? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <CancelEmailForm
                            row={selectedCancelRow}
                            close={() => setSelectedCancelRow(null)}
                            setGuardRails={(value: boolean) => setGuardRails(value)}
                            refreshDBData={getSetDBData}
                        />
                    </DialogContent>
                )}
            </Dialog>
            <div>
                <h3 className='text-lg font-medium'>Scheduled</h3>
                <p className='text-sm text-muted-foreground'>View, edit, and cancel currently scheduled emails.</p>
            </div>
            <Separator className='mb-0' />
            <PendingTable
                data={rows}
                viewEmailFn={(row: Row) => setSelectedRow(row)}
                updateEmailFn={(row: Row) => setSelectedUpdateRow(row)}
                cancelEmailFn={(row: Row) => setSelectedCancelRow(row)}
                isLoading={loading}
                refreshDBDataFn={getSetDBData}
            />
        </div>
    );
};

export default PendingPage;
