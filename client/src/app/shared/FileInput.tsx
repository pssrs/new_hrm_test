import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";

interface FileUploadProps {
    label: string;
    fileName?: string;
    required?: boolean;
    accept?: string;
    onChange: (file: File | null) => void;
}

export default function FileUpload({ label, fileName, required = false, accept, onChange }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    onChange(selected);
                }}
            />

            <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => inputRef.current?.click()}
            >
                <Upload className="mr-2 h-4 w-4" />
                Επιλογή αρχείου
            </Button>

            <div className="rounded-md border bg-muted/40 p-3 flex items-center gap-3 min-h-[56px]">
                <FileText className="h-5 w-5 text-primary" />

                <div className="flex-1 overflow-hidden">
                    {fileName ? (
                        <>
                            <p className="truncate font-medium">
                                {fileName}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Δεν έχει επιλεγεί αρχείο
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}