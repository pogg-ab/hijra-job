<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\ForeignAgency;
use App\Models\Job;
use App\Services\WorkflowService;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct(private readonly WorkflowService $workflowService)
    {
    }

    public function apply(Request $request, Job $job)
    {
        if ($job->job_status !== 'published') {
            return response()->json([
                'message' => 'This job is not open for applications.',
            ], 422);
        }

        if ($job->is_high_level) {
            $hasVerifiedDocuments = $request->user()
                ->documents()
                ->where('status', 'verified')
                ->exists();

            if (! $hasVerifiedDocuments) {
                return response()->json([
                    'message' => 'Verified documents are required before applying to high-level jobs.',
                ], 422);
            }
        }

        $application = Application::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'job_id' => $job->id,
            ],
            [
                'status' => 'applied',
                'workflow_status' => 'applied',
                'remarks' => null,
            ]
        );

        return response()->json([
            'message' => $application->wasRecentlyCreated
                ? 'Application submitted successfully'
                : 'You have already applied for this job',
            'application' => $application,
        ], $application->wasRecentlyCreated ? 201 : 200);
    }

    public function myApplications(Request $request)
    {
        $applications = Application::with('job')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json($applications);
    }

    public function adminIndex(Request $request)
    {
        $query = Application::query()->with(['user:id,name,email,phone', 'job:id,title,country,category,status']);

        if ($request->filled('status')) {
            $query->where('workflow_status', $request->string('status'));
        }

        if ($request->filled('job_id')) {
            $query->where('job_id', $request->integer('job_id'));
        }

        if ($request->filled('applicant_name')) {
            $name = (string) $request->string('applicant_name');
            $query->whereHas('user', function ($userQuery) use ($name) {
                $userQuery->where('name', 'like', "%{$name}%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function updateStatus(Request $request, Application $application)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:applied,shortlisted,interview_requested,selected,hired,placed,rejected'],
            'remarks' => ['nullable', 'string'],
        ]);

        $updatePayload = [
            'status' => in_array($validated['status'], ['applied', 'shortlisted', 'rejected'], true)
                ? $validated['status']
                : $application->status,
            'workflow_status' => $validated['status'],
            'remarks' => $validated['remarks'] ?? $application->remarks,
        ];

        if ($validated['status'] === 'hired') {
            $updatePayload['hired_at'] = now();
        }

        if ($validated['status'] === 'placed') {
            $updatePayload['placed_at'] = now();
        }

        $application->update($updatePayload);

        if (in_array($validated['status'], ['hired', 'placed'], true)) {
            $this->workflowService->notifyStatusChange($application);
            $this->workflowService->syncToInternalSoftware($application);
        }

        $this->workflowService->refreshJobVacancyState($application);

        return response()->json([
            'message' => 'Application status updated',
            'application' => $application->load(['user:id,name,email', 'job:id,title']),
        ]);
    }

    public function partnerShortlisted(Request $request)
    {
        $agency = ForeignAgency::where('owner_user_id', $request->user()->id)
            ->where('status', 'approved')
            ->first();

        if (! $agency) {
            return response()->json(['message' => 'Approved agency profile not found.'], 404);
        }

        $applications = Application::with(['user.profile', 'job'])
            ->whereHas('job', function ($jobQuery) use ($agency) {
                $jobQuery->where('foreign_agency_id', $agency->id);
            })
            ->whereIn('workflow_status', ['shortlisted', 'interview_requested', 'selected'])
            ->latest()
            ->paginate(20);

        return response()->json($applications);
    }

    public function partnerAction(Request $request, Application $application)
    {
        $agency = ForeignAgency::where('owner_user_id', $request->user()->id)
            ->where('status', 'approved')
            ->first();

        if (! $agency || $application->job->foreign_agency_id !== $agency->id) {
            return response()->json(['message' => 'Application not found for your agency.'], 404);
        }

        $validated = $request->validate([
            'action' => ['required', 'in:request_interview,select_candidate'],
            'remarks' => ['nullable', 'string'],
        ]);

        $nextStatus = $validated['action'] === 'request_interview' ? 'interview_requested' : 'selected';

        $application->update([
            'workflow_status' => $nextStatus,
            'remarks' => $validated['remarks'] ?? $application->remarks,
        ]);

        $this->workflowService->notifyStatusChange($application);

        return response()->json([
            'message' => 'Partner action recorded',
            'application' => $application->fresh(['user:id,name,email', 'job:id,title']),
        ]);
    }
}
