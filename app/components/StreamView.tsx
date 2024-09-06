'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowBigDown,
  ArrowBigUp,
  Share2,
  Music2,
  SkipForward,
} from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import LiteYouTubeEmbed from "react-lite-youtube-embed"
import { YT_REGEX } from "@/lib/utils"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
// @ts-ignore
import YoutubePlayer from "youtube-player"

interface Music {
  id: string
  title: string
  artist: string
  largeImage: string
  upvotes: number
  hasUpvoted: boolean
  extractedId: string
}

export default function StreamView({
  creatorId,
  playingVideo,
}: {
  creatorId: string
  playingVideo: boolean
}) {
  const [musicLink, setMusicLink] = useState("")
  const [musicList, setMusicList] = useState<Music[]>([])
  const [currentSong, setCurrentSong] = useState<Music | null>(null)
  const [loading, setLoading] = useState(false)
  const videoPlayerRef = useRef<HTMLDivElement>(null)
  const [playNextLoader, setPlayNextLoader] = useState(false)

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(refreshStreams, 10000)
    return () => clearInterval(interval)
  }, [])

  async function refreshStreams() {
    const stream = await fetch(`/api/streams?creatorId=${creatorId}`, {
      credentials: "include",
    })
    const json = await stream.json()
    const sortedList = json.streams.sort(
      (a: Music, b: Music) => b.upvotes - a.upvotes
    )
    setMusicList(sortedList)

    setCurrentSong((song) => {
      if (song?.id === json.activeStream?.stream.id) {
        return song
      }

      return json.activeStream.stream
    })
  }

  useEffect(() => {
    next()
  }, [])

  async function next() {
    if (musicList.length > 0) {
      try {
        setPlayNextLoader(true)
        const res = await fetch(`/api/streams/next`, {
          method: "GET",
        })
        const json = await res.json()

        setCurrentSong(json.stream)
        setMusicList((prev) => prev.filter((x) => x.id !== json.stream?.id))
      } catch (e) {}

      setPlayNextLoader(false)
    }
  }

  useEffect(() => {
    if (!videoPlayerRef.current) {
      return
    }

    let player = YoutubePlayer(videoPlayerRef.current)

    player.loadVideoById(currentSong?.extractedId)

    player.playVideo()
    function eventHandler(event: any) {
      console.log(event)
      console.log(event.data)
      if (event.data === 0) {
        next()
      }
    }
    player.on("stateChange", eventHandler)
    return () => {
      player.destroy()
    }
  }, [currentSong, videoPlayerRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/streams", {
      method: "POST",
      body: JSON.stringify({
        creatorId: creatorId,
        url: musicLink,
      }),
    })
    setMusicLink("")
    setMusicList([...musicList, await res.json()])
    setLoading(false)
  }

  const handleVote = (id: string, hasUpvoted: boolean) => {
    setMusicList(
      musicList
        .map((song) =>
          song.id === id
            ? {
                ...song,
                upvotes: hasUpvoted ? song.upvotes - 1 : song.upvotes + 1,
                hasUpvoted: !hasUpvoted,
              }
            : song
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    )

    fetch(`/api/streams/${hasUpvoted ? "downvote" : "upvote"}`, {
      method: "POST",
      body: JSON.stringify({ streamId: id }),
    })
  }

  const handleShareSpace = async () => {
    const shareUrl = `${window.location.hostname}/creator/${creatorId}`
    const shareText = "Join my FanTune space and listen to music together!"

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my FanTune space",
          text: shareText,
          url: shareUrl,
        })
        toast.success("Space link shared successfully!")
      } catch (error) {
        console.error("Error sharing:", error)
        fallbackCopyToClipboard(shareUrl)
      }
    } else {
      fallbackCopyToClipboard(shareUrl)
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand("copy")
      toast.success("Space link copied to clipboard!")
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err)
      toast.error("Failed to copy space link")
    }
    document.body.removeChild(textArea)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#1F2937] via-[#4B5563] to-[#111827] text-white p-4 md:p-8">
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
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Music2 className="mr-2" />
          FanTune
        </h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleShareSpace}
            className="bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Space
          </Button>
        </motion.div>
      </header>
      <main className="flex-grow grid gap-8 md:grid-cols-[2fr,3fr] max-w-screen-xl mx-auto">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Add New Music</h2>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Paste music link"
              value={musicLink}
              onChange={(e) => setMusicLink(e.target.value)}
              className="flex-grow bg-white bg-opacity-20 border-transparent focus:border-white focus:ring-white text-white placeholder-white placeholder-opacity-70"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Loading..." : "Add"}
              </Button>
            </motion.div>
          </form>
          <AnimatePresence>
            {musicLink && musicLink.match(YT_REGEX) && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white bg-opacity-10 border-transparent overflow-hidden">
                  <CardContent className="p-2">
                    <LiteYouTubeEmbed
                      id={musicLink.split("?v=")[1]}
                      title=""
                      poster="maxresdefault"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Now Playing</h2>
            {currentSong && !playingVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-col items-center"
              >
                <Image
                  src={currentSong.largeImage}
                  alt={`${currentSong.title} thumbnail`}
                  width={400}
                  height={200}
                  className="rounded-md mb-3"
                />
                <div className="flex-grow mb-3">
                  <h3 className="font-medium text-lg">{currentSong.title}</h3>
                  <p className="text-sm text-white text-opacity-70">
                    {currentSong.artist}
                  </p>
                </div>
              </motion.div>
            )}

            {currentSong && playingVideo && (
              <div>
                {/* @ts-ignore */}
                <div ref={videoPlayerRef} className="w-full"></div>
              </div>
            )}

            {!currentSong && (
              <div>
                <p>No song is currently playing</p>
              </div>
            )}

            {musicList.length > 0 && playingVideo && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="flex">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => next()}
                    className="text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200 ml-2 mx-auto mt-4"
                  >
                    {playNextLoader ? (
                      "Loading video...."
                    ) : (
                      <SkipForward className="h-7 w-7" />
                    )}
                  </Button>
              </div>
                </motion.div>
            )}
          </div>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Upcoming Songs</h2>
          <ScrollArea className="h-[calc(100vh-300px)] rounded-lg border-2 border-white border-opacity-20 p-2 bg-white bg-opacity-10">
            <AnimatePresence>
              {musicList.map((song) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-white bg-opacity-20 px-4 py-3 rounded-lg mb-2 hover:bg-opacity-30 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={song.largeImage}
                      alt={`${song.title} thumbnail`}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                    <div>
                      <h3 className="font-medium text-sm">{song.title}</h3>
                      <p className="text-xs text-white text-opacity-70">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleVote(song.id, song.hasUpvoted)}
                        className="text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                      >
                        {song.hasUpvoted ? (
                          <ArrowBigDown className="h-5 w-5" />
                        ) : (
                          <ArrowBigUp className="h-5 w-5" />
                        )}
                      </Button>
                    </motion.div>
                    <motion.span
                      key={`${song.id}-${song.upvotes}`}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded-full"
                    >
                      {song.upvotes}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
        </section>
      </main>
    </div>
  )
}