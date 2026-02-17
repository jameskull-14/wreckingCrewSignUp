import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { SessionProvider } from './context/SessionContext.js'
import { SongsProvider } from './context/SongsContext.js'
import { ParticipantsProvider } from './context/ParticipantsContext.js'
// import { Toaster } from "@/components/ui/toaster.js"  // TODO: copy to src_working when needed

// Pages - add more as you create them
import AdminLoginPage from './pages/AdminLoginPage.js'
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
        {/* Public pages might only need some contexts:
        <Route path="/public" element={
          <SessionProvider>
            <ParticipantsProvider>
              <PublicKaraoke />
            </ParticipantsProvider>
          </SessionProvider>
        } />
        */}
      </Routes>
      {/* <Toaster /> */}
    </Router>
  )
}

export default App
