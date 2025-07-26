# Teste do endpoint de registro
$uri = "http://localhost:3000/api/auth/register"
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    firstName = "Test"
    lastName = "User"
    username = "testuser$(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Testando endpoint: $uri"
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content: $($response.Content)"
} catch {
    Write-Host "Erro: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
} 