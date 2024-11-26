import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import supabase from '@/config/supabase';
import { EmailHistoryChart } from '@/containers/EmailHistoryChart';
import { UniversityCountsChart } from '@/containers/UniversityCountsChart';
import { CheckCheck, CircleFadingArrowUp, InboxIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type Record = {
    created_at: Date;
    status: 'EMAIL' | 'PENDING' | 'COMPLETED';
    university: string;
};

type DataMap = {
    [key: string]: {
        date: string;
        BACKLOG: number;
        SCHEDULED: number;
        COMPLETED: number;
    };
};

type formattedData = {
    date: string;
    BACKLOG: number;
    SCHEDULED: number;
    COMPLETED: number;
};

type UniversityNames = 'Waterloo' | 'Toronto' | 'Western' | 'McMaster' | 'Laurier' | 'Queens' | 'Manitoba';

const DashboardPage = () => {
    const [counts, setCounts] = useState({ backlog: 0, scheduled: 0, completed: 0 });
    const [organizedData, setOrganizedData] = useState<formattedData[] | null>(null);
    const [universityCounts, setUniversityCounts] = useState({
        Waterloo: 0,
        Toronto: 0,
        McMaster: 0,
        Laurier: 0,
        Manitoba: 0,
        Western: 0,
        Queens: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSetData();
    }, []);

    const organizeDataByDate = (backlog: Record[], scheduled: Record[], completed: Record[]) => {
        const dataMap: DataMap = {};

        const addToMap = (records: Record[], key: keyof (typeof dataMap)[string]) => {
            for (const record of records) {
                const dateKey = record.created_at.toISOString().split('T')[0];
                if (!dataMap[dateKey]) {
                    dataMap[dateKey] = { date: dateKey, BACKLOG: 0, SCHEDULED: 0, COMPLETED: 0 };
                }
                dataMap[dateKey][key]++;
            }
        };

        addToMap(backlog, 'BACKLOG');
        addToMap(scheduled, 'SCHEDULED');
        addToMap(completed, 'COMPLETED');

        return dataMap;
    };

    const generateDateRange = (days: number) => {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);

        const dates = [];
        let currentDate = new Date(startDate);
        while (currentDate <= today) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const generateFormattedData = (backlog: Record[], scheduled: Record[], completed: Record[]): formattedData[] => {
        let daysToSubtract = 90;

        const allDates = generateDateRange(daysToSubtract);
        const dataMap: DataMap = organizeDataByDate(backlog, scheduled, completed);

        return allDates.map((date) => {
            const dateString = date.toISOString().split('T')[0];
            return dataMap[dateString] || { date: dateString, BACKLOG: 0, SCHEDULED: 0, COMPLETED: 0 };
        });
    };

    const getSetData = async () => {
        setLoading(true);
        const backlogResponse = await supabase.functions.invoke(
            import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_NAME + '?status=Email',
            {
                method: 'POST',
            },
        );

        const universityCountsMap = {
            Waterloo: 0,
            Toronto: 0,
            McMaster: 0,
            Laurier: 0,
            Manitoba: 0,
            Western: 0,
            Queens: 0,
        };

        const backlogData: Record[] = backlogResponse.data.map((row: { createdAt: string; university: string }) => {
            universityCountsMap[row.university as UniversityNames]++;
            return {
                created_at: new Date(row.createdAt),
                status: 'BACKLOG',
                university: row.university,
            };
        });

        const { data } = await supabase.from('emails').select('created_at,status,university');

        const scheduledData: Record[] = [];
        const completedData: Record[] = [];

        data!.forEach(({ created_at, status, university }) => {
            if (status === 'PENDING') {
                completedData.push({ created_at: new Date(created_at), status, university });
            } else if (status === 'COMPLETED') {
                scheduledData.push({ created_at: new Date(created_at), status, university });
            }

            universityCountsMap[university as UniversityNames]++;
        });

        setCounts({ backlog: backlogData.length, scheduled: scheduledData.length, completed: completedData.length });

        const formattedData = generateFormattedData(backlogData, scheduledData, completedData);
        setOrganizedData(formattedData);
        setUniversityCounts(universityCountsMap);
        setLoading(false);
    };

    function getGreetingMessage() {
        const currentHour = new Date().getHours();

        let greeting;
        if (currentHour >= 5 && currentHour <= 8) {
            greeting = "Good morning Apekshya! You're up early today!";
        } else if (currentHour < 12) {
            greeting = 'Still good morning!. Hoping today is nice and sunny for you!';
        } else if (currentHour < 16) {
            greeting = "Good afternoon Apekshya! Hope you're having a nice day so far!";
        } else if (currentHour < 20) {
            greeting = "Good evening Apekshya! What're your dinner plans today?";
        } else if ((currentHour >= 20 && currentHour <= 23) || currentHour === 0) {
            greeting = 'Good night Apekshya! Have a good sleep!';
        } else if (currentHour >= 1) {
            greeting = "Woahh! You're up late Apekshya. Get some rest soon!";
        }

        return greeting;
    }

    return (
        <div className='ml-5 mt-5 space-y-6'>
            <div>
                <h3 className='text-lg font-medium'>Dashboard</h3>
                <p className='text-sm text-slate-500'>
                    <span className='text-slate-400'>{getGreetingMessage()}</span> P.S Feel free to check out your
                    cold-emailing stats below.
                </p>
            </div>
            <Separator />
            <div className='flex flex-row gap-4 w-full h-[150px]'>
                {!loading ? (
                    <Card className='dark:bg-slate-900 min-w-[300px] w-fit h-fit text-white'>
                        <CardHeader className='flex flex-row items-center gap-16'>
                            <div>
                                <CardTitle className='text-sm text-stone-700 dark:text-stone-400'>Backlog</CardTitle>
                                <h2 className='text-3xl mt-2 font-bold text-stone-700 dark:text-stone-200'>
                                    {counts.backlog}
                                    <span className='text-sm ml-1'> contacts</span>
                                </h2>
                                <p className='text-stone-400 text-md font-semibold mt-1'>Via Notion</p>
                            </div>
                            <InboxIcon size={40} className='text-stone-400' />
                        </CardHeader>
                    </Card>
                ) : (
                    <Skeleton className='w-full h-[150px]' />
                )}
                {!loading ? (
                    <Card className='dark:bg-slate-900 min-w-[250px] w-fit h-fit text-white'>
                        <CardHeader className='flex flex-row items-center gap-16'>
                            <div>
                                <CardTitle className='text-sm text-slate-700 dark:text-indigo-400'>Scheduled</CardTitle>
                                <h2 className='text-3xl mt-2 font-bold text-slate-700 dark:text-indigo-200'>
                                    {counts.completed}
                                    <span className='text-sm ml-1'> emails</span>
                                </h2>
                                <p className='text-indigo-400 text-md font-semibold mt-1'>Via DB</p>
                            </div>
                            <CircleFadingArrowUp size={40} className='text-indigo-500' />
                        </CardHeader>
                    </Card>
                ) : (
                    <Skeleton className='w-full h-[150px]' />
                )}
                {!loading ? (
                    <Card className='dark:bg-slate-900 min-w-[250px] w-fit h-fit text-white'>
                        <CardHeader className='flex flex-row items-center gap-16'>
                            <div>
                                <CardTitle className='text-sm text-slate-700 dark:text-teal-500'>Completed</CardTitle>
                                <h2 className='text-3xl mt-2 font-bold text-slate-700 dark:text-teal-100'>
                                    {counts.completed}
                                    <span className='text-sm ml-1'> emails</span>
                                </h2>
                                <p className='text-teal-500 text-md font-semibold mt-1'>Via DB</p>
                            </div>
                            <CheckCheck size={40} className='text-teal-500' />
                        </CardHeader>
                    </Card>
                ) : (
                    <Skeleton className='w-full h-[150px]' />
                )}
                {!loading ? (
                    <UniversityCountsChart data={universityCounts} />
                ) : (
                    <Skeleton className='w-full h-[150px]' />
                )}
            </div>
            {loading || organizedData === null ? (
                <Skeleton className='w-full h-[350px]' />
            ) : (
                <EmailHistoryChart chartData={organizedData} />
            )}
        </div>
    );
};

export default DashboardPage;
