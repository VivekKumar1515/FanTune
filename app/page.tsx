'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, Users, Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Appbar } from "./components/Appbar"
import { Provider } from "./Provider"
import { Redirect } from "./components/Redirect"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function LandingPage() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the email submission
    toast.success("Thanks for signing up! We'll be in touch soon.")
    setEmail("")
  }

  return (
    <Provider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1F2937] via-[#4B5563] to-[#111827] text-white">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Appbar />
        <Redirect />
        <main className="flex-1">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full py-12 md:py-24 lg:py-32 xl:py-48"
          >
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Let Your Fans Choose the Music
                </h1>
                <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl">
                  FanTune: Where creators and fans collaborate on the perfect stream playlist.
                </p>
                <Button className="bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-200">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.section>
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full py-12 md:py-24 lg:py-32 bg-white bg-opacity-5"
          >
            <div className="container px-4 md:px-6 mx-auto">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-center mb-8">
                Key Features
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-2 p-6 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20"
                >
                  <Music className="h-12 w-12 text-purple-400" />
                  <h3 className="text-xl font-bold">Fan-Curated Playlists</h3>
                  <p className="text-center text-gray-300">Let your audience shape your stream&apos;s soundtrack in real-time.</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-2 p-6 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20"
                >
                  <Users className="h-12 w-12 text-teal-400" />
                  <h3 className="text-xl font-bold">Interactive Streaming</h3>
                  <p className="text-center text-gray-300">Boost engagement with live music voting and requests.</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-2 p-6 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20"
                >
                  <Play className="h-12 w-12 text-pink-400" />
                  <h3 className="text-xl font-bold">Seamless Integration</h3>
                  <p className="text-center text-gray-300">Works with major streaming platforms and music services.</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full py-12 md:py-24 lg:py-32 bg-white bg-opacity-5"
          >
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Amplify Your Streams?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-300 md:text-lg">
                  Join FanTune today and start creating unforgettable, interactive streaming experiences.
                </p>
                <div className="w-full max-w-sm space-y-2">
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input 
                      placeholder="Enter your email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-grow bg-white bg-opacity-20 border-transparent focus:border-white focus:ring-white text-white placeholder-white placeholder-opacity-70"
                    />
                    <Button type="submit" className="bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-200">
                      Sign Up
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </motion.section>
        </main>
        <footer className="w-full py-6 bg-white bg-opacity-5 border-t border-white border-opacity-10">
          <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2023 FanTune. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
              <Link className="text-sm text-gray-400 hover:text-purple-400 transition-colors" href="#">
                Terms of Service
              </Link>
              <Link className="text-sm text-gray-400 hover:text-purple-400 transition-colors" href="#">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </Provider>
  )
}