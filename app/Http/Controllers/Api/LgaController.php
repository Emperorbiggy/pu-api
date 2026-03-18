<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lga;
use Illuminate\Http\Request;

class LgaController extends Controller
{
    public function index()
    {
        try {
            $lgas = Lga::select('id', 'name', 'code', 'description')
                ->orderBy('name')
                ->get();

            return response()->json($lgas);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to fetch LGAs'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:lgas',
                'code' => 'nullable|string|max:50|unique:lgas',
                'description' => 'nullable|string'
            ]);

            $lga = Lga::create($validated);
            return response()->json($lga, 201);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to create LGA'], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $lga = Lga::findOrFail($id);
            return response()->json($lga);
        } catch (\Exception $error) {
            return response()->json(['error' => 'LGA not found'], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $lga = Lga::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:lgas,name,' . $id,
                'code' => 'nullable|string|max:50|unique:lgas,code,' . $id,
                'description' => 'nullable|string'
            ]);

            $lga->update($validated);
            return response()->json($lga);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to update LGA'], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $lga = Lga::findOrFail($id);
            $lga->delete();
            return response()->json(null, 204);
        } catch (\Exception $error) {
            return response()->json(['error' => 'Failed to delete LGA'], 500);
        }
    }
}
