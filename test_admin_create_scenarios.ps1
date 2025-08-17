# Test 1: Duplicate username
Write-Host "=== Test 1: Duplicate Username ==="
$body1 = @{
    username = "testadmin"
    password = "AnotherPass123!"
} | ConvertTo-Json

$headers = @{ 'Content-Type' = 'application/json' }

try {
    $response1 = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/create' -Method POST -Headers $headers -Body $body1
    Write-Host "Unexpected Success! Status Code: $($response1.StatusCode)"
    Write-Host "Response: $($response1.Content)"
} catch {
    Write-Host "Expected Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}

Write-Host ""

# Test 2: Missing password
Write-Host "=== Test 2: Missing Password ==="
$body2 = @{
    username = "testadmin2"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/create' -Method POST -Headers $headers -Body $body2
    Write-Host "Unexpected Success! Status Code: $($response2.StatusCode)"
    Write-Host "Response: $($response2.Content)"
} catch {
    Write-Host "Expected Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}

Write-Host ""

# Test 3: Short password
Write-Host "=== Test 3: Short Password ==="
$body3 = @{
    username = "testadmin3"
    password = "123"
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/create' -Method POST -Headers $headers -Body $body3
    Write-Host "Unexpected Success! Status Code: $($response3.StatusCode)"
    Write-Host "Response: $($response3.Content)"
} catch {
    Write-Host "Expected Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}

Write-Host ""

# Test 4: Valid new admin
Write-Host "=== Test 4: Valid New Admin ==="
$body4 = @{
    username = "admin2"
    password = "SecurePass123!"
} | ConvertTo-Json

try {
    $response4 = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/create' -Method POST -Headers $headers -Body $body4
    Write-Host "Success! Status Code: $($response4.StatusCode)"
    Write-Host "Response: $($response4.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
