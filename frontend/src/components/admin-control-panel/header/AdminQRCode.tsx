import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/Card.js";
import { Button } from "../../shared/Button.js";
import { QrCode, Maximize2 } from "lucide-react";

interface AdminQRCodeProps {
    adminId: number;
    onOpenFullPage?: (window: Window) => void;
}

export default function AdminQRCode({ adminId, onOpenFullPage }: AdminQRCodeProps) {
    const signupUrl = `${window.location.origin}/public_session/${adminId}`;

    const handleOpenFullPage = () => {
        const qrWindow = window.open(`/qr/${adminId}`, '_blank');
        if (qrWindow && onOpenFullPage) {
            onOpenFullPage(qrWindow);
        }
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
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                        <QRCodeSVG
                            value={signupUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
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
