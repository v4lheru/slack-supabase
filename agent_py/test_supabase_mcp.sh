#!/bin/bash

# Test script for the Supabase MCP server
# This script runs the Supabase MCP server and tests the connection

# Check if the .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create a .env file with your Supabase credentials."
    exit 1
fi

# Source the .env file to get the environment variables
source .env

# Check if the SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN is not set in the .env file."
    exit 1
fi

echo "🔍 Testing Supabase MCP server connection..."

# Run the Supabase MCP server using npx
echo "🚀 Starting Supabase MCP server..."
npx -y @supabase/mcp-server-supabase@latest --access-token $SUPABASE_ACCESS_TOKEN

# Check if the server started successfully
if [ $? -eq 0 ]; then
    echo "✅ Supabase MCP server started successfully."
    echo "✅ Your Supabase MCP server is configured correctly."
else
    echo "❌ Error: Failed to start Supabase MCP server."
    echo "❌ Please check your Supabase credentials and try again."
    exit 1
fi

echo "🧪 Running Python test script..."
python test_supabase_mcp.py

echo "✅ Test completed."
