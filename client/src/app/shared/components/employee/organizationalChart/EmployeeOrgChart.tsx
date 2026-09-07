import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeOrgList from './EmployeeOrgList';
import EmployeeSpecialtyList from './EmployeeSpecialtyList';
import EmployeePositionsList from './EmployeePositionsList';
import EmployeeTreeView from './EmployeeTreeView';

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeOrgChart() {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const raw = Math.min(1, Math.max(MIN_SCALE, window.innerWidth / REFERENCE_WIDTH));
            const stepped = Math.round(raw * 20) / 20;
            setScale(stepped);
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const [activeTab, setActiveTab] = useState('tree');
    const pageTitle = 'Οργανόγραμμα';

    return (
        <div title={pageTitle} style={{ zoom: scale }} className='p-8'>
            <div className='flex items-center justify-between -mt-8'>
                <h2 className='text-xl font-semibold text-neutral-900'>Οργανόγραμμα</h2>
            </div>
            <Separator className="my-4 bg-neutral-200" />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-0">
                <TabsList variant="line" className="flex-wrap h-auto justify-start rounded-none p-0 bg-transparent border-gray-300 border-b-2">
                    <TabsTrigger value="tree" className="transition-all duration-200 px-4 py-3 rounded-none border-b-2">
                        Οργανόγραμμα
                    </TabsTrigger>
                    <TabsTrigger value="org" className="transition-all duration-200 px-4 py-3 rounded-none border-b-2">
                        Λίστα υπαλλήλων
                    </TabsTrigger>
                    <TabsTrigger value="specialty" className="transition-all duration-200 px-4 py-3 rounded-none border-b-2">
                        Κλάδοι/Ειδικότητες
                    </TabsTrigger>
                    <TabsTrigger value="positions" className="transition-all duration-200 px-4 py-3 rounded-none border-b-2">
                        Πληρότητα θέσεων
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tree">
                    <EmployeeTreeView />
                </TabsContent>
                <TabsContent value="org">
                    <EmployeeOrgList />
                </TabsContent>
                <TabsContent value="specialty">
                    <EmployeeSpecialtyList />
                </TabsContent>
                <TabsContent value="positions">
                    <EmployeePositionsList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
