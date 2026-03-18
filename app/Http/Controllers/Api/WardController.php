<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ward;
use Illuminate\Http\Request;

class WardController extends Controller
{
    public function index(Request $request, $lga_id = null)
    {
        try {
            $query = Ward::with('lga');
            
            // Check both URL parameter and query parameter
            $lgaId = $lga_id ?: $request->get('lga_id');
            
            if ($lgaId) {
                $query->where('lga_id', $lgaId);
            }
            
            return $query->get()->map(function ($ward) {
                return [
                    'id' => $ward->id,
                    'name' => $ward->name,
                    'code' => $ward->code,
                    'description' => $ward->description,
                    'lga_id' => $ward->lga_id,
                    'lga_name' => $ward->lga ? $ward->lga->name : null
                ];
            });
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to fetch wards'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'code' => 'nullable|string|max:50',
                'lga_id' => 'required|exists:lgas,id',
                'description' => 'nullable|string'
            ]);

            $ward = Ward::create($validated);
            return response()->json($ward, 201);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to create ward'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $ward = Ward::with('lga')->findOrFail($id);
            return response()->json($ward);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Ward not found'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $ward = Ward::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'code' => 'nullable|string|max:50',
                'lga_id' => 'required|exists:lgas,id',
                'description' => 'nullable|string'
            ]);

            $ward->update($validated);
            return response()->json($ward);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to update ward'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $ward = Ward::findOrFail($id);
            $ward->delete();
            return response()->json(null, 204);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to delete ward'], 500);
        }
    }
}
