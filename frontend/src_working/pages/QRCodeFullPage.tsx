import React from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeFullPage() {
    const { adminId, sessionId } = useParams<{ adminId: string; sessionId: string }>();
    const signupUrl = `${window.location.origin}/public_session/${adminId}/${sessionId}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-2xl">
                    <QRCodeSVG
                        value={signupUrl}
                        size={600}
                        level="H"
                        includeMargin={true}
                    />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        Scan to Join Karaoke
                    </h1>
                    <p className="text-xl text-gray-400">
                        {signupUrl}
                    </p>
                </div>
            </div>
        </div>
    );
}
