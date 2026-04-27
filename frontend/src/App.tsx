import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { SessionProvider } from './context/SessionContext.js'
import { SongsProvider } from './context/SongsContext.js'
import { ParticipantsProvider } from './context/ParticipantsContext.js'
// import { Toaster } from "@/components/ui/toaster.js"  // TODO: copy to src when needed

// Pages - add more as you create them
import AdminLoginPage from './pages/AdminLoginPage.js'
import PublicKaraokePage from './pages/PublicKaraokePage.js'
import QRCodeFullPage from './pages/QRCodeFullPage.js'
// import Layout from "@/pages/Layout.js"
// import Karaoke from "@/pages/Karaoke.js"
// import ApiTest from "@/pages/ApiTest.js"
// import PublicKaraoke from "@/pages/PublicKaraPage.js"

function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        {/* Admin page needs all contexts */}
        <Route path="/" element={
          <SessionProvider>
            <SongsProvider>
              <ParticipantsProvider>
                <AdminLoginPage />
              </ParticipantsProvider>
            </SongsProvider>
          </SessionProvider>
        } />
        <Route path="/admin" element={
          <SessionProvider>
            <SongsProvider>
              <ParticipantsProvider>
                <AdminLoginPage />
              </ParticipantsProvider>
            </SongsProvider>
          </SessionProvider>
        } />
        <Route path="/public_session/:adminId" element={<PublicKaraokePage />} />
        <Route path="/public_session/:adminId/:sessionId" element={<PublicKaraokePage />} />
        <Route path="/qr/:adminId" element={<QRCodeFullPage />} />
        <Route path="/qr/:adminId/:sessionId" element={<QRCodeFullPage />} />

      </Routes>
      {/* <Toaster /> */}
    </Router>
  )
}

export default App
