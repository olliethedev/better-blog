import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import About from './about.tsx'
import NotFound from './not-found.tsx'
import {Provider} from './providers.tsx'
import BlogEntryPage from './BlogPage.tsx'
import './global.css'
import NavBar from './components/NavBar.tsx'




ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
  <Provider>
    <NavBar />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/about" element={<About />} />
      <Route path="/posts/*" element={<BlogEntryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Provider>
  </BrowserRouter>
)
