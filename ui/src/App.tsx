import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { AboutUsPage } from './pages/AboutUsPage'

function App() {
  return (
    <div id="wrapper" className="wrapper clearfix">
      <Header />
      <AboutUsPage />
      <Footer />
    </div>
  )
}

export default App
