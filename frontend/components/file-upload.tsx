"use client"

import { useState, useRef } from "react"
import { UploadCloud, File as FileIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (file: File) => {
        if (file.name.endsWith(".vcf") || file.name.endsWith(".vcf.gz")) {
            setSelectedFile(file)
            onFileSelect(file)
        } else {
            alert("Please upload a valid .vcf file")
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        onFileSelect(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    const onButtonClick = () => {
        inputRef.current?.click()
    }

    return (
        <div className="w-full max-w-xl mx-auto">
            {!selectedFile ? (
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        dragActive ? "border-emerald-500 bg-emerald-50/10" : "border-gray-300 hover:bg-gray-50/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={onButtonClick}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">VCF files only (max 5MB)</p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                        accept=".vcf,.vcf.gz"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <FileIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                        <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
                    </Button>
                </div>
            )}
        </div>
    )
}
