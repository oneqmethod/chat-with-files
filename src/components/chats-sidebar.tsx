'use client'

import { useState, useTransition } from 'react'
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
  Pencil,
  ChevronUp,
  GalleryVerticalEnd,
} from 'lucide-react'
import { deleteChat, renameChat, logout } from '@/app/(frontend)/(app)/actions'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Chat, User } from '@/payload-types'

interface ChatsSidebarProps {
  user: User
  chats: Chat[]
  hasReadyFiles: boolean
}

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Files', href: '/files', icon: Files },
]

export function ChatsSidebar({ user, chats, hasReadyFiles }: ChatsSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null)
  const [chatToRename, setChatToRename] = useState<Chat | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleConfirmDelete() {
    if (!chatToDelete) return
    const chatId = chatToDelete.id
    setChatToDelete(null)
    await deleteChat(chatId)
    if (pathname === `/chat/${chatId}`) {
      router.push('/dashboard')
    }
    router.refresh()
  }

  function handleRename(formData: FormData) {
    if (!chatToRename) return
    const newTitle = formData.get('title') as string
    if (!newTitle.trim()) return
    startTransition(async () => {
      await renameChat(chatToRename.id, newTitle.trim())
      setChatToRename(null)
      router.refresh()
    })
  }

  async function handleLogout() {
    await logout()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 px-1 py-3">
            <GalleryVerticalEnd />
            <h1>Chat with your Files</h1>
          </SidebarMenuItem>

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
          {hasReadyFiles ? (
            <SidebarGroupAction title="New Chat" asChild>
              <Link href="/chat/new">
                <Plus className="size-4" />
                <span className="sr-only">New Chat</span>
              </Link>
            </SidebarGroupAction>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarGroupAction
                  title="New Chat"
                  className="cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                >
                  <Plus className="size-4" />
                  <span className="sr-only">New Chat</span>
                </SidebarGroupAction>
              </TooltipTrigger>
              <TooltipContent side="right">Upload files first</TooltipContent>
            </Tooltip>
          )}
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
                      <DropdownMenuItem onClick={() => setChatToRename(chat)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setChatToDelete(chat)}
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

      <Dialog open={!!chatToRename} onOpenChange={(open) => !open && setChatToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <form action={handleRename}>
            <Input
              name="title"
              defaultValue={chatToRename?.title}
              placeholder="Chat title"
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setChatToRename(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{chatToDelete?.title}&quot; and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
