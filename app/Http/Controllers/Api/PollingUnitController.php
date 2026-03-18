<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PollingUnit;
use Illuminate\Http\Request;

class PollingUnitController extends Controller
{
    public function index(Request $request, $ward_id = null, $lga_id = null)
    {
        try {
            $query = PollingUnit::with(['ward.lga']);
            
            // Check both URL parameters and query parameters
            $wardId = $ward_id ?: $request->get('ward_id');
            $lgaId = $lga_id ?: $request->get('lga_id');
            
            if ($wardId) {
                $query->where('ward_id', $wardId);
            }
            
            if ($lgaId) {
                $query->whereHas('ward', function ($q) use ($lgaId) {
                    $q->where('lga_id', $lgaId);
                });
            }
            
            return $query->get()->map(function ($pu) {
                return [
                    'id' => $pu->id,
                    'name' => $pu->name,
                    'code' => $pu->code,
                    'registered_voters' => $pu->registered_voters,
                    'description' => $pu->description,
                    'ward_id' => $pu->ward_id,
                    'ward_name' => $pu->ward ? $pu->ward->name : null,
                    'lga_id' => $pu->ward && $pu->ward->lga ? $pu->ward->lga->id : null,
                    'lga_name' => $pu->ward && $pu->ward->lga ? $pu->ward->lga->name : null
                ];
            });
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to fetch polling units'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:200',
                'code' => 'required|string|max:50|unique:polling_units',
                'ward_id' => 'required|exists:wards,id',
                'registered_voters' => 'nullable|integer|min:0',
                'description' => 'nullable|string'
            ]);

            $validated['registered_voters'] = $validated['registered_voters'] ?? 0;
            
            $pollingUnit = PollingUnit::create($validated);
            return response()->json($pollingUnit, 201);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to create polling unit'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $pollingUnit = PollingUnit::with(['ward', 'lga'])->findOrFail($id);
            return response()->json($pollingUnit);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Polling unit not found'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $pollingUnit = PollingUnit::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'required|string|max:200',
                'code' => 'required|string|max:50|unique:polling_units,code,' . $id,
                'ward_id' => 'required|exists:wards,id',
                'registered_voters' => 'nullable|integer|min:0',
                'description' => 'nullable|string'
            ]);

            $validated['registered_voters'] = $validated['registered_voters'] ?? 0;
            
            $pollingUnit->update($validated);
            return response()->json($pollingUnit);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to update polling unit'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $pollingUnit = PollingUnit::findOrFail($id);
            $pollingUnit->delete();
            return response()->json(null, 204);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to delete polling unit'], 500);
        }
    }
}
