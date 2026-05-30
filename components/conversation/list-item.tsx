import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ConversationListItem({ conversation, isActive, onClick }: { conversation: any; isActive?: boolean; onClick?: () => void }) {
  const customer = conversation.customer
  return (
    <div className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer ${isActive ? "bg-primary/10" : "hover:bg-muted"}`} onClick={onClick}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{(customer?.name || customer?.phone || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium">{customer?.name || customer?.phone || "Unknown"}</p>
          <span className="text-xs text-muted-foreground">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ""}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{conversation._count?.messages || 0} messages · {conversation.status}</p>
      </div>
    </div>
  )
}