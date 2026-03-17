<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::query()->with('user:id,name,email,phone');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->string('document_type'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function upload(Request $request)
    {
        $validated = $request->validate([
            'document_type' => ['required', 'in:Passport,ID,Certificate'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $path = $request->file('file')->store('documents', 'private');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document,
        ], 201);
    }

    public function updateStatus(Request $request, Document $document)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,verified,rejected'],
        ]);

        $document->update([
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Document status updated',
            'document' => $document->load('verifiedBy:id,name,email'),
        ]);
    }

    public function download(Document $document)
    {
        if (! Storage::disk('private')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $stream = Storage::disk('private')->readStream($document->file_path);
        $filename = basename($document->file_path);

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $filename);
    }
}
