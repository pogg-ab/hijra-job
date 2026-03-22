<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactReply;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->paginate(50);
        return response()->json($contacts);
    }

    public function show(Contact $contact)
    {
        $contact->load('replies');
        return response()->json($contact);
    }

    public function markRead(Contact $contact)
    {
        $contact->is_read = true;
        $contact->save();
        return response()->json(['message' => 'Marked as read', 'contact' => $contact]);
    }

    public function reply(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $reply = ContactReply::create([
            'contact_id' => $contact->id,
            'sender' => 'admin',
            'message' => $validated['message'],
        ]);

        // mark as read when admin replies
        $contact->is_read = true;
        $contact->save();

        // reload with replies
        $contact->load('replies');

        return response()->json(['message' => 'Reply sent', 'reply' => $reply, 'contact' => $contact]);
    }
}
