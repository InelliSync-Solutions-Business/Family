declare module '@/components/ui/dialog' {
    import * as React from 'react';
    import * as DialogPrimitive from '@radix-ui/react-dialog';

    export const Dialog: typeof DialogPrimitive.Root;
    export const DialogTrigger: typeof DialogPrimitive.Trigger;
    export const DialogContent: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>;
    export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    export const DialogTitle: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>;
    export const DialogDescription: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>;
}

declare module '@/components/ui/button' {
    const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }>; 
    export default Button;
}

declare module '@/components/ui/input' {
    const Input: React.FC<{ placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }>; 
    export default Input;
}

declare module '@/components/ui/textarea' {
    const Textarea: React.FC<{ placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }>; 
    export default Textarea;
}

declare module '@/components/ui/calendar' {
    const Calendar: React.FC;
    export default Calendar;
}

declare module '@/components/ui/badge' {
    const Badge: React.FC<{ text: string }>; 
    export default Badge;
}

declare module '@/components/ui/tabs' {
    const Tabs: React.FC<{ children: React.ReactNode }>; 
    export const TabsContent: React.FC<{ children: React.ReactNode }>; 
    export const TabsList: React.FC<{ children: React.ReactNode }>; 
    export const TabsTrigger: React.FC<{ onClick: () => void; children: React.ReactNode }>; 
    export default Tabs;
}
