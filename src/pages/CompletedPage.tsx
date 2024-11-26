import { useEffect } from 'react';
import { useState } from 'react';
import supabase from '@/config/supabase';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CompletedTable, Contact } from '@/containers/CompletedTable';
import { Separator } from '@/components/ui/separator';
import { ViewEmailDialogContent } from '@/containers/ViewEmailDialogContent';
import { Dialog } from '@radix-ui/react-dialog';

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

const CompletedPage = () => {
    const [rows, setRows] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Row | null>(null);

    useEffect(() => {
        getSetDBData();
    }, []);

    const getSetDBData = async () => {
        setLoading(true);
        const response = await supabase.from('emails').select('*').eq('status', 'COMPLETED');
        const formattedData = response.data!.map((item) => ({
            ...item,
            sentAt: dayjs(item.send_at).local().format('ddd, MMM D, YYYY @ h:mm A z'),
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
            <div>
                <h3 className='text-lg font-medium'>Completed</h3>
                <p className='text-sm text-muted-foreground'>View logs of previously sent emails.</p>
            </div>
            <Separator className='mb-0' />
            <CompletedTable
                data={rows}
                viewEmailFn={(row: Row) => setSelectedRow(row)}
                isLoading={loading}
                refreshDBDataFn={getSetDBData}
            />
        </div>
    );
};

export default CompletedPage;
