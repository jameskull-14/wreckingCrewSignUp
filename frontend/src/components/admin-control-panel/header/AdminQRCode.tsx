import React, { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/Card.js";
import { Button } from "../../shared/Button.js";
import { QrCode, Maximize2, RefreshCw, Download } from "lucide-react";

interface AdminQRCodeProps {
    adminId: number;
    onOpenFullPage?: (window: Window) => void;
}

export default function AdminQRCode({ adminId, onOpenFullPage }: AdminQRCodeProps) {
    const [versionKey, setVersionKey] = useState("");
    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    const signupUrl = `${window.location.origin}/public_session/${adminId}${versionKey ? `?v=${versionKey}` : ""}`;

    const handleRegenerate = () => {
        if (!confirm("Generate a new QR code? Anyone with the old QR code will need to scan the new one.")) return;
        setVersionKey(Math.random().toString(36).slice(2, 10));
    };

    const handleOpenFullPage = () => {
        const qrWindow = window.open(`/qr/${adminId}${versionKey ? `?v=${versionKey}` : ""}`, "_blank");
        if (qrWindow && onOpenFullPage) {
            onOpenFullPage(qrWindow);
        }
    };

    const handleDownloadPDF = () => {
        const canvas = canvasWrapperRef.current?.querySelector("canvas");
        if (!canvas) return;

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const qrSize = Math.min(pageWidth, pageHeight) * 0.8;
        const x = (pageWidth - qrSize) / 2;
        const y = (pageHeight - qrSize) / 2;

        pdf.addImage(imgData, "PNG", x, y, qrSize, qrSize);
        pdf.save("karaoke-qr-code.pdf");
    };

    return (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-amber-400/30">
            <CardHeader className="border-b border-amber-400/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-gray-900" />
                    </div>
                    <CardTitle className="text-lg font-bold text-white">
                        Session QR Code
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Hidden high-res canvas used solely for PDF generation */}
                <div ref={canvasWrapperRef} style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                    <QRCodeCanvas value={signupUrl} size={800} level="H" includeMargin={true} />
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <div className="relative inline-block">
                        <div className="bg-white p-4 rounded-lg">
                            <QRCodeSVG
                                value={signupUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <div className="absolute top-0 -right-12">
                            <div className="relative group">
                                <button
                                    onClick={handleRegenerate}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors shadow-lg border border-gray-600"
                                >
                                    <RefreshCw className="w-6 h-6" />
                                </button>
                                <span className="absolute right-0 top-full mt-1 px-2 py-1 text-xs text-white bg-gray-900 border border-gray-700 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    Generate New QR Code
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 text-center">
                        Scan to join the karaoke session
                    </p>
                    <a
                        href={signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 underline hover:text-blue-300 text-center break-all max-w-xs"
                    >
                        Public URL
                    </a>
                    <div className="relative group">
                        <Button
                            onClick={handleDownloadPDF}
                            className="bg-gray-700 hover:bg-gray-600 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download as PDF
                        </Button>
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 text-xs text-white bg-gray-900 border border-gray-700 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Download Full Page QR as PDF
                        </span>
                    </div>
                    <Button
                        onClick={handleOpenFullPage}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Open As Full Page
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
