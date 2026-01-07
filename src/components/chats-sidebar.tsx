'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Plus,
  LogOut,
  User as UserIcon,
  Files,
  LayoutDashboard,
  MoreHorizontal,
  Trash2,
  ChevronUp,
} from 'lucide-react'
import { deleteChat } from '@/app/(frontend)/(app)/actions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
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

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Files', href: '/files', icon: Files },
]

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
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupAction title="New Chat" onClick={handleNewChat}>
            <Plus />
            <span className="sr-only">New Chat</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`}>
                    <Link href={`/chat/${chat.id}`}>
                      <span className="truncate">{chat.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu
                    open={openDropdown === chat.id}
                    onOpenChange={(open) => setOpenDropdown(open ? chat.id : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 opacity-0 transition-opacity hover:bg-sidebar-accent group-hover/menu-item:opacity-100 ${
                          openDropdown === chat.id ? 'opacity-100' : ''
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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
                </SidebarMenuItem>
              ))}
              {chats.length === 0 && (
                <p className="px-2 py-2 text-sm text-muted-foreground">No chats yet</p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.displayName?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user.displayName || user.email}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
