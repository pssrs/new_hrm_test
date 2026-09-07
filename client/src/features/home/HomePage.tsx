import { SectionCards } from "@/app/shared/components/home/SectionCards";
import { SectionTables } from "@/app/shared/components/home/SectionTables";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/lib/hooks/useAccount";
import { PlusIcon, AlertCircle, XIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useDashboard } from "@/lib/hooks/useDashBoard";
import { showErrorToast } from "@/lib/utils/toastHelpers";

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAccount();
    const [showNotification, setShowNotification] = useState(true);
    const accessDeniedShownRef = useRef(false);
    const { dashboardCalendar, employeesChanges, employeesEndOfContract } = useDashboard({});
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const raw = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
            // Στρογγυλοποίηση σε βήματα του 0.05 ώστε να αποφεύγονται κλασματικές τιμές
            // zoom που μπερδεύουν τα CSS container queries (@container) στις κάρτες.
            const stepped = Math.round(raw * 20) / 20;
            setScale(stepped);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    useEffect(() => {
        if ((location.state as any)?.accessDenied && !accessDeniedShownRef.current) {
            showErrorToast('Δεν έχετε δικαίωμα πρόσβασης στη σελίδα που προσπαθήσατε να επισκεφθείτε!');
            accessDeniedShownRef.current = true;
        }
    }, [location.state]);
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    const getNotificationText = () => {
        const events: React.ReactNode[] = [];
        
        const upcomingChanges = employeesChanges && employeesChanges.filter(emp => emp.remainingDays <= 5 && emp.remainingDays >= 0);
        const upcomingEndOfContract = employeesEndOfContract && employeesEndOfContract.filter(emp => {
            const empDate = new Date(emp.date);
            return empDate >= today && empDate <= thirtyDaysLater;
        });
        
        const upcomingChildrenEventsList = dashboardCalendar && dashboardCalendar.filter(emp => emp.days <= 5 && emp.days >= 0);
        const hasEnhlikiwsh = upcomingChildrenEventsList && upcomingChildrenEventsList.some(event => event.event === 'Ενηλικίωση Τέκνου');
        const hasSpoudesCompletion = upcomingChildrenEventsList && upcomingChildrenEventsList.some(event => event.event === 'Ολοκλήρωση Σπουδών');
        
        const hasMKChange = upcomingChanges && upcomingChanges.some(emp => emp.changeType === '1');
        const hasRankChange = upcomingChanges && upcomingChanges.some(emp => emp.changeType === '2');
        const hasContractEnd = upcomingChanges && upcomingChanges.some(emp => emp.nextValue === 'Ληξη Σύμβασης');
        
        if (hasMKChange) events.push(<strong>αλλαγή μισθολογικού κλιμακίου</strong>);
        if (hasRankChange) events.push(<strong>αλλαγή βαθμού</strong>);
        if (hasContractEnd) events.push(<strong>λήξη σύμβασης</strong>);
        if (hasEnhlikiwsh) events.push(<strong>ενηλίκωση τέκνων</strong>);
        if (hasSpoudesCompletion) events.push(<strong>ολοκλήρωση σπουδών</strong>);
        if (upcomingEndOfContract && upcomingEndOfContract.length > 0) events.push(<strong>λήξη συμβάσεων</strong>);
        
        if (events.length === 0) return null;
        
        const eventElements = events.map((event, index) => (
            <span key={index}>
                {event}
                {index < events.length - 1 && ', '}
            </span>
        ));
        
        return (
            <>
                Στις επόμενες 5 μέρες υπάρχουν αναμενόμενα γεγονότα: {eventElements}. Ελέγξτε το ημερολόγιο και τις μεταβολές για περισσότερες λεπτομέρειες.
            </>
        );
    };
    
    const notificationText = getNotificationText();
    const shouldShowNotification = showNotification && notificationText !== null;

    return (
        <div style={{ zoom: scale }}>
            <div className='px-8 pb-13.5!'>
                <div className='flex items-center justify-between '>
                    <h2 className='text-xl font-semibold text-neutral-900'>Καλημέρα {user?.fullName || 'Χρήστης'}!</h2>
                    <Button 
                        variant="default"
                        type="submit"
                        onClick={() => navigate('/newemployee')}
                        className="transition-all duration-200 hover:opacity-80 w-auto"
                        style={{
                            display: 'flex',
                            height: 'var(--Height-H-10, 40px)',
                            padding: 'var(--Padding-Y-py-2, 8px) var(--Padding-X-px-4, 16px)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            borderRadius: 'var(--Radius-Rounded-Medium, 6px)',
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-foreground)', 
                        }}
                    >
                        <PlusIcon fontSize='small' />
                        Εισαγωγή Υπαλλήλου
                    </Button>
                </div>
                <Separator className="my-4 bg-gray-300" />
                {shouldShowNotification && (
                    <div className='mb-5 p-4 bg-[#fefce8] border border-[#d1baa0] rounded-lg flex items-start gap-3'>
                        <AlertCircle className='size-5 text-[#a47757] shrink-0 mt-0.5' />
                        <div className='flex-1'>
                            <h3 className='font-semibold text-[#81431e]'>Ειδοποίηση</h3>
                            <p className='text-sm text-[#81431e] mt-1'>{notificationText}</p>
                        </div>
                        <button 
                            onClick={() => setShowNotification(false)}
                            className='text-[#a47757] hover:text-[#81431e] shrink-0'
                        >
                            <XIcon className='size-5' />
                        </button>
                    </div>
                )}
            </div>
            <SectionCards />
            <SectionTables />
        </div>
    );
}