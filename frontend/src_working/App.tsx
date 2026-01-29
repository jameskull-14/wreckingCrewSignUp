import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
// import { Toaster } from "@/components/ui/toaster.js"  // TODO: copy to src_working when needed

// Pages - add more as you create them
import AdminPage from "./pages/AdminPage.js"
// import Layout from "@/pages/Layout.js"
// import Karaoke from "@/pages/Karaoke.js"
// import ApiTest from "@/pages/ApiTest.js"
// import PublicKaraoke from "@/pages/PublicKaraoke.js"

function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        {/* Add more routes as you create pages:
        <Route path="/karaoke" element={<Karaoke />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/public" element={<PublicKaraoke />} />
        */}
      </Routes>
      {/* <Toaster /> */}
    </Router>
  )
}

export default App
