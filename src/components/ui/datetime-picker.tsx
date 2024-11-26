'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function DateTimePicker({ disabled, onChange, value }: { disabled: boolean; onChange: Function; value: Date }) {
    const [date, setDate] = React.useState<Date>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate && selectedDate?.toDateString() === new Date().toDateString()) {
            selectedDate = new Date();
            selectedDate.setMinutes(selectedDate.getMinutes() + 5);

            const minutes = selectedDate.getMinutes();
            const roundedMinutes = Math.ceil(minutes / 5) * 5;
            selectedDate.setMinutes(roundedMinutes);
        }
        if (selectedDate) {
            setDate(selectedDate);
            onChange(selectedDate);
        }
    };

    const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', value: string) => {
        if (date) {
            const newDate = new Date(date);
            if (type === 'hour') {
                newDate.setHours((parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0));
            } else if (type === 'minute') {
                newDate.setMinutes(parseInt(value));
            } else if (type === 'ampm') {
                const currentHours = newDate.getHours();
                newDate.setHours(value === 'PM' ? currentHours + 12 : currentHours - 12);
            }
            setDate(newDate);
            onChange(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
                    disabled={disabled}
                >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, 'MM/dd/yyyy hh:mm aa') : <span>MM/DD/YYYY hh:mm aa</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='bg-slate-800 w-auto p-0'>
                <div className='sm:flex'>
                    <Calendar
                        mode='single'
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date.getTime() < new Date().setHours(0, 0, 0, 0)}
                    />
                    <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
                        <ScrollArea className='w-64 sm:w-auto'>
                            <div className='flex sm:flex-col p-2'>
                                {hours.reverse().map((hour) => {
                                    const isDisabled =
                                        date &&
                                        date.toDateString() === new Date().toDateString() &&
                                        new Date().getHours() % 12 > hour;

                                    return (
                                        <Button
                                            key={hour}
                                            size='icon'
                                            variant={date && date.getHours() % 12 === hour % 12 ? 'default' : 'ghost'}
                                            className='sm:w-full shrink-0 aspect-square'
                                            disabled={isDisabled}
                                            onClick={() => handleTimeChange('hour', hour.toString())}
                                        >
                                            {hour}
                                        </Button>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation='horizontal' className='sm:hidden' />
                        </ScrollArea>
                        <ScrollArea className='w-64 sm:w-auto'>
                            <div className='flex sm:flex-col p-2'>
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                                    const isDisabled =
                                        date &&
                                        date.toDateString() === new Date().toDateString() &&
                                        date.getHours() === new Date().getHours() &&
                                        date.getMinutes() > minute;

                                    return (
                                        <Button
                                            key={minute}
                                            size='icon'
                                            variant={date && date.getMinutes() === minute ? 'default' : 'ghost'}
                                            className='sm:w-full shrink-0 aspect-square'
                                            disabled={isDisabled}
                                            onClick={() => handleTimeChange('minute', minute.toString())}
                                        >
                                            {minute}
                                        </Button>
                                    );
                                })}
                            </div>
                            <ScrollBar orientation='horizontal' className='sm:hidden' />
                        </ScrollArea>
                        <ScrollArea className=''>
                            <div className='flex sm:flex-col p-2'>
                                {['AM', 'PM'].map((ampm) => {
                                    const isAMDisabled =
                                        date &&
                                        date.toDateString() === new Date().toDateString() &&
                                        new Date().getHours() >= 12;
                                    return (
                                        <Button
                                            key={ampm}
                                            size='icon'
                                            variant={
                                                date &&
                                                ((ampm === 'AM' && date.getHours() < 12 && !isAMDisabled) ||
                                                    (ampm === 'PM' && date.getHours() >= 12))
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            className='sm:w-full shrink-0 aspect-square'
                                            disabled={ampm === 'AM' && isAMDisabled}
                                            onClick={() => handleTimeChange('ampm', ampm)}
                                        >
                                            {ampm}
                                        </Button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}