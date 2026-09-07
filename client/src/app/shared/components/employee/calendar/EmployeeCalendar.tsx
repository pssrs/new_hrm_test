import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, CalendarClockIcon, ChevronLeftIcon, ChevronRightIcon, BringToFrontIcon } from "lucide-react";
import { DAY_LABELS, MONTH_NAMES, MONTH_TITLES } from "@/lib/types/constTypes";
import agent from "@/lib/api/agent";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toastHelpers";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployee } from "@/lib/hooks/useEmployee";

type CalendarEvent = {
    id: string | number;
    date: string | Date;
    title: string;
    personName?: string;
    childId?: number;
    am?: number;
    childFlag?: number;
};

const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase();
};

const REFERENCE_WIDTH = 1600;
const MIN_SCALE = 0.6;

export default function EmployeeCalendar() {

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

    const queryClient = useQueryClient();
    const { childrenCalendar } = useEmployee({});
    const events: CalendarEvent[] = (childrenCalendar ?? []).map((d, idx) => ({
        id: idx,
        date: d.date,
        title: d.event,
        personName: d.fullName,
        childId: d.childId,
        am: d.am,
        childFlag: d.childFlag,
    }));
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

    const firstDay = new Date(year, month - 1, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const eventsByDay = new Map<number, CalendarEvent[]>();
    events.forEach(e => {
        const d = new Date(e.date);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            const day = d.getDate();
            eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), e]);
        }
    });

    const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1),];
    while (cells.length % 7 !== 0) cells.push(null);

    const isToday = (day: number) => now.getDate() === day && now.getMonth() + 1 === month && now.getFullYear() === year;

    const goPrev = () => {
        setSelectedDay(null);
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const goNext = () => {
        setSelectedDay(null);
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

    return (
        <div style={{ zoom: scale }} className="p-8">
            <div className='flex items-center justify-between -mt-8'>
                <h2 className='text-xl font-semibold text-neutral-900'>{MONTH_TITLES[month - 1]} {year}</h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" type="button" className="h-8 w-8 cursor-pointer" onClick={goPrev}>
                        <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" type="button" className="h-8 w-8 cursor-pointer" onClick={goNext}>
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <Separator className="my-4 bg-neutral-200" />

            <div className="flex gap-6 mt-6 items-start">
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-7">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="py-2 text-center text-sm text-neutral-500">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 border-t border-l border-neutral-200">
                        {cells.map((day, idx) => {
                            const dayEvents = day ? (eventsByDay.get(day) ?? []) : [];
                            const visibleEvents = dayEvents.slice(0, 2);
                            const hiddenCount = dayEvents.length - visibleEvents.length;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => day && setSelectedDay(day)}
                                    className={`h-32 overflow-hidden border-r border-b border-neutral-200 p-1.5 transition-colors ${
                                        day ? "cursor-pointer hover:bg-neutral-50" : ""
                                    } ${selectedDay === day ? "bg-neutral-50 ring-1 ring-inset ring-neutral-300" : "bg-white"}`}
                                >
                                    {day && (
                                        <>
                                            <div className={`text-sm mb-1 ${isToday(day) ? "font-bold text-[#0F766E]" : "text-neutral-700"}`}>
                                                {day}
                                            </div>
                                            <div className="space-y-1">
                                                {visibleEvents.map(ev => (
                                                    <Popover key={ev.id}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="w-full text-left px-1.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                                                            >
                                                                <div className="text-xs font-semibold text-indigo-700 truncate">{ev.personName}</div>
                                                                <div className="text-[11px] text-indigo-600 truncate">{ev.title}</div>
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto min-w-[20rem] p-4 bg-neutral-900 border-0 rounded-xl shadow-lg" align="start">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 shrink-0 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-white">
                                                                    {getInitials(ev.personName)}
                                                                </div>
                                                                <span className="text-base font-semibold text-white">{ev.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-3 text-sm text-neutral-300">
                                                                <CalendarIcon className="w-4 h-4" />
                                                                {new Date(ev.date).getDate()} {MONTH_NAMES[new Date(ev.date).getMonth()]}, {new Date(ev.date).getFullYear()}
                                                            </div>
                                                            {ev.personName && (
                                                                <div className="mt-2 text-sm text-neutral-400">{ev.personName}</div>
                                                            )}
                                                        </PopoverContent>
                                                    </Popover>
                                                ))}

                                                {hiddenCount > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDay(day)}
                                                        className="w-full text-left px-1.5 text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
                                                        title={`${hiddenCount} ακόμη`}
                                                    >
                                                        …
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Πλαίσιο επιλεγμένης ημέρας */}
                <div className="w-80 shrink-0 rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-teal-50 flex items-center justify-center">
                            <CalendarClockIcon className="w-5 h-5 text-[#0F766E]" />
                        </div>
                        <h4 className="text-base font-semibold text-neutral-900">
                            {selectedDay
                                ? `${selectedDay} ${MONTH_NAMES[month - 1]} ${year}`
                                : "Επιλέξτε ημέρα"}
                        </h4>
                    </div>
                    <div className="mt-3 divide-y divide-neutral-200">
                        {selectedEvents.length === 0 ? (
                            <p className="py-4 text-sm text-neutral-500">
                                {selectedDay ? "Δεν υπάρχουν γεγονότα" : "Κάντε κλικ σε μια ημέρα του ημερολογίου"}
                            </p>
                        ) : (
                            selectedEvents.map(ev => (
                                <div key={ev.id} className="flex items-center gap-3 py-3">
                                    <div className="w-9 h-9 shrink-0 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-700">
                                        {getInitials(ev.personName)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-neutral-900 truncate">{ev.personName}</div>
                                        <div className="text-xs text-neutral-500 truncate">{ev.title}</div>
                                    </div>
                                    {ev.childFlag !== 1 && (
                                        <button
                                            onClick={async () => {
                                                if (!ev.childId) return;
                                                if (window.confirm("Είστε σίγουροι ότι θέλετε να εκτελέσετε αυτή τη μεταβολή και να μεταφερθεί στη μισθοδοσία;")) {
                                                    try {
                                                        await agent.put(`/empchildren/executeAdulthood/${ev.childId}`);
                                                        showSuccessToast("Η μεταβολή εκτελέστηκε και μεταφέρθηκε στη μισθοδοσία");
                                                        queryClient.invalidateQueries({ queryKey: ['childrenCalendar'] });
                                                    } catch (error) {
                                                        showErrorToast("Σφάλμα κατά την εκτέλεση της μεταβολής");
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-black hover:text-green-600 transition-colors"
                                            title="Εκτέλεση"
                                        >
                                            <BringToFrontIcon size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}