// src/components/ThreadNotes.tsx
'use client';

import { useState } from 'react';
import { updateThreadNote } from '~/server/actions/update-threadnote';

import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from './ui/button';

interface ThreadNotesProps {
  id: bigint;
  note: string;
  onNoteUpdate: (id: bigint, newNote: string) => void;
}

export const ThreadNote = ({ id, note, onNoteUpdate }: ThreadNotesProps) => {
  const [noteInput, setNoteInput] = useState(note);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (newValue: string) => {
    setNoteInput(newValue);
    setHasChanges(true);
  };

  const saveNoteHandler = async () => {
    await updateThreadNote({ threadId: id.toString(), content: noteInput });
    onNoteUpdate(id, noteInput);
    setHasChanges(false);
  };

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <textarea
        value={noteInput}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full min-h-60 p-2"
      />
      {hasChanges && (
        <div className='w-full flex justify-end pr-3'>
          <Button
            onClick={saveNoteHandler}
            className="mt-2 p-2 bg-blue-500 text-white rounded-md flex self-end"
          >
            Zapisz
          </Button>
        </div>
      )}
    </ScrollArea>
  );
};

export default ThreadNote;
