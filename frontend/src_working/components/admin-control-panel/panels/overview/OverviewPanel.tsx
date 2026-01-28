import React from "react";
import { Card, CardContent } from "../../../shared/Card";
import { Clock, Music, Users } from "lucide-react";

export default function OverviewPanel(){
    return(
        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card key="signed-up" className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{takenSlots.length}</div>
                      <div className="text-gray-400 text-sm">Signed Up</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card key="available" className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{timeSlots.length - takenSlots.length}</div>
                      <div className="text-gray-400 text-sm">Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card key="total-songs" className="bg-gray-800/50 border-amber-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Music className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{allSongs.length}</div>
                      <div className="text-gray-400 text-sm">Total Songs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Dialog key="qr-code">
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-full text-lg bg-gray-800/50 border-amber-400/20 hover:bg-gray-700/50 text-amber-300 hover:text-amber-200" disabled={!activeSession.is_active}>
                        <QrCode className="w-6 h-6 mr-3"/>
                        Show QR Code
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Scan to Join!</DialogTitle>
                    </DialogHeader>
                    {qrCodeUrl ? (
                        <div className="flex items-center justify-center p-4">
                            <img src={qrCodeUrl} alt="Karaoke Session QR Code" />
                        </div>
                    ) : (
                        <p className="text-gray-600">Session is not live. Launch the session to generate a QR code.</p>
                    )}
                </DialogContent>
              </Dialog>

            </div>
          </TabsContent>
    );
}