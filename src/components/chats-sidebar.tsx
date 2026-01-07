'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, LogOut, User as UserIcon, Files, MoreHorizontal, Trash2 } from 'lucide-react'
import { deleteChat } from '@/app/(frontend)/(app)/actions'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Chat, User } from '@/payload-types'

interface ChatsSidebarProps {
  user: User
  chats: Chat[]
}

export function ChatsSidebar({ user, chats }: ChatsSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  async function handleDeleteChat(chatId: string) {
    await deleteChat(chatId)
    router.refresh()
  }

  async function handleLogout() {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
    router.refresh()
  }

  async function handleNewChat() {
    router.push('/dashboard')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-semibold">Chats</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/files">
              <Files className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative flex items-center rounded-md transition-colors hover:bg-muted ${
                pathname === `/chat/${chat.id}` ? 'bg-muted' : ''
              }`}
            >
              <Link href={`/chat/${chat.id}`} className="flex-1 truncate px-2 py-2 text-sm">
                {chat.title}
              </Link>
              <DropdownMenu
                open={openDropdown === chat.id}
                onOpenChange={(open) => setOpenDropdown(open ? chat.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute right-1 h-7 w-7 rounded-md bg-stone-800 transition-opacity hover:bg-stone-700 group-hover:opacity-100 ${
                      openDropdown === chat.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No chats yet</p>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{user.displayName || user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
