import { cn } from '@/lib/utils';
import '@/components/ui/loader.css';

const Loader = ({ className }: { className?: string }) => {
    return <div className={cn('loader my-28 h-10 w-10 text-primary/60 animate-spin', className)} />;
};

export default Loader;
