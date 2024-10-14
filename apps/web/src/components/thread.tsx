'use client'
import {  useEffect, useState } from 'react'
import { getThreadComments } from '~/server/actions/get-comments'


import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { formatDistanceToNow } from 'date-fns'

function Thread({id}:{id:bigint}) {

    interface Comment {
        author: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        id: bigint;
        ContentCommentReactions: CommentReaction[];
    }

    interface CommentReaction {
        emoji: string; // pokaz tylko emoji, reszta jest nie istotna
        userId: bigint;
        createdAt: Date;
        updatedAt: Date;
    }



    const [data, setData] = useState<Comment[]>([])

     const getInitials =  (userId: string): string => {
        return `${userId.toString().substring(0,2)}`
      }

    useEffect(() => {
        (async () => {
          const res = await getThreadComments({ threadId: id.toString() });
          if (!res || !res.data) return;
          setData(res.data);
          console.log(res.data)
        })();
      }, [id]);

    
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
    <h2 className="text-2xl font-bold mb-4">Comments</h2>
    {data.map((comment) => (
      <div key={comment.id.toString()} className="mb-6 last:mb-0">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{comment.author.toString()}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
            <p className="text-sm">{comment.content}</p>
            {comment.ContentCommentReactions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <TooltipProvider>
                  {comment.ContentCommentReactions.map((reaction, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger>
                        <span className="text-lg bg-gray-100 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-200 transition-colors">
                          {decodeURIComponent(reaction.emoji)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>User {reaction.userId.toString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </ScrollArea>
  )
}

export default Thread