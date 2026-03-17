<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contact = Contact::create($validated);

        Mail::raw(
            "New contact message from {$contact->name} ({$contact->email})\nSubject: {$contact->subject}\n\n{$contact->message}",
            function ($mail) {
                $mail->to('hijraglobal7@gmail.com')
                    ->subject('Hijra Website Contact Message');
            }
        );

        $this->sendSmsPlaceholder($contact->message);

        return response()->json([
            'message' => 'Contact message submitted successfully',
            'contact' => $contact,
        ], 201);
    }

    private function sendSmsPlaceholder(string $message): void
    {
        Log::info('SMS placeholder invoked', [
            'to' => '+251999422222',
            'message' => $message,
        ]);
    }
}
