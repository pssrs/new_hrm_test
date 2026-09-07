import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useEmployee } from "../../../../lib/hooks/useEmployee";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EmployeePersonalInfo from "./tabs/EmployeePersonalInfo";
import EmployeeServiceInfo from "./tabs/EmployeeServiceInfo";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, Loader2, Building2Icon, FilePlusIcon, ArrowLeftIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useValues } from "@/lib/hooks/useValues";
import EmployeeExperience from "./tabs/EmployeeExperience";
import EmployeePenalty from "./tabs/EmployeePenalty";
import EmployeeMove from "./tabs/EmployeeMove";
import EmployeeChildren from "./tabs/EmployeeChildren";
import EmployeeStudies from "./tabs/EmployeeStudies";
import EmployeeLeave from "./tabs/EmployeeLeave";
import EmployeeChanges from "./tabs/EmployeeChanges";
import EmployeeFiles from "./tabs/EmployeeFiles";
import EmployeePlacements from "./tabs/EmployeePlacements";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeTab() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<string>('Προσωπικά');
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
    const { eidikothtes } = useValues();
    const { deleteEmployee, downloadWorkReport, downloadAtomikoDeltioKataxis, downloadVevaiwshProuphresias, downloadVevaiwshAnarrotikhs, downloadDeltioYpiresiakonMetavolon } = useEmployee({id});

    
    const { employeeCard, isLoadingEmployee } = useEmployee({ id });

    const handleDownloadWorkReport = async () => {
        if (!employeeCard?.id) return;

        try {
            const blob = await downloadWorkReport(employeeCard.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Vevaiosi_Ergasias.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showErrorToast("Σφάλμα κατά τη δημιουργία της βεβαίωσης εργασίας " + error);
        }
    };

    const handleDownloadAtomikoDeltioKataxis = async () => {
        if (!employeeCard?.id) return;

        try {
            const blob = await downloadAtomikoDeltioKataxis(employeeCard.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Atomiko_Deltio_Kataxis.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showErrorToast("Σφάλμα κατά τη δημιουργία του ατομικού δελτίου κατάταξης " + error);
        }
    };

    const handleDownloadVevaiwshProuphresias = async () => {
        if (!employeeCard?.id) return;
        console.log("handleDownloadVevaiwshProuphresias", employeeCard.id)
        try {
            const blob = await downloadVevaiwshProuphresias(employeeCard.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Vevaiwsh_Prouphresias.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showErrorToast("Σφάλμα κατά τη δημιουργία της βεβαίωσης προφέσσιον " + error);
        }
    };

    const handleDownloadVevaiwshAnarrotikhs = async () => {
        if (!employeeCard?.id) return;

        try {
            const blob = await downloadVevaiwshAnarrotikhs(employeeCard.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Vevaiwsh_Anarrotikhs.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showErrorToast("Σφάλμα κατά τη δημιουργία της βεβαίωσης αναρρωτικής " + error);
        }
    };

    const handleDownloadDeltioYpiresiakonMetavolon = async () => {
        if (!employeeCard?.id) return;

        try {
            const blob = await downloadDeltioYpiresiakonMetavolon(employeeCard.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Deltio_Ypiresiakon_Metavolon.docx";
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            showErrorToast("Σφάλμα κατά τη δημιουργία του δελτίου υπηρεσιακών μεταβολών " + error);
        }
    };

    const handleBackToList = () => {
      navigate('/employeeList');
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        deleteEmployee(id, {
            onSuccess: () => {showSuccessToast("Ο εργαζόμενος διαγράφηκε επιτυχώς!"); navigate('/employeeList');},
            onError: (error: Error) => {showErrorToast(error?.message || "Σφάλμα κατά τη διαγραφή του εργαζομένου");}
        });
    };

    if (isLoadingEmployee) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-14 h-14 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const getStatusChipProps = (state?: string, date?: string) => {

      if (state === '1' && date)
        return { label: 'Ενεργός', bg: '#dcfce7', color: '#166534' };
      else if (state === '2')
        return { label: 'Απόσταση', bg: '#dbeafe', color: '#0c4a6e' };
      else if (state === '3'                                                                                                                                       ) 
        return { label: 'Μετακίνηση', bg: '#f3e8ff', color: '#581c87' };
      else if (state === '4') 
        return { label: 'Ανενεργός', bg: '#fee2e2', color: '#7f1d1d' };
      else if (state === '5') 
        return { label: 'Μετάθεση', bg: '#fed7aa', color: '#92400e' };
      else if (state === '6') 
        return { label: 'Συνταξιοδότηση', bg: '#f5f5f4', color: '#292524' };
      else if (state === '7') 
        return { label: 'Ανάστολη', bg: '#fef3c7', color: '#92400e' };
      else
        return { label: state, bg: '#e5e7eb', color: '#6b7280' };
    };

  return (
    <div style={{ zoom: scale }}>
      <div className="bg-white w-full -mt-5.5">
        <div className="w-full flex flex-col items-start px-6 mt-2">
          <Button variant="ghost" onClick={handleBackToList} className="text-gray-700 hover:text-gray-500!">
            <ArrowLeftIcon />
            Πίσω στη λίστα
          </Button>
        </div>
        <Card className="bg-white w-full">
          <CardHeader>
            <div className="flex items-center justify-between w-full px-2 -mt-3">
              <div className="flex items-center bg-gray-200">
                <div className="flex flex-col bg-white border-l-4 border-l-gray-200 pl-4 rounded-l-full h-20">
                  <CardTitle className="text-xl font-semibold flex items-center pb-4 relative">
                      {employeeCard?.name}
                      <Button variant="ghost"><PencilIcon/></Button>
                      <Badge
                        variant="destructive"
                        style={{
                          backgroundColor: getStatusChipProps(employeeCard?.isActive?.toString(), employeeCard?.terminationDate).bg,
                          color: getStatusChipProps(employeeCard?.isActive?.toString(), employeeCard?.terminationDate).color,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          height: '24px',
                        }}
                      >
                        <div 
                          className="flex items-center justify-center w-3 h-3 rounded-full shrink-0"
                          style={{ borderWidth: '1.5px', borderColor: getStatusChipProps(employeeCard?.isActive?.toString(), employeeCard?.terminationDate).color }}
                        >
                            <div 
                              className="w-0.5 h-0.5 rounded-full"
                              style={{ backgroundColor: getStatusChipProps(employeeCard?.isActive?.toString(), employeeCard?.terminationDate).color }}
                            />
                        </div>
                        {getStatusChipProps(employeeCard?.isActive?.toString(), employeeCard?.terminationDate).label}
                      </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-gray-600">
                    <span>{'ΑΜ ' + employeeCard?.am + '  ·  ' + (eidikothtes.find(e => e.code === employeeCard?.specialty)?.description || "-") + '  ·'}</span>
                    <Building2Icon className="inline-block w-4 h-4" />
                    <span>{employeeCard?.department}</span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="-mt-6 -mr-1 text-red-600 hover:bg-red-100!"
                  onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον εργαζόμενο;")) {
                          handleDelete(e, employeeCard?.id as number);
                      }
                  }}
                 >
                    <Trash2Icon className="w-4 h-4 mr-2"/>Διαγραφή
                 </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="-mt-6 -mr-1 border border-gray-300 hover:bg-gray-100!"
                    >
                       <FilePlusIcon className="w-4 h-4 mr-2"/>Νέα Αναφορά
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-neutral-200 outline-0 ring-0">
                    {["Βεβαίωση Εργασίας", "Βεβαίωση Προϋπηρεσίας", "Βεβαίωση Αναρρωτικής Άδειας", "Ατομικού Δελτίο Κατάταξης", "Υπηρεσιακές Μεταβολές"].map((label) => (
                      <DropdownMenuItem
                        key={label}
                        className="hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          if (label === "Βεβαίωση Εργασίας") {
                            handleDownloadWorkReport();
                          }
                          if (label === "Ατομικού Δελτίο Κατάταξης") {
                            handleDownloadAtomikoDeltioKataxis();
                          }
                          if (label === "Βεβαίωση Αναρρωτικής Άδειας") {
                            handleDownloadVevaiwshAnarrotikhs();
                          }
                          if (label === "Βεβαίωση Προϋπηρεσίας") {
                            handleDownloadVevaiwshProuphresias();
                          }
                          if (label === "Υπηρεσιακές Μεταβολές") {
                            handleDownloadDeltioYpiresiakonMetavolon();
                          }
                        }}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
      <div className="px-8 w-full flex flex-col -mt-8">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-0">
          <TabsList variant="line" className="flex-wrap h-auto justify-start rounded-none p-0 bg-transparent border-gray-300 mt-10 border-b-2">
            {['Προσωπικά','Υπηρεσιακά','Άδειες','Ποινές','Προυπηρεσία','Τέκνα','Τοποθετήσεις','Μετακινήσεις','Σπουδές','Αρχεία','Μεταβολές'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className=" transition-all duration-200 px-4 py-3 rounded-none border-b-2"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="Προσωπικά">
            <EmployeePersonalInfo employeeId={employeeCard?.id} />
          </TabsContent>
          <TabsContent value="Υπηρεσιακά">
            <EmployeeServiceInfo id={employeeCard?.id?.toString() ?? ''} />
          </TabsContent>
          <TabsContent value="Προυπηρεσία">
            <EmployeeExperience />
          </TabsContent>
          <TabsContent value="Ποινές">
            <EmployeePenalty />
          </TabsContent>
          <TabsContent value="Μετακινήσεις">
            <EmployeeMove />
          </TabsContent>
          <TabsContent value="Τέκνα">
            <EmployeeChildren />
          </TabsContent>
          <TabsContent value="Σπουδές">
            <EmployeeStudies />
          </TabsContent>
          <TabsContent value="Άδειες">
            <EmployeeLeave />
          </TabsContent>
          <TabsContent value="Τοποθετήσεις">
            <EmployeePlacements />
          </TabsContent>
          <TabsContent value="Αρχεία">
            <EmployeeFiles />
          </TabsContent>
          <TabsContent value="Μεταβολές">
            <EmployeeChanges />
          </TabsContent>
          {/* <TabsContent value="Αναφορές">
            <EmployeeReports />
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
