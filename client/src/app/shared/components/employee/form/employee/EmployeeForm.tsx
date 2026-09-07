import { useEffect, useRef, useState } from "react";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import EmployeePersonalForm from "./EmployeePersonalForm";
import EmployeeServiceForm from "./EmployeeServiceForm";
import EmployeeExperienceForm from "./EmployeeExperienceForm";
import type { EmployeePersonalFormData } from "@/lib/schemas/newEmployeeForm/employeePersonalFormSchema";
import { emptyService } from "@/lib/schemas/newEmployeeForm/employeeServiceFormSchema";
import type { EmployeeExperienceFormData } from "@/lib/schemas/newEmployeeForm/employeeExperienceSchema";
import EmployeeChildrenForm from "./EmployeeChildrenForm";
import type { EmployeeChildrenFormData } from "@/lib/schemas/newEmployeeForm/employeeChildrenFormSchema";
import type { EmployeeStudiesFormData } from "@/lib/schemas/newEmployeeForm/employeeStudyFormSchema";
import EmployeeStudiesForm from "./EmployeeStudiesForm";
import type { EmployeeStepHandle } from "@/lib/types/employeeFormTypes";
import { useEmployee } from "@/lib/hooks/useEmployee";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";

const emptyPersonal = { firstName: "", lastName: "", birthDate: "1900-01-01", fatherName: "", motherName: "", familyStatus: "0",
    address: "", addressNumber: "", postCode: "", city: "", phone: "", email: "",
    identityCardNumber: "", identityCardIssueDate: "1900-01-01", citizenship: "", nationality: "", afm: "", amka: "",
    ama: "", personalNumber: "", doy: "0", iban1: "", iban2: "",
}

const steps = [
    { id: "personal", title: "Προσωπικά στοιχεία" },
    { id: "service", title: "Υπηρεσιακά στοιχεία" },
    { id: "experience", title: "Προϋπηρεσία" },
    { id: "children", title: "Τέκνα" },
    { id: "studies", title: "Σπουδές" },
];

const initialEmployee = {
    personal: emptyPersonal as EmployeePersonalFormData,
    service: emptyService,
    experience: [] as EmployeeExperienceFormData[],
    children: [] as EmployeeChildrenFormData[],
    studies: [] as EmployeeStudiesFormData[],
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeForm() {
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

    const [step, setStep] = useState(0);
    const [employee, setEmployee] = useState(initialEmployee);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const handleBackToList = () => {
        navigate('/employeeList');
    };

    const stepRef = useRef<EmployeeStepHandle>(null);

    const stepKeys = ["personal", "service", "experience", "children", "studies"] as const;

    const renderStep = () => {
        switch (step) {
            case 0: return <EmployeePersonalForm ref={stepRef} data={employee.personal} />;
            case 1: return <EmployeeServiceForm ref={stepRef} data={employee.service} />;
            case 2: return <EmployeeExperienceForm ref={stepRef} data={employee.experience} />;
            case 3: return <EmployeeChildrenForm ref={stepRef} data={employee.children} />;
            case 4: return <EmployeeStudiesForm ref={stepRef} data={employee.studies} />;
            default: return null;
        }
    };

    // Επιστρέφει το ενημερωμένο employee αν το τρέχον βήμα είναι valid (και σώζει τα δεδομένα
    // στο central state), αλλιώς null. Επιστρέφει το ίδιο το αντικείμενο (όχι μόνο boolean) ώστε
    // ο caller να μην εξαρτάται από το `employee` state, που ενημερώνεται ασύγχρονα μέσω setEmployee.
    const commitCurrentStep = async () => {
        if (!stepRef.current) return employee;
        const values = await stepRef.current.validate();
        if (!values) return null;
        const updated = { ...employee, [stepKeys[step]]: values };
        setEmployee(updated);
        return updated;
    };

    // Σώζει την τρέχουσα (μη-validated) κατάσταση του βήματος στο central state πριν το unmount,
    // ώστε να μη χάνονται μερικώς συμπληρωμένα πεδία (χρησιμοποιείται για backward navigation)
    const saveCurrentStepSnapshot = () => {
        if (!stepRef.current) return;
        const values = stepRef.current.getSnapshot();
        setEmployee((prev) => ({ ...prev, [stepKeys[step]]: values }));
    };

    const goNext = async () => {
        const ok = await commitCurrentStep();
        if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
    };

    const goPrev = () => {
        // backward navigation δεν χρειάζεται validation, αλλά πρέπει να σώσει τα δεδομένα του βήματος πριν το unmount
        saveCurrentStepSnapshot();
        setStep((s) => Math.max(s - 1, 0));
    };

    const goToStep = async (target: number) => {
        if (target <= step) {
            saveCurrentStepSnapshot();
            setStep(target);
            return;
        }
        const ok = await commitCurrentStep();
        if (ok) setStep(target);
    };

    const { addFullEmployee } = useEmployee({});

    const handleSubmit = async () => {
        const committed = await commitCurrentStep();
        if (!committed) return;
        setSubmitting(true);

        addFullEmployee(committed, {
            onSuccess: () => {
                showSuccessToast("Ο υπάλληλος καταχωρήθηκε με επιτυχία");
                setSubmitting(false);
                navigate('/employeeList');
            },
            onError: (error) => {
                showErrorToast("Σφάλμα κατά την καταχώρηση του υπαλλήλου");
                console.error(error);
                setSubmitting(false);
            },
        });
    };

    const isLastStep = step === steps.length - 1;

    return (
        <div style={{ zoom: scale }}>
            <div className="w-full flex flex-col items-start px-6 -mt-3.5">
                <Button variant="ghost" onClick={handleBackToList} className="text-gray-700 hover:text-gray-500!">
                    <ArrowLeftIcon />
                    Πίσω στη λίστα
                </Button>
            </div>
            <div className="w-full max-w-none mt-10">
                <Stepper steps={steps} currentStep={step} onStepClick={goToStep} />
                <div className="mt-10">
                    {renderStep()}
                </div>
                <div className="mt-6 flex gap-4 justify-end mr-6">
                    <Button disabled={step === 0} onClick={goPrev}
                        variant="default" type="button"
                        className="transition-all duration-200 hover:opacity-80 w-auto border border-neutral-200 bg-white px-4 py-2 rounded-md hover:bg-neutral-100 flex items-center gap-2"
                    >
                        Προηγούμενο
                    </Button>
                    <Button
                        onClick={isLastStep ? handleSubmit : goNext}
                        disabled={submitting}
                        variant="default" type="button" className="transition-all duration-200 hover:opacity-80 w-auto"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'var(--color-primary-foreground)',
                        }}
                    >
                        {isLastStep ? "Προσθήκη υπαλλήλου" : "Επόμενο"}
                    </Button>
                </div>
            </div>
        </div>
    );
}