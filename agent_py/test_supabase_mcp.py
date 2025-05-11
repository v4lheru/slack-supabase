"""
Test script for the Supabase MCP server integration.
This script tests the connection to the Supabase MCP server and executes a simple query.
"""

import os
import asyncio
from dotenv import load_dotenv
from agents.mcp import MCPServerStdio

# Load environment variables
load_dotenv()

# Get Supabase access token from environment variables
supabase_access_token = os.getenv("SUPABASE_ACCESS_TOKEN")
if not supabase_access_token:
    print("ERROR: SUPABASE_ACCESS_TOKEN is not set. Please set it in your .env file.")
    exit(1)

# Create Supabase MCP server instance
supabase_mcp_server = MCPServerStdio(
    name="supabase",
    params={
        "command": "npx",
        "args": [
            "-y", 
            "@supabase/mcp-server-supabase@latest", 
            "--access-token", 
            supabase_access_token
        ],
        "env": {
            "XDG_CONFIG_HOME": os.environ.get("XDG_CONFIG_HOME", "/tmp"),
        }
    },
    client_session_timeout_seconds=120.0,
    cache_tools_list=True
)

async def test_supabase_mcp():
    """Test the Supabase MCP server connection and functionality."""
    print("🔌 Connecting to Supabase MCP server...")
    try:
        await supabase_mcp_server.connect()
        print("✅ Successfully connected to Supabase MCP server.")
        
        # Get list of available tools
        print("\n📋 Getting list of available tools...")
        tools = await supabase_mcp_server.list_tools()
        print(f"✅ Found {len(tools)} tools:")
        for i, tool in enumerate(tools, 1):
            print(f"  {i}. {tool.name}")
        
        # Test listing projects
        print("\n🏢 Testing list_projects tool...")
        try:
            projects_result = await supabase_mcp_server.execute_tool(
                "list_projects", 
                {}
            )
            print("✅ Successfully listed projects:")
            for project in projects_result:
                print(f"  - {project.get('name', 'Unknown')} ({project.get('id', 'Unknown ID')})")
        except Exception as e:
            print(f"❌ Error listing projects: {e}")
        
        # Test listing tables (if project is scoped)
        print("\n📊 Testing list_tables tool...")
        try:
            tables_result = await supabase_mcp_server.execute_tool(
                "list_tables", 
                {"schemas": ["public"]}
            )
            print("✅ Successfully listed tables:")
            for table in tables_result:
                print(f"  - {table}")
        except Exception as e:
            print(f"❌ Error listing tables: {e}")
            print("   This may be expected if the server is not scoped to a specific project.")
        
        # Test executing SQL (if project is scoped)
        print("\n🔍 Testing execute_sql tool...")
        try:
            sql_result = await supabase_mcp_server.execute_tool(
                "execute_sql", 
                {"sql": "SELECT current_timestamp as time, current_database() as db"}
            )
            print("✅ Successfully executed SQL query:")
            print(f"  Result: {sql_result}")
        except Exception as e:
            print(f"❌ Error executing SQL: {e}")
            print("   This may be expected if the server is not scoped to a specific project.")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase MCP server: {e}")
    finally:
        # Disconnect from the server
        try:
            await supabase_mcp_server.disconnect()
            print("\n🔌 Disconnected from Supabase MCP server.")
        except Exception as e:
            print(f"\n❌ Error disconnecting from Supabase MCP server: {e}")

if __name__ == "__main__":
    # Run the test
    asyncio.run(test_supabase_mcp())
