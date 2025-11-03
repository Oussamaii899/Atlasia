"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, ArrowLeft, MoreVertical, Check, CheckCheck } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"
import { router } from "@inertiajs/react"
import { useRef } from "react"
import { toast, Toaster } from "sonner"
import { usePage } from "@inertiajs/react"
import { Pencil, Trash2 } from "lucide-react"
import axios from "axios"

interface User {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  isOnline: boolean
  unreadCount: number
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Chat", href: "/chat" }]

export default function ChatPage({ users, selectedUser: selectedUserProp, allUsers }) {
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<{ [userId: string]: any[] }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUser, setFilterUser] = useState(allUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(selectedUserProp ?? null)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastMessageId, setLastMessageId] = useState<{ [userId: string]: number }>({})
  const [lastUpdateCheck, setLastUpdateCheck] = useState<{ [userId: string]: number }>({})
  const [isPolling, setIsPolling] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<Set<number>>(new Set())
  const [markedAsSeen, setMarkedAsSeen] = useState<Set<number>>(new Set())

  const { currentUser } = usePage().props
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Intersection Observer for message visibility
  const observerRef = useRef<IntersectionObserver | null>(null)


  // Initialize Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleMessages = new Set(visibleMessages)

        entries.forEach((entry) => {
          const messageId = Number.parseInt(entry.target.getAttribute("data-message-id") || "0")

          if (entry.isIntersecting) {
            newVisibleMessages.add(messageId)
          } else {
            newVisibleMessages.delete(messageId)
          }
        })

        setVisibleMessages(newVisibleMessages)
      },
      {
        root: messagesContainerRef.current,
        rootMargin: "0px",
        threshold: 0.5, // Message is considered "seen" when 50% visible
      },
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Mark messages as seen when they become visible
  useEffect(() => {
    if (!selectedUser?.id || !messages[selectedUser.id]) return

    const currentMessages = messages[selectedUser.id]
    const unseenMessages = currentMessages.filter(
      (msg) =>
        !msg.isOwn && // Only mark other user's messages as seen
        visibleMessages.has(msg.id) && // Message is visible
        !markedAsSeen.has(msg.id) && // Haven't marked this message yet
        !msg.pending, // Don't mark pending messages
    )

    if (unseenMessages.length > 0) {
      console.log(`Marking ${unseenMessages.length} messages as seen`)

      // Mark messages as seen in the backend
      markMessagesAsSeen(
        selectedUser.id,
        unseenMessages.map((msg) => msg.id),
      )

      // Update local state to prevent duplicate requests
      setMarkedAsSeen((prev) => {
        const newSet = new Set(prev)
        unseenMessages.forEach((msg) => newSet.add(msg.id))
        return newSet
      })
    }
  }, [visibleMessages, messages, selectedUser?.id, markedAsSeen])

  // Function to mark messages as seen in the backend
  const markMessagesAsSeen = async (userId: string, messageIds: number[]) => {
    try {
      await fetch("/messages/mark-seen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "",
        },
        body: JSON.stringify({
          sender_id: userId,
          message_ids: messageIds, // Send specific message IDs if your backend supports it
        }),
      })

      console.log(`Successfully marked messages as seen: ${messageIds.join(", ")}`)
    } catch (error) {
      console.error("Error marking messages as seen:", error)
    }
  }

  // Register message element for intersection observation
  const registerMessageRef = (messageId: number, element: HTMLDivElement | null) => {
    if (element) {
      messageRefs.current.set(messageId, element)
      element.setAttribute("data-message-id", messageId.toString())

      if (observerRef.current) {
        observerRef.current.observe(element)
      }
    } else {
      // Clean up when element is removed
      const existingElement = messageRefs.current.get(messageId)
      if (existingElement && observerRef.current) {
        observerRef.current.unobserve(existingElement)
      }
      messageRefs.current.delete(messageId)
    }
  }

  // Check if user is near bottom of scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const threshold = 10 // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold
  }

  // Handle scroll events
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const isAtBottom = isNearBottom()
    setUserScrolledUp(!isAtBottom)
    setShouldAutoScroll(isAtBottom)
  }

  // Scroll to bottom function
  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }

  // Handle click outside dropdown menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('[id^="dropdown-"]')
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target) && !dropdown.classList.contains("hidden")) {
          dropdown.classList.add("hidden")
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter((user) => {
      const nameU = user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      return nameU
    })
    setFilterUser(filtered)
  }, [searchQuery, users])

  // Fetch all messages for a user (initial load)
  const fetchAllMessages = async (userId) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/messages/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch messages")

      const data = await res.json()
      const formatted = data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isOwn: msg.sender_id === currentUser.id,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        seenAt: msg.seen,
        deliveredAt: msg.delivered || 1,
        updatedAt: msg.updated_at,
        seenTimestamp: msg.seen_at,
      }))

      setMessages((prev) => ({
        ...prev,
        [userId]: formatted,
      }))

      // Set the last message ID for polling
      if (formatted.length > 0) {
        const lastId = Math.max(...formatted.map((m) => m.id))
        setLastMessageId((prev) => ({
          ...prev,
          [userId]: lastId,
        }))
      } else {
        setLastMessageId((prev) => ({
          ...prev,
          [userId]: 0,
        }))
      }

      // Reset scroll state and seen tracking for new conversation
      setShouldAutoScroll(true)
      setUserScrolledUp(false)
      setVisibleMessages(new Set())
      setMarkedAsSeen(new Set())

      // Scroll to bottom after loading (initial load)
      setTimeout(() => {
        scrollToBottom("auto")
      }, 150)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  // Comprehensive message sync - fetches all messages and compares with local state
  const syncMessages = async (userId) => {
    if (!userId || isPolling) return

    setIsPolling(true)
    try {
      const res = await fetch(`/messages/${userId}`)
      if (!res.ok) return

      const data = await res.json()
      const serverMessages = data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isOwn: msg.sender_id === currentUser.id,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        seenAt: msg.seen,
        deliveredAt: msg.delivered || 1,
        updatedAt: msg.updated_at,
        seenTimestamp: msg.seen_at,
      }))

      const currentMessages = messages[userId] || []

      // Create maps for easy comparison
      const serverMap = new Map(serverMessages.map((msg) => [msg.id, msg]))
      const currentMap = new Map(currentMessages.map((msg) => [msg.id, msg]))

      // Find new messages (exist on server but not locally)
      const newMessages = serverMessages.filter((msg) => !currentMap.has(msg.id))

      // Find deleted messages (exist locally but not on server)
      const deletedMessageIds = currentMessages
        .filter((msg) => !serverMap.has(msg.id) && !msg.pending)
        .map((msg) => msg.id)

      // Find updated messages (content, status, or timestamp changed)
      const updatedMessages = serverMessages.filter((serverMsg) => {
        const currentMsg = currentMap.get(serverMsg.id)
        return (
          currentMsg &&
          (currentMsg.content !== serverMsg.content ||
            currentMsg.seenAt !== serverMsg.seenAt ||
            currentMsg.deliveredAt !== serverMsg.deliveredAt ||
            currentMsg.updatedAt !== serverMsg.updatedAt)
        )
      })

      let hasChanges = false
      let hasNewMessages = false

      // Handle new messages
      if (newMessages.length > 0) {
        console.log(`Found ${newMessages.length} new messages`)
        hasChanges = true
        hasNewMessages = true
      }

      // Handle deletions
      if (deletedMessageIds.length > 0) {
        console.log(`Found ${deletedMessageIds.length} deleted messages`)
        hasChanges = true

        if (deletedMessageIds.length === 1) {
          toast.info("A message was deleted")
        } else if (deletedMessageIds.length > 1) {
          toast.info(`${deletedMessageIds.length} messages were deleted`)
        }
      }

      // Handle updates
      if (updatedMessages.length > 0) {
        console.log(`Found ${updatedMessages.length} updated messages`)
        hasChanges = true

        // Check if any content was actually edited
        const editedMessages = updatedMessages.filter((serverMsg) => {
          const currentMsg = currentMap.get(serverMsg.id)
          return currentMsg && currentMsg.content !== serverMsg.content
        })

        if (editedMessages.length > 0) {
          toast.info("A message was edited")
        }
      }

      // Update state with the complete server state (this prevents race conditions)
      if (hasChanges || newMessages.length > 0 || deletedMessageIds.length > 0 || updatedMessages.length > 0) {
        // Keep pending messages from current state
        const pendingMessages = currentMessages.filter((msg) => msg.pending)

        // Combine server messages with pending messages
        const finalMessages = [...serverMessages, ...pendingMessages].sort((a, b) => a.id - b.id) // Sort by ID to maintain order

        setMessages((prev) => ({
          ...prev,
          [userId]: finalMessages,
        }))

        // Update last message ID
        if (serverMessages.length > 0) {
          const lastId = Math.max(...serverMessages.map((m) => m.id))
          setLastMessageId((prev) => ({
            ...prev,
            [userId]: lastId,
          }))
        }

        // Only auto-scroll if user is near bottom AND there are new messages
        if (hasNewMessages && shouldAutoScroll && !userScrolledUp) {
          setTimeout(() => {
            scrollToBottom("smooth")
          }, 100)
        }
      }
    } catch (error) {
      console.error("Error syncing messages:", error)
    } finally {
      setIsPolling(false)
    }
  }

  // Load messages when selected user changes
  useEffect(() => {
    if (selectedUserProp?.id) {
      fetchAllMessages(selectedUserProp.id)
    }
  }, [selectedUserProp])

  // Poll for message updates every 3 seconds when a user is selected
  useEffect(() => {
    if (selectedUser?.id) {
      console.log(`Starting message sync for user ${selectedUser.id}`)

      const interval = setInterval(() => {
        console.log(`Syncing messages for user ${selectedUser.id}`)
        syncMessages(selectedUser.id)
      }, 3000)

      setPollingInterval(interval)

      return () => {
        console.log(`Stopping message sync for user ${selectedUser.id}`)
        if (interval) clearInterval(interval)
      }
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
  }, [selectedUser?.id]) // Only depend on selectedUser.id to prevent unnecessary restarts

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    setIsTyping(true)
    const messageContent = newMessage.trim()
    const tempId = Date.now() // Temporary ID for optimistic update
    setNewMessage("") // Clear input immediately

    // Optimistically add message to UI
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      isOwn: true,
      timestamp: new Date().toLocaleTimeString(),
      seenAt: 0,
      deliveredAt: 0,
      pending: true, // Mark as pending
      updatedAt: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), optimisticMessage],
    }))

    // Always scroll to bottom when user sends a message
    setShouldAutoScroll(true)
    setUserScrolledUp(false)
    setTimeout(() => {
      scrollToBottom("smooth")
    }, 50)

    try {
      const res = await fetch("/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "",
        },
        body: JSON.stringify({
          content: messageContent,
          user_id: selectedUser.id,
        }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      const message = await res.json()

      // Replace optimistic message with real message
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: prev[selectedUser.id].map((msg) =>
          msg.id === tempId
            ? {
                id: message.id,
                content: message.content,
                isOwn: true,
                timestamp: new Date(message.created_at).toLocaleTimeString(),
                pending: false,
                seenAt: message.seen || 0,
                deliveredAt: message.delivered || 1,
                updatedAt: message.updated_at,
                seenTimestamp: message.seen_at,
              }
            : msg,
        ),
      }))

      // Update last message ID
      setLastMessageId((prev) => ({
        ...prev,
        [selectedUser.id]: Math.max(prev[selectedUser.id] || 0, message.id),
      }))

      console.log(`Sent message with ID ${message.id}`)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")

      // Remove optimistic message on error
      setMessages((prev) => ({
        ...prev,
        [selectedUser.id]: prev[selectedUser.id].filter((msg) => msg.id !== tempId),
      }))

      setNewMessage(messageContent) // Restore message
    } finally {
      setIsTyping(false)
    }
  }

  // Update an existing message
  const handleUpdateMessage = async (messageId) => {
    if (!editingContent.trim() || !selectedUser) return

    try {
      const res = await fetch(`/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "",
        },
        body: JSON.stringify({ content: editingContent.trim() }),
      })

      if (!res.ok) throw new Error("Failed to update message")

      const updatedMessage = await res.json()

      // Update the message in the state
      setMessages((prev) => {
        if (!prev[selectedUser.id]) return prev

        const updatedMessages = prev[selectedUser.id].map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: editingContent.trim(),
                updatedAt: updatedMessage.updated_at || new Date().toISOString(),
              }
            : msg,
        )
        return { ...prev, [selectedUser.id]: updatedMessages }
      })

      setEditingMessageId(null)
      setEditingContent("")
      toast.success("Message updated")
    } catch (error) {
      console.error("Error updating message:", error)
      toast.error("Failed to update message")
    }
  }

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!selectedUser) return

    toast("Delete this message?", {
      action: {
        label: "Yes, delete",
        onClick: async () => {
          try {
            const res = await fetch(`/messages/${messageId}`, {
              method: "DELETE",
              headers: {
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || "",
              },
            })

            if (!res.ok) throw new Error("Failed to delete message")

            // Remove the message from the state immediately
            setMessages((prev) => {
              if (!prev[selectedUser.id]) return prev

              const filteredMessages = prev[selectedUser.id].filter((msg) => msg.id !== messageId)
              return { ...prev, [selectedUser.id]: filteredMessages }
            })

            toast.success("Message deleted")
            console.log(`Deleted message with ID ${messageId}`)
          } catch (error) {
            console.error("Error deleting message:", error)
            toast.error("Failed to delete message")
          }
        },
      },
    })
  }

  // Get message status icon
  const getMessageStatus = (message) => {
    if (message.pending) {
      return (
        <div className="flex items-center gap-1 text-sm text-blue-200">
          <div className="w-3 h-3 border border-blue-200 border-t-transparent rounded-full animate-spin"></div>
          <span>Sending...</span>
        </div>
      )
    }

    if (message.seenAt === 1) {
      return (
        <div className="flex items-center gap-1 text-sm text-blue-300">
          <CheckCheck className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300">Read</span>
        </div>
      )
    }

    if (message.deliveredAt === 1) {
      return (
        <div className="flex items-center gap-1 text-sm text-slate-300">
          <CheckCheck className="w-4 h-4 text-slate-400" />
          <span>Delivered</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1 text-sm text-slate-300">
        <Check className="w-4 h-4 text-slate-400" />
        <span>Sent</span>
      </div>
    )
  }

  // Handle Enter key press to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Navigate back to user list
  const handleBackToUsers = () => {
    setSelectedUser(null)
    router.visit("/chat")
  }

  // Toggle message dropdown menu
  const toggleDropdown = (messageId) => {
    const dropdown = document.getElementById(`dropdown-${messageId}`)
    if (!dropdown) return

    // Close all other dropdowns first
    document.querySelectorAll('[id^="dropdown-"]').forEach((el) => {
      if (el.id !== `dropdown-${messageId}`) {
        el.classList.add("hidden")
      }
    })

    // Toggle the clicked dropdown
    dropdown.classList.toggle("hidden")
  }

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  if (selectedUser) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Chat" />
        <Toaster position="top-right" richColors />
        <div className="h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-black dark:to-slate-950 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white/90 backdrop-blur-sm dark:bg-black/95 border-b border-slate-300 dark:border-slate-900 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToUsers}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative"> 
                  <Avatar className="h-12 w-12 ring-2 ring-slate-300 dark:ring-slate-700">
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold ">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-black rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white cursor-pointer hover:underline " onClick={() => router.visit('/user/'+selectedUser.id)}> {selectedUser.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${selectedUser.id === 921 ? "bg-blue-500" : selectedUser.isOnline ? "bg-green-500" : "bg-gray-500"}`}
                    ></div>
                      {selectedUser.id === 921 ? (
                        <Badge className="support-badge">Support</Badge>
                      ) : (
                        selectedUser.isOnline ? "Online" : "Offline"
                      )}

                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Scroll to bottom button - only show when user scrolled up */}
                {userScrolledUp && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShouldAutoScroll(true)
                      setUserScrolledUp(false)
                      scrollToBottom("smooth")
                    }}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                  >
                    ↓ New messages
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-transparent to-slate-200/50 dark:to-black/80"
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages[selectedUser.id]?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages[selectedUser.id]?.map((message, index) => {
                    const showTimestamp =
                      index === 0 || messages[selectedUser.id][index - 1]?.timestamp !== message.timestamp

                    return (
                      <div
                        key={`${message.id}-${message.pending ? "pending" : "sent"}`}
                        className="space-y-2"
                        ref={(el) => registerMessageRef(message.id, el)}
                      >
                        {showTimestamp && (
                          <div className="text-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
                              {message.timestamp}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                          <div className={`group relative max-w-[80%] ${message.isOwn ? "order-2" : "order-1"}`}>
                            {/* Message Bubble */}
                            <div
                              className={`relative px-6 py-4 rounded-3xl shadow-md transition-all duration-200 hover:shadow-lg ${
                                message.isOwn
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto rounded-br-lg"
                                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-lg"
                              }`}
                            >
                              {/* Editing Mode */}
                              {editingMessageId === message.id ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full rounded-lg px-4 py-3 text-base text-slate-900 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateMessage(message.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingMessageId(null)
                                        setEditingContent("")
                                      }}
                                      className="text-slate-500 hover:text-slate-700 px-4 py-2 text-sm"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div className="pr-6">
                                      <p className="text-lg leading-relaxed whitespace-pre-wrap break-words">
                                        {message.content}
                                      </p>
                                      {/* Edited indicator */}
                                      {message.updatedAt &&
                                        message.updatedAt !== message.timestamp &&
                                        !message.pending && (
                                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                                            edited
                                          </p>
                                        )}
                                    </div>

                                    {message.isOwn && !message.pending && (
                                      <div className="relative ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-8 w-8 rounded-full p-0 ${
                                            message.isOwn
                                              ? "text-blue-100 hover:text-white hover:bg-blue-800"
                                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                          }`}
                                          onClick={() => toggleDropdown(message.id)}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>

                                        <div
                                          id={`dropdown-${message.id}`}
                                          className="absolute right-0 mt-1 w-36 rounded-lg shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black/10 dark:ring-white/10 z-10 hidden border border-slate-200 dark:border-slate-700"
                                        >
                                          <div className="py-1">
                                            <button
                                              onClick={() => {
                                                setEditingMessageId(message.id)
                                                setEditingContent(message.content)
                                                document
                                                  .getElementById(`dropdown-${message.id}`)
                                                  .classList.add("hidden")
                                              }}
                                              className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left transition-colors"
                                            >
                                              <Pencil className="w-4 h-4 mr-2" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDeleteMessage(message.id)
                                                document
                                                  .getElementById(`dropdown-${message.id}`)
                                                  .classList.add("hidden")
                                              }}
                                              className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full text-left transition-colors"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Message Status - WhatsApp Style */}
                                  {message.isOwn && (
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center justify-end">{getMessageStatus(message)}</div>
                                      {/* Seen timestamp */}
                                      {message.seenAt === 1 && message.seenTimestamp && (
                                        <div className="text-xs text-blue-300 text-right">
                                          Seen on {new Date(message.seenTimestamp).toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white/95 backdrop-blur-sm dark:bg-black/95 border-t border-slate-300 dark:border-slate-900 p-4 md:p-6 shadow-lg">
            <div className="flex space-x-3 max-w-5xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 py-4 text-base rounded-full border-slate-400 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 shadow-inner xl:text-lg xl:py-6 xl:px-6"
                  disabled={isTyping || isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping || isLoading}
                className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed xl:w-16 xl:h-16"
              >
                <Send className="h-5 w-5 xl:h-6 xl:w-6" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Chat" />
      <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-300 dark:from-black dark:to-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
              Messages
            </h1>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  type="search"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 rounded-full border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm dark:bg-slate-800/90"
                />
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterUser.map((user) => (
              <Card
                key={user.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white/95 backdrop-blur-sm dark:bg-slate-900/95 border-slate-300 dark:border-slate-800 group"
                onClick={async () => {
                  try {
                    await axios.post(`/chat/toggle-seen/${user.id}`)
                    router.visit(`/chat/${user.id}`)
                  } catch (error) {
                    console.error("Error navigating to chat:", error)
                    toast.error("Failed to open chat")
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-2 ring-slate-300 dark:ring-slate-700 group-hover:ring-blue-400 transition-all duration-300">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-blue-600 to-purple-700 text-white font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white dark:border-black rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.name}
                        </h3>
                        {user.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="h-7 w-7 rounded-full p-0 flex items-center justify-center text-sm bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                          >
                            {user.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-slate-700 dark:text-slate-200 truncate mb-3 leading-relaxed">
                        {/* {user.lastMessage || "No messages yet"} */}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{user.timestamp}</p>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-slate-500"}`}
                          ></div>
                          <span
                            className={`text-sm font-medium ${user.isOnline ? "text-green-600 dark:text-green-400" : "text-slate-600 dark:text-slate-300"}`}
                          >
                            {user.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filterUser.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-10 w-10 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No conversations found</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Try adjusting your search query or start a new conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
