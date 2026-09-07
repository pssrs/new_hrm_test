import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
    id: string;
    title: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (index: number) => void;
    className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
    return (
        <div className={cn("w-full overflow-x-auto", className)}>
            <div className="flex min-w-max items-start justify-center gap-16 px-4">
                {steps.map((step, index) => {
                    const completed = index < currentStep;
                    const active = index === currentStep;

                    return (
                        <div key={step.id} className="relative flex w-36 flex-col items-center" >
                            {/* Connector */}
                            {index !== steps.length - 1 && (
                                <div className="absolute top-5 left-22.5 w-30 pl-10">
                                    <div className={cn("h-[2px] rounded-full", "bg-gray-200")} />
                                </div>
                            )}

                            {/* Circle */}
                            <button
                                type="button"
                                onClick={() => onStepClick?.(index)}
                                className={cn(
                                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold transition-all duration-200",
                                completed &&
                                    "border-emerald-500 bg-emerald-500 text-white",
                                active &&
                                    "border-emerald-500 bg-white text-emerald-600 shadow-sm",
                                !completed &&
                                    !active &&
                                    "border-gray-300 text-gray-500",
                                onStepClick &&
                                    "cursor-pointer hover:scale-105 active:scale-95"
                                )}
                            >
                                {completed ? (
                                    <Check className="h-5 w-5" />
                                    ) : (
                                    index + 1
                                )}
                            </button>

                            {/* Title */}
                            <span className={cn( "mt-4 text-center text-sm font-medium leading-5",
                                active || completed
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}