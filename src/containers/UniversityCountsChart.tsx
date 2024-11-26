'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type UniversityNames = 'Waterloo' | 'Toronto' | 'Western' | 'McMaster' | 'Laurier' | 'Queens' | 'Manitoba';
const universityColors = {
    Waterloo: 'text-amber-500',
    Toronto: 'text-blue-500',
    Western: 'text-violet-500',
    McMaster: 'text-rose-500',
    Laurier: 'text-indigo-400',
    Queens: 'text-yellow-400',
    Manitoba: 'text-amber-700',
};

export function UniversityCountsChart({
    data,
}: {
    data: {
        Waterloo: number;
        Toronto: number;
        McMaster: number;
        Laurier: number;
        Manitoba: number;
        Western: number;
        Queens: number;
    };
}) {
    return (
        <Card className='w-full h-[143px]'>
            <CardHeader className='!pb-0 !pt-4'>
                <h3 className='text-sm font-semibold text-slate-400'>University Counts</h3>
            </CardHeader>
            <CardContent className='p-0 flex flex-row !mt-2'>
                <div>
                    {Object.entries(data)
                        .slice(0, 4)
                        .map(([university, count]) => (
                            <li key={university} className='ml-2 flex w-[150px] items-center px-4 py-0'>
                                <span
                                    className={`font-medium text-sm ${universityColors[university as UniversityNames]}`}
                                >
                                    {university}
                                </span>
                                <span className='text-sm text-slate-400 ml-auto block'>{count}</span>
                            </li>
                        ))}
                </div>
                <div>
                    {Object.entries(data)
                        .slice(4, 8)
                        .map(([university, count]) => (
                            <li key={university} className='flex gap-8 w-[150px] items-center px-4'>
                                <span
                                    className={`font-medium text-sm ${universityColors[university as UniversityNames]}`}
                                >
                                    {university}
                                </span>
                                <span className='text-sm text-slate-400 ml-auto block'>{count}</span>
                            </li>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}
