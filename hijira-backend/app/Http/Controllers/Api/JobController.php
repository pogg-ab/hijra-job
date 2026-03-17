<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForeignAgency;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::query()->where('job_status', 'published');

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('country')) {
            $query->where('country', $request->string('country'));
        }

        if ($request->filled('status')) {
            $query->where('job_status', $request->string('status'));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function show(Job $job)
    {
        if ($job->job_status !== 'published') {
            return response()->json(['message' => 'Job not available.'], 404);
        }

        return response()->json($job);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'description' => ['required', 'array'],
            'description.en' => ['required', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'salary_range' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:published,closed'],
            'job_status' => ['nullable', 'in:pending,published,closed'],
            'is_high_level' => ['nullable', 'boolean'],
            'vacancies_total' => ['nullable', 'integer', 'min:1'],
            'foreign_agency_id' => ['nullable', 'exists:foreign_agencies,id'],
        ]);

        $validated['job_status'] = $validated['job_status'] ?? 'published';
        $validated['status'] = $validated['job_status'] === 'closed' ? 'closed' : 'published';
        $validated['created_by_user_id'] = $request->user()->id;

        $job = Job::create($validated);

        return response()->json([
            'message' => 'Job created successfully',
            'job' => $job,
        ], 201);
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'array'],
            'title.en' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'array'],
            'description.en' => ['sometimes', 'string'],
            'category' => ['sometimes', 'string', 'max:100'],
            'country' => ['sometimes', 'string', 'max:100'],
            'salary_range' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'in:published,closed'],
            'job_status' => ['sometimes', 'in:pending,published,closed'],
            'is_high_level' => ['sometimes', 'boolean'],
            'vacancies_total' => ['sometimes', 'integer', 'min:1'],
        ]);

        if (isset($validated['job_status'])) {
            $validated['status'] = $validated['job_status'] === 'closed' ? 'closed' : 'published';
        }

        $job->update($validated);

        return response()->json([
            'message' => 'Job updated successfully',
            'job' => $job,
        ]);
    }

    public function partnerStore(Request $request)
    {
        $user = $request->user();
        $agency = ForeignAgency::where('owner_user_id', $user->id)->where('status', 'approved')->first();

        if (! $agency) {
            return response()->json([
                'message' => 'Approved foreign agency profile is required to create job orders.',
            ], 422);
        }

        $validated = $request->validate([
            'title' => ['required', 'array'],
            'title.en' => ['required', 'string', 'max:255'],
            'description' => ['required', 'array'],
            'description.en' => ['required', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:100'],
            'salary_range' => ['nullable', 'string', 'max:100'],
            'is_high_level' => ['nullable', 'boolean'],
            'vacancies_total' => ['required', 'integer', 'min:1'],
        ]);

        $job = Job::create([
            ...$validated,
            'status' => 'closed',
            'job_status' => 'pending',
            'created_by_user_id' => $user->id,
            'foreign_agency_id' => $agency->id,
        ]);

        return response()->json([
            'message' => 'Job order submitted and pending staff publication.',
            'job' => $job,
        ], 201);
    }

    public function publish(Job $job)
    {
        $job->update([
            'job_status' => 'published',
            'status' => 'published',
        ]);

        return response()->json([
            'message' => 'Job published successfully',
            'job' => $job,
        ]);
    }

    public function close(Job $job)
    {
        $job->update([
            'job_status' => 'closed',
            'status' => 'closed',
        ]);

        return response()->json([
            'message' => 'Job closed successfully',
            'job' => $job,
        ]);
    }
}
