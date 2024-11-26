'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CloudUpload, Loader2, Paperclip } from 'lucide-react';
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from '@/components/ui/file-upload';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/config/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
    name_3801899365: z.string(),
    name_4228888207: z.string(),
});

const RESUME_NAME = 'Apekshya_Pokharel_CV.pdf';

function formatBytes(bytes: number) {
    if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return bytes + ' Bytes';
    }
}

export default function SettingsForm() {
    const [files, setFiles] = useState<File[] | null>(null);
    const [fileChanged, setFileChanged] = useState(false);
    const [template, setTemplate] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchFile = async () => {
        const { data, error } = await supabase.storage.from('resumes').download(RESUME_NAME);
        if (error) {
            setFiles([]);
        } else {
            const file = new File([data as Blob], RESUME_NAME, {
                type: data!.type,
            });

            setFiles([file]);
        }
    };

    const fetchTemplate = async () => {
        const { data } = await supabase.from('global').select('*').eq('email', 'apekshyapokharel@gmail.com');
        if (data![0].template) setTemplate(data![0].template);
    };

    useEffect(() => {
        setLoading(true);
        fetchFile();
        fetchTemplate();
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const dropZoneConfig = {
        maxFiles: 1,
        maxSize: 1024 * 1024 * 25,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name_4228888207: template,
        },
    });

    async function onSubmit() {
        if (!files || !template) {
            toast({
                title: 'Incomplete form.',
                description: 'Some required values are empty.',
                variant: 'destructive',
            });
        } else {
            setLoading(true);
            if (fileChanged) {
                const resume = files[0];
                const resumeUploadResponse = await supabase.storage.from('resumes').upload(RESUME_NAME, resume, {
                    upsert: true,
                });

                if (resumeUploadResponse.error) {
                    toast({
                        title: 'Unable to save form.',
                        description: 'Something went wrong. Please try again later',
                        variant: 'destructive',
                    });
                }
            }
            const templateUpdateResponse = await supabase
                .from('global')
                .update({ template })
                .eq('email', 'apekshyapokharel@gmail.com');

            if (templateUpdateResponse.error) {
                toast({
                    title: 'Unable to save form.',
                    description: 'Something went wrong. Please try again later',
                    variant: 'destructive',
                });
            }
            fetchFile();
            fetchTemplate();
            setLoading(false);
            toast({ title: 'Saved!', description: 'Your changes have been saved successfully!' });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className='space-y-4 max-w-[910px] flex flex-col items-start'>
                <FormField
                    control={form.control}
                    name='name_3801899365'
                    render={() => (
                        <FormItem>
                            <FormLabel>Resume</FormLabel>
                            <FormControl>
                                {loading ? (
                                    <Skeleton className='w-[910px] h-20' />
                                ) : (
                                    <FileUploader
                                        value={files}
                                        onValueChange={(files) => {
                                            setFiles(files);
                                            setFileChanged(true);
                                        }}
                                        dropzoneOptions={dropZoneConfig}
                                        className='relative bg-background rounded-lg p-2 w-[910px]'
                                    >
                                        <FileInput
                                            id='fileInput'
                                            className='outline-dashed outline-1 outline-slate-500 w-[900px] h-[120px] flex items-center justify-center'
                                        >
                                            <div className='flex w-full items-center justify-center flex-col'>
                                                {files && files.length > 0 ? (
                                                    <>
                                                        <div className='flex items-center justify-center flex-col p-8 w-full '>
                                                            <Paperclip className='text-gray-500 h-6 w-6 stroke-current' />
                                                            <p className='mb-1 text-sm text-gray-500 dark:text-gray-400'>
                                                                <span className='font-semibold'>
                                                                    {files && files[0].name}
                                                                </span>
                                                            </p>
                                                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                                1 file of size {files && formatBytes(files[0].size)}{' '}
                                                                selected
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className='flex items-center justify-center flex-col p-8 w-full '>
                                                        <CloudUpload className='text-gray-500 w-10 h-10' />
                                                        <p className='mb-1 text-sm text-gray-500 dark:text-gray-400'>
                                                            <span className='font-semibold'>Click to upload</span>
                                                            &nbsp; or drag and drop
                                                        </p>
                                                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                            PDFs of max size 25 MB accepted
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </FileInput>
                                        <FileUploaderContent>
                                            {files &&
                                                files.length > 0 &&
                                                files.map((file, i) => (
                                                    <FileUploaderItem key={i} index={i}>
                                                        <Paperclip className='text-gray-400 h-4 w-4 stroke-current' />
                                                        <span className='text-gray-400'>{file.name}</span>
                                                    </FileUploaderItem>
                                                ))}
                                        </FileUploaderContent>
                                    </FileUploader>
                                )}
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='name_4228888207'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Template</FormLabel>
                            <FormDescription className='!mb-4'>
                                Wrap parameters in square braces (i.e [NAME]) to autofill details. To mark where
                                customizable content should be placed, use {'{CUSTOM}'}.
                            </FormDescription>
                            <FormControl>
                                {loading ? (
                                    <Skeleton className='w-[910px] h-48' />
                                ) : (
                                    <Textarea
                                        placeholder={`Dear Dr. [NAME], \n\nI'm really interested in your research at [UNIVERSITY]. Please take a look at my resume!\n\n{CUSTOM}\n\nRegards,\nApekshya
								`}
                                        className='h-[250px] w-[910px]'
                                        {...field}
                                        value={template}
                                        onChange={(e) => setTemplate(e.target.value)}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={loading} onClick={onSubmit} className='flex flex-row gap-2 ml-auto !mt-8'>
                    {loading && <Loader2 className='animate-spin' />}
                    {loading ? 'Saving' : 'Save'}
                </Button>
            </form>
        </Form>
    );
}
