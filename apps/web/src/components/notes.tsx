// src/components/ThreadNotes.tsx
'use client';

import { useEffect, useState } from 'react';
import { getThreadNotes } from '~/server/actions/get-threadnotes';
import { upsertThreadNote } from '~/server/actions/update-threadnote';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { formatDistanceToNow, set } from 'date-fns';
import { useSession } from './providers/session-provider';

function ThreadNotes({ id }: { id: bigint }) {
  interface Note {
    id: number;
    threadId: bigint;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
  }

  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, session } = useSession();

  const getInitials = (author: string): string => {
    return `${author.substring(0, 2).toUpperCase()}`;
  };

  useEffect(() => {
    void (async () => {
      // Fetch notes
      const res = await getThreadNotes({ threadId: id.toString() });

      if(res?.data){
        setNotes(res.data);
      }

      

    })();
  }, [id]);

  const handleSaveNote = async () => {
    setLoading(true);
    const res = await upsertThreadNote({
      threadId: id.toString(),
      noteId:  userNote ? userNote.id.toString() : '',
      content,
      author: user?.username ?? '',
    });


    setLoading(false);

  };

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <h2 className="text-2xl font-bold mb-4">Notes</h2>
      {user && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Your Note</h3>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSaveNote}
            disabled={loading}
          >
            {userNote ? 'Update Note' : 'Add Note'}
          </button>
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold mb-2">All Notes</h3>
        {notes.map((note) => (
          <div key={note.id.toString()} className="mb-4">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarFallback>{getInitials(note.author)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{note.author}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </p>
                <p className="text-sm">{note.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default ThreadNotes;
