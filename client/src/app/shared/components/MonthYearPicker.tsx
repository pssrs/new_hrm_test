import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const MONTHS = [
    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος",
    "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος",
    "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

const MONTHS_SHORT = [
    "Ιαν", "Φεβ", "Μάρ", "Απρ", "Μάι", "Ιούν",
    "Ιούλ", "Αύγ", "Σεπ", "Οκτ", "Νοέ", "Δεκ",
];

type MonthYearPickerProps = {
    value?: string;
    onChange?: (value: string, month: number, year: number) => void;
    placeholder?: string;
    className?: string;
};

export default function MonthYearPicker({
    value = "",
    onChange,
    placeholder = "ΜΜ/ΕΕΕΕ",
    className = "",
}: MonthYearPickerProps) {
    const now = new Date();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [viewYear, setViewYear] = useState(now.getFullYear());

    const parseValue = (v: string) => {
        const match = v.match(/^(\d{1,2})\/(\d{4})$/);
        if (!match) return null;
        const month = Number(match[1]);
        const year = Number(match[2]);
        if (month < 1 || month > 12) return null;
        if (year < 1900 || year > 2100) return null;
        return { month, year };
    };

    const parsed = parseValue(inputValue);

    useEffect(() => {
        setInputValue(value);
        const p = parseValue(value);
        if (p) setViewYear(p.year);
    }, [value]);

    const commit = (month: number, year: number) => {
        const formatted = `${String(month).padStart(2, "0")}/${year}`;
        setInputValue(formatted);
        onChange?.(formatted, month, year);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // επιτρέπουμε μόνο ψηφία και "/"
        const raw = e.target.value.replace(/[^\d/]/g, "");
        setInputValue(raw);

        const p = parseValue(raw);
        if (p) {
            setViewYear(p.year);
            onChange?.(raw, p.month, p.year);
        }
    };

    const handleInputBlur = () => {
        // αν άκυρο κατά το blur, καθάρισε ή επανάφερε
        if (inputValue && !parseValue(inputValue)) {
            setInputValue(value);
        }
    };

    const handleMonthSelect = (monthIdx: number) => {
        commit(monthIdx + 1, viewYear);
        setOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                inputMode="numeric"
                maxLength={7}
                className={`pr-10 bg-white ${inputValue && !parsed ? "border-red-400" : "border-gray-200"}`}
            />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-100 cursor-pointer"
                        aria-label="Άνοιγμα ημερολογίου"
                    >
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                    </button>
                </PopoverTrigger>

                <PopoverContent className="w-64 p-3 bg-white" align="end">
                    {/* Πλοήγηση έτους */}
                    <div className="flex items-center justify-between mb-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7"
                            onClick={() => setViewYear((y) => y - 1)}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </Button>

                        <span className="text-sm font-semibold">{viewYear}</span>

                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7"
                            onClick={() => setViewYear((y) => y + 1)}
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Grid μηνών */}
                    <div className="grid grid-cols-3 gap-1">
                        {MONTHS_SHORT.map((m, idx) => {
                            const isSelected = parsed?.month === idx + 1 && parsed?.year === viewYear;
                            const isCurrent = now.getMonth() === idx && now.getFullYear() === viewYear;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleMonthSelect(idx)}
                                    title={MONTHS[idx]}
                                    className={`
                                        text-sm py-2 rounded-md transition-colors cursor-pointer
                                        ${isSelected
                                            ? "text-white"
                                            : isCurrent
                                                ? "border border-neutral-300"
                                                : "hover:bg-neutral-100"}
                                    `}
                                    style={isSelected ? { background: "var(--color-primary)" } : undefined}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}