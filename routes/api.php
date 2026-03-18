<?php

use App\Http\Controllers\Api\LgaController;
use App\Http\Controllers\Api\WardController;
use App\Http\Controllers\Api\PollingUnitController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('lgas', LgaController::class);
Route::apiResource('wards', WardController::class);
Route::apiResource('polling-units', PollingUnitController::class);

Route::get('all-lgas', [LgaController::class, 'index']);
Route::get('all-wards', [WardController::class, 'index']);
Route::get('all-polling-units', [PollingUnitController::class, 'index']);

// Specific filtering routes
Route::get('wards-by-lga/{lga_id}', [WardController::class, 'index']);
Route::get('polling-units-by-ward/{ward_id}', [PollingUnitController::class, 'index']);
Route::get('polling-units-by-lga/{lga_id}', [PollingUnitController::class, 'index']);

Route::post('upload', [UploadController::class, 'uploadAll']);
Route::post('upload-wards', [UploadController::class, 'uploadWards']);
Route::post('upload-polling-units', [UploadController::class, 'uploadPollingUnits']);
