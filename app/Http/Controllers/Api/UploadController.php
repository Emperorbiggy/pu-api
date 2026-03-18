<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\PollingUnit;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UploadController extends Controller
{
    public function uploadAll(Request $request)
    {
        set_time_limit(300); // Increase to 5 minutes
        
        // Debug: Log the request data
        \Log::info('Upload request data:', [
            'hasFile' => $request->hasFile('file'),
            'allFiles' => $request->allFiles(),
            'requestInput' => $request->all(),
            'headers' => $request->headers->all()
        ]);
        
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max, any file type
        ]);

        try {
            $file = $request->file('file');
            
            // Additional validation for file extension
            $allowedExtensions = ['xlsx', 'xls', 'csv'];
            if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedExtensions)) {
                return response()->json(['error' => 'Invalid file type. Please upload an Excel file (.xlsx, .xls, .csv)'], 422);
            }
            
            $filePath = $file->storeAs('uploads', 'data_' . time() . '.' . $file->getClientOriginalExtension());

            // Use Laravel Excel's built-in import functionality
            $data = Excel::toArray([], $filePath);
            
            if (empty($data) || empty($data[0])) {
                return response()->json(['error' => 'No data found in file'], 400);
            }

            $result = $this->processAllData(collect($data[0]));
            
            return response()->json([
                'message' => 'File uploaded and processed successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error processing file: ' . $e->getMessage()], 500);
        }
    }

    public function uploadWards(Request $request)
    {
        set_time_limit(300); // Increase to 5 minutes
        
        $request->validate([
            'file' => 'required|file|max:10240'
        ]);

        try {
            $file = $request->file('file');
            
            // Additional validation for file extension
            $allowedExtensions = ['xlsx', 'xls', 'csv'];
            if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedExtensions)) {
                return response()->json(['error' => 'Invalid file type. Please upload an Excel file (.xlsx, .xls, .csv)'], 422);
            }
            
            $filePath = $file->storeAs('uploads', 'wards_' . time() . '.' . $file->getClientOriginalExtension());
            
            $data = Excel::toArray([], $filePath);
            $data = collect($data[0]);

            if ($data->isEmpty()) {
                return response()->json(['error' => 'No data found in Excel file'], 400);
            }

            $result = $this->processWardsData($data);

            return response()->json([
                'message' => 'Wards uploaded and processed successfully',
                'data' => $result
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'error' => 'Failed to process file',
                'details' => $error->getMessage()
            ], 500);
        }
    }

    public function uploadPollingUnits(Request $request)
    {
        set_time_limit(300); // Increase to 5 minutes
        
        $request->validate([
            'file' => 'required|file|max:10240'
        ]);

        try {
            $file = $request->file('file');
            
            // Additional validation for file extension
            $allowedExtensions = ['xlsx', 'xls', 'csv'];
            if (!in_array(strtolower($file->getClientOriginalExtension()), $allowedExtensions)) {
                return response()->json(['error' => 'Invalid file type. Please upload an Excel file (.xlsx, .xls, .csv)'], 422);
            }
            
            $filePath = $file->storeAs('uploads', 'polling_units_' . time() . '.' . $file->getClientOriginalExtension());
            
            $data = Excel::toArray([], $filePath);
            $data = collect($data[0]);

            if ($data->isEmpty()) {
                return response()->json(['error' => 'No data found in Excel file'], 400);
            }

            $result = $this->processPollingUnitsData($data);

            return response()->json([
                'message' => 'Polling Units uploaded and processed successfully',
                'data' => $result
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'error' => 'Failed to process file',
                'details' => $error->getMessage()
            ], 500);
        }
    }

    private function processAllData($data)
    {
        $uniqueLGAs = new \Illuminate\Support\Collection();
        $uniqueWards = collect();
        $pollingUnits = collect();

        // Convert array to collection if needed
        $data = collect($data);
        
        // Skip header row if it exists
        if ($data->isNotEmpty()) {
            $firstRow = $data->first();
            $headers = is_array($firstRow) ? $firstRow : $firstRow->toArray();
            $data = $data->skip(1);
        } else {
            return [
                'lgas' => 0,
                'wards' => 0,
                'pollingUnits' => 0,
                'details' => [
                    'lgaList' => [],
                    'wardList' => [],
                    'pollingUnitsInserted' => []
                ]
            ];
        }

        $data->each(function ($row, $index) use ($uniqueLGAs, $uniqueWards, $pollingUnits, $headers) {
            $rowArray = is_array($row) ? $row : $row->toArray();
            
            $lga = $this->getValue($rowArray, $headers, ['LGA', 'lga', 'Local Government Area']);
            $ward = $this->getValue($rowArray, $headers, ['RA', 'Ward', 'ward', 'WARD']);
            $puName = $this->getValue($rowArray, $headers, ['PU', 'Polling Unit Name/Description', 'Polling Unit Name', 'PU Name', 'pu_name']);
            $puCode = $this->getValue($rowArray, $headers, ['Polling Unit Code', 'PU Code', 'pu_code', 'Code', 'CODE']) ?? 'PU-' . ($index + 1);
            $registeredVoters = $this->getValue($rowArray, $headers, ['REGD VOTERS', 'Registered Voters', 'Voters', 'registered_voters']) ?? 0;

            if ($lga) $uniqueLGAs->push($lga);
            if ($lga && $ward) {
                $uniqueWards->put("{$lga}-{$ward}", ['name' => $ward, 'lga' => $lga]);
            }
            if ($puName && $ward && $lga) {
                $pollingUnits->push([
                    'name' => $puName,
                    'code' => $puCode,
                    'ward' => $ward,
                    'lga' => $lga,
                    'registered_voters' => (int)$registeredVoters
                ]);
            }
        });

        // Debug logging
        \Log::info('Processing data:', [
            'uniqueLGAs' => $uniqueLGAs->unique()->count(),
            'uniqueWards' => $uniqueWards->count(),
            'pollingUnits' => $pollingUnits->count(),
            'samplePU' => $pollingUnits->first()
        ]);

        $lgaIds = $this->insertLGAs($uniqueLGAs->unique());
        $wardIds = $this->insertWards($uniqueWards, $lgaIds);
        $insertedPollingUnits = $this->insertPollingUnits($pollingUnits, $wardIds);

        return [
            'lgas' => $uniqueLGAs->unique()->count(),
            'wards' => $uniqueWards->count(),
            'pollingUnits' => $insertedPollingUnits->count(),
            'details' => [
                'lgaList' => $uniqueLGAs->unique()->values(),
                'wardList' => $uniqueWards->values(),
                'pollingUnitsInserted' => $insertedPollingUnits->values()
            ]
        ];
    }

    private function processWardsData($data)
    {
        // Convert array to collection if needed
        $data = collect($data);
        
        // Skip header row if it exists
        if ($data->isNotEmpty()) {
            $firstRow = $data->first();
            $headers = is_array($firstRow) ? $firstRow : $firstRow->toArray();
            $data = $data->skip(1);
        } else {
            return [
                'lgas' => 0,
                'wards' => 0,
                'totalInFile' => 0,
                'skipped' => 0
            ];
        }

        $uniqueWards = collect();
        $uniqueLGAs = collect();

        $data->each(function ($row) use ($uniqueWards, $uniqueLGAs, $headers) {
            $rowArray = is_array($row) ? $row : $row->toArray();
            
            $lga = $this->getValue($rowArray, $headers, ['LGA', 'lga', 'Local Government Area']);
            $ward = $this->getValue($rowArray, $headers, ['RA', 'Ward', 'ward', 'WARD']);

            if ($lga) $uniqueLGAs->push($lga);
            if ($lga && $ward) {
                $uniqueWards->put("{$lga}-{$ward}", ['name' => $ward, 'lga' => $lga]);
            }
        });

        $lgaIds = $this->insertLGAs($uniqueLGAs->unique());
        $this->insertWards($uniqueWards, $lgaIds);

        return [
            'lgas' => $uniqueLGAs->unique()->count(),
            'wards' => $uniqueWards->count(),
            'totalInFile' => $data->count(),
            'skipped' => 0
        ];
    }

    private function processPollingUnitsData($data)
    {
        // Convert array to collection if needed
        $data = collect($data);
        
        // Skip header row if it exists
        if ($data->isNotEmpty()) {
            $firstRow = $data->first();
            $headers = is_array($firstRow) ? $firstRow : $firstRow->toArray();
            $data = $data->skip(1);
        } else {
            return [
                'inserted' => 0,
                'totalInFile' => 0,
                'skipped' => 0
            ];
        }

        $pollingUnits = collect();

        $data->each(function ($row, $index) use ($pollingUnits, $headers) {
            $rowArray = is_array($row) ? $row : $row->toArray();
            
            $lga = $this->getValue($rowArray, $headers, ['LGA', 'lga', 'Local Government Area']);
            $ward = $this->getValue($rowArray, $headers, ['RA', 'Ward', 'ward', 'WARD']);
            $puName = $this->getValue($rowArray, $headers, ['PU', 'Polling Unit Name/Description', 'Polling Unit Name', 'PU Name', 'pu_name']);
            $puCode = $this->getValue($rowArray, $headers, ['Polling Unit Code', 'PU Code', 'pu_code', 'Code', 'CODE']) ?? 'PU-' . ($index + 1);
            $registeredVoters = $this->getValue($rowArray, $headers, ['REGD VOTERS', 'Registered Voters', 'Voters', 'registered_voters']) ?? 0;

            if ($puName && $ward && $lga) {
                $pollingUnits->push([
                    'name' => $puName,
                    'code' => $puCode,
                    'ward' => $ward,
                    'lga' => $lga,
                    'registered_voters' => (int)$registeredVoters
                ]);
            }
        });

        $wardIds = $this->getExistingWards();
        $insertedPollingUnits = $this->insertPollingUnits($pollingUnits, $wardIds);

        return [
            'inserted' => $insertedPollingUnits->count(),
            'totalInFile' => $data->count(),
            'skipped' => $data->count() - $insertedPollingUnits->count(),
            'details' => [
                'insertedPollingUnits' => $insertedPollingUnits->values()
            ]
        ];
    }

    private function getValue($row, $headers, $possibleKeys)
    {
        foreach ($possibleKeys as $key) {
            $index = array_search($key, $headers);
            if ($index !== false && isset($row[$index]) && !empty($row[$index])) {
                return $row[$index];
            }
        }
        return null;
    }

    private function insertLGAs($lgas)
    {
        $existingLGAs = Lga::pluck('name')->toArray();
        $newLGAs = $lgas->filter(fn($lga) => !in_array($lga, $existingLGAs));
        
        if ($newLGAs->isNotEmpty()) {
            $lgaIds = collect();
            $batchInsert = [];
            
            foreach ($newLGAs as $lgaName) {
                $batchInsert[] = ['name' => $lgaName, 'created_at' => now(), 'updated_at' => now()];
            }
            
            Lga::insert($batchInsert);
            
            // Get the inserted LGAs with their IDs
            $inserted = Lga::whereIn('name', $newLGAs)->get();
            foreach ($inserted as $lga) {
                $lgaIds->put($lga->name, $lga->id);
            }
            
            // Include existing LGAs
            foreach ($lgas as $lgaName) {
                if (!$lgaIds->has($lgaName)) {
                    $existingLga = Lga::where('name', $lgaName)->first();
                    if ($existingLga) {
                        $lgaIds->put($lgaName, $existingLga->id);
                    }
                }
            }
            
            return $lgaIds;
        }
        
        // Only existing LGAs
        return Lga::whereIn('name', $lgas)->pluck('id', 'name');
    }

    private function insertWards($wards, $lgaIds)
    {
        $existingWards = Ward::with('lga')
            ->get()
            ->mapWithKeys(function ($ward) {
                return ["{$ward->lga->name}-{$ward->name}" => $ward->id];
            });
        
        $newWards = collect();
        $batchInsert = [];
        
        foreach ($wards as $key => $wardData) {
            $lgaId = $lgaIds->get($wardData['lga']);
            $wardKey = "{$wardData['lga']}-{$wardData['name']}";
            
            if ($lgaId && !$existingWards->has($wardKey)) {
                $batchInsert[] = [
                    'name' => $wardData['name'],
                    'lga_id' => $lgaId,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
                $newWards->put($wardKey, $wardData);
            }
        }
        
        if (!empty($batchInsert)) {
            Ward::insert($batchInsert);
            
            // Get newly inserted wards
            $inserted = Ward::whereIn('name', $newWards->pluck('name'))->get();
            foreach ($inserted as $ward) {
                $wardData = $newWards->get("{$ward->lga->name}-{$ward->name}");
                if ($wardData) {
                    $existingWards->put("{$wardData['lga']}-{$ward->name}", $ward->id);
                }
            }
        }
        
        return $existingWards;
    }

    private function getExistingWards()
    {
        return Ward::with('lga')
            ->get()
            ->mapWithKeys(function ($ward) {
                return ["{$ward->lga->name}-{$ward->name}" => $ward->id];
            });
    }

    private function insertPollingUnits($pollingUnits, $wardIds)
    {
        $insertedPollingUnits = collect();
        
        \Log::info('Inserting polling units:', [
            'totalPollingUnits' => $pollingUnits->count(),
            'wardIdsCount' => $wardIds->count(),
            'sampleWardId' => $wardIds->first(),
            'samplePU' => $pollingUnits->first()
        ]);
        
        // Get all existing polling unit codes at once for faster checking
        $existingCodes = PollingUnit::pluck('code')->toArray();
        
        // Batch insert polling units
        $batchInsert = [];
        foreach ($pollingUnits as $pu) {
            $wardId = $wardIds->get("{$pu['lga']}-{$pu['ward']}");
            
            if ($wardId && !in_array($pu['code'], $existingCodes)) {
                $batchInsert[] = [
                    'name' => $pu['name'],
                    'code' => $pu['code'],
                    'ward_id' => $wardId,
                    'registered_voters' => $pu['registered_voters'],
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
        }
        
        // Insert in batches of 500 to avoid memory issues
        if (!empty($batchInsert)) {
            $chunks = array_chunk($batchInsert, 500);
            foreach ($chunks as $chunk) {
                PollingUnit::insert($chunk);
            }
            
            // Get the inserted records for response
            $insertedCodes = array_column($batchInsert, 'code');
            $insertedRecords = PollingUnit::whereIn('code', $insertedCodes)->get();
            
            foreach ($insertedRecords as $record) {
                $pu = collect($batchInsert)->firstWhere('code', $record->code);
                $insertedPollingUnits->push([
                    'id' => $record->id,
                    'name' => $record->name,
                    'code' => $record->code,
                    'ward' => $pu['ward'] ?? 'Unknown',
                    'lga' => $pu['lga'] ?? 'Unknown'
                ]);
            }
        }
        
        \Log::info("Final inserted polling units count: {$insertedPollingUnits->count()}");
        return $insertedPollingUnits;
    }
}
