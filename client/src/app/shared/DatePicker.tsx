import { useState } from "react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
    value?: string;
    onChange: (v: string) => void;
    error?: boolean;
};

export default function DatePickerField({ value, onChange, error }: Props) {
    const [open, setOpen] = useState(false);
    const dateValue = value ? new Date(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" type="button" data-empty={!dateValue}
                    className={`w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground bg-white ${error ? "border-red-400" : "border-gray-200"}`}
                >
                    {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Επιλέξτε ημερομηνία</span>}
                    <CalendarIcon className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white border outline-0 ring-0" align="start">
                <Calendar
                    mode="single"
                    required
                    selected={dateValue}
                    onSelect={(d) => {
                        if (d) onChange(format(d, "yyyy-MM-dd"));
                        setOpen(false);
                    }}
                    defaultMonth={dateValue}
                    captionLayout="dropdown"
                    locale={el}
                    className="border-0 rounded-lg"
                    classNames={{
                        day_button: "hover:bg-neutral-100 rounded-md transition-colors cursor-pointer",
                        selected: "bg-[#0F766E] text-white rounded-md [&_button]:bg-[#0F766E] [&_button]:text-white [&_button]:hover:bg-[#0F766E]",
                        today: "font-bold text-[#0F766E]",
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}