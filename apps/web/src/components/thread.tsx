'use client'
import {  useEffect, useState } from 'react'
import { getThreadComments } from '~/server/actions/get-comments'


import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'

function Thread({id}:{id:bigint}) {

    interface Comment {
        author: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        id: bigint;
        ContentCommentReactions: CommentReaction[];
        ContentCommentAttachment: CommentAttachment[];
    }

    interface CommentReaction {
        emoji: string; // w uzytku 
        userId: bigint;
        createdAt: Date;
        updatedAt: Date;
    }

    interface CommentAttachment {
        url: string;
        filename: string;
    }



    const [data, setData] = useState<Comment[]>([])

     const getInitials =  (userId: string): string => {
        return `${userId.toString().substring(0,2)}`
      }

    useEffect(() => {
        void (async () => {
          const res = await getThreadComments({ threadId: id.toString() });
          if (!res?.data) return;
          setData(res.data);
          console.log(res.data)
        })();
      }, [id]);

    
  return (
    <ScrollArea className="h-[700px] w-full rounded-md border p-4 text-white border-none">
    
    {data.map((comment) => (
      <div key={comment.id.toString()} className="mb-6 last:mb-0">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback className='text-black'>{getInitials(comment.author)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{comment.author.toString()}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
            <p className="text-sm">{comment.content}</p>
            {comment.ContentCommentAttachment.length > 0 && (
              <div>
                {comment.ContentCommentAttachment.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <Image
                    src={attachment.url}
                    width={100}
                    height={100}
                    alt={attachment.filename}
                    />
                  </a>
                ))} 
              </div>
            )}
            {comment.ContentCommentReactions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <TooltipProvider>
                  {comment.ContentCommentReactions.map((reaction, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <span className="text-lg bg-gray-800/0 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-800 transition-colors">
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