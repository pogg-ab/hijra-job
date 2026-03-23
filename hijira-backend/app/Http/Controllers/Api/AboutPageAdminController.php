<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutPageSection;
use Illuminate\Http\Request;

class AboutPageAdminController extends Controller
{
    private array $allowedSectionKeys = [
        'company_background',
        'mission',
        'vision',
        'legal_compliance',
        'recruitment_standards',
        'certifications',
    ];

    public function sectionsIndex()
    {
        $items = AboutPageSection::query()->orderBy('order')->get();

        return response()->json(['data' => $items]);
    }

    public function upsertSection(Request $request, string $key)
    {
        if (! in_array($key, $this->allowedSectionKeys, true)) {
            return response()->json([
                'message' => 'Invalid about page section key.',
                'allowed_keys' => $this->allowedSectionKeys,
            ], 422);
        }

        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'array'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $item = AboutPageSection::query()->updateOrCreate(
            ['key' => $key],
            [
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'content' => $data['content'] ?? null,
                'order' => $data['order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
            ]
        );

        return response()->json(['data' => $item]);
    }
}