@echo off
REM Test script for the Supabase MCP server on Windows
REM This script runs the Supabase MCP server and tests the connection

REM Check if the .env file exists
if not exist .env (
    echo X Error: .env file not found. Please create a .env file with your Supabase credentials.
    exit /b 1
)

REM Load environment variables from .env file
for /f "tokens=*" %%a in (.env) do (
    set %%a
)

REM Check if the SUPABASE_ACCESS_TOKEN is set
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo X Error: SUPABASE_ACCESS_TOKEN is not set in the .env file.
    exit /b 1
)

echo 🔍 Testing Supabase MCP server connection...

REM Run the Supabase MCP server using npx
echo 🚀 Starting Supabase MCP server...
npx -y @supabase/mcp-server-supabase@latest --access-token %SUPABASE_ACCESS_TOKEN%

REM Check if the server started successfully
if %ERRORLEVEL% equ 0 (
    echo ✅ Supabase MCP server started successfully.
    echo ✅ Your Supabase MCP server is configured correctly.
) else (
    echo X Error: Failed to start Supabase MCP server.
    echo X Please check your Supabase credentials and try again.
    exit /b 1
)

echo 🧪 Running Python test script...
python test_supabase_mcp.py

echo ✅ Test completed.
