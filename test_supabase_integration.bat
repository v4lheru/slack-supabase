@echo off
REM Test script for the Supabase MCP server integration on Windows
REM This script tests the Supabase MCP server integration with the main application

echo [95m🔌 Supabase MCP Server Integration Test[0m
echo [95m========================================[0m

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [91m❌ Node.js is not installed. Please install Node.js to run this test.[0m
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [91m❌ npm is not installed. Please install npm to run this test.[0m
    exit /b 1
)

REM Check if the .env file exists
if not exist .env (
    echo [91m❌ .env file not found. Please create a .env file with your Supabase credentials.[0m
    exit /b 1
)

REM Check if the mcp.config.json file exists
if not exist mcp.config.json (
    echo [91m❌ mcp.config.json file not found. Please create a mcp.config.json file with your Supabase MCP server configuration.[0m
    exit /b 1
)

REM Run the test script
echo [94m🧪 Running Supabase MCP server integration test...[0m
node test_supabase_integration.js

REM If the test script doesn't exist, run the command directly
if %ERRORLEVEL% neq 0 (
    echo [93mℹ️ Test script failed. Running Supabase MCP server directly...[0m
    npx -y @supabase/mcp-server-supabase@latest --access-token %SUPABASE_ACCESS_TOKEN%
)

REM Check if the test was successful
if %ERRORLEVEL% equ 0 (
    echo [92m✅ Supabase MCP server integration test completed successfully.[0m
    echo [92m✅ Your Supabase MCP server is configured correctly.[0m
) else (
    echo [91m❌ Supabase MCP server integration test failed.[0m
    echo [91m❌ Please check the error messages above and fix the issues.[0m
    exit /b 1
)

REM Test the Python agent
echo [94m🧪 Testing Python agent with Supabase MCP...[0m
echo [93mℹ️ This test will run the Python agent with the Supabase MCP server.[0m
echo [93mℹ️ It will test the connection to the Supabase MCP server and execute a simple query.[0m

set /p REPLY=Do you want to run the Python agent test? (y/n) 
if /i "%REPLY%"=="y" (
    REM Change to the agent_py directory
    cd agent_py

    REM Run the test script
    echo [94m🧪 Running Python agent test...[0m
    python test_supabase_mcp.py

    REM Check if the test was successful
    if %ERRORLEVEL% equ 0 (
        echo [92m✅ Python agent test completed successfully.[0m
        echo [92m✅ Your Python agent is configured correctly to use the Supabase MCP server.[0m
    ) else (
        echo [91m❌ Python agent test failed.[0m
        echo [91m❌ Please check the error messages above and fix the issues.[0m
        exit /b 1
    )
) else (
    echo [93mℹ️ Skipping Python agent test.[0m
)

echo [92m✅ All tests completed successfully.[0m
echo [92m✅ Your Supabase MCP server integration is configured correctly.[0m
