# Supabase MCP Server Integration

This document explains how to set up and use the Supabase MCP (Model Context Protocol) server with this application.

## Overview

The Supabase MCP server allows AI assistants to interact directly with your Supabase project. It provides tools for managing tables, fetching configuration, querying data, and more.

## Setup

### 1. Create a Supabase Personal Access Token (PAT)

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Navigate to your account settings
3. Create a personal access token
4. Give it a name that describes its purpose, like "Slack Assistant MCP Server"
5. Copy the token, as you won't be able to see it again

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
SUPABASE_ACCESS_TOKEN=your-personal-access-token
```

Replace the placeholders with your actual Supabase project URL, service role key, and personal access token.

### 3. MCP Configuration

The MCP configuration is already set up in the `mcp.config.json` file in the root directory. It configures the Supabase MCP server to use your personal access token.

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "${SUPABASE_ACCESS_TOKEN}"
      ]
    }
  }
}
```

## Testing the Integration

### Testing the Python Agent

#### For Unix/Linux/macOS Users

1. Navigate to the `agent_py` directory
2. Run the test script:

```bash
./test_supabase_mcp.sh
```

#### For Windows Users

1. Navigate to the `agent_py` directory
2. Run the test script:

```cmd
test_supabase_mcp.bat
```

### Testing the Full Integration

To test the full integration of the Supabase MCP server with the main application, you can use the following test scripts:

#### For Unix/Linux/macOS Users

1. Navigate to the root directory
2. Run the test script:

```bash
./test_supabase_integration.sh
```

#### For Windows Users

1. Navigate to the root directory
2. Run the test script:

```cmd
test_supabase_integration.bat
```

These scripts will:
1. Check if the required environment variables are set
2. Verify the MCP configuration
3. Test the Supabase MCP server connection
4. Optionally test the Python agent with the Supabase MCP server

## Available Tools

The Supabase MCP server provides the following tools to the AI assistant:

### Project Management
- `list_projects` - Lists all Supabase projects for the user
- `get_project` - Gets details for a project
- `create_project` - Creates a new Supabase project
- `pause_project` - Pauses a project
- `restore_project` - Restores a project
- `list_organizations` - Lists all organizations that the user is a member of
- `get_organization` - Gets details for an organization

### Database Operations
- `list_tables` - Lists all tables within the specified schemas
- `list_extensions` - Lists all extensions in the database
- `list_migrations` - Lists all migrations in the database
- `apply_migration` - Applies a SQL migration to the database
- `execute_sql` - Executes raw SQL in the database
- `get_logs` - Gets logs for a Supabase project by service type

### Edge Function Management
- `list_edge_functions` - Lists all Edge Functions in a Supabase project
- `deploy_edge_function` - Deploys a new Edge Function to a Supabase project

### Project Configuration
- `get_project_url` - Gets the API URL for a project
- `get_anon_key` - Gets the anonymous API key for a project

### Branching (Experimental, requires a paid plan)
- `create_branch` - Creates a development branch with migrations from production branch
- `list_branches` - Lists all development branches
- `delete_branch` - Deletes a development branch
- `merge_branch` - Merges migrations and edge functions from a development branch to production
- `reset_branch` - Resets migrations of a development branch to a prior version
- `rebase_branch` - Rebases development branch on production to handle migration drift

### Development Tools
- `generate_typescript_types` - Generates TypeScript types based on the database schema

## Project Scoped Mode

By default, the MCP server will have access to all organizations and projects in your Supabase account. If you want to restrict the server to a specific project, you can modify the `mcp.config.json` file to include the `--project-ref` flag:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "${SUPABASE_ACCESS_TOKEN}",
        "--project-ref",
        "your-project-ref"
      ]
    }
  }
}
```

Replace `your-project-ref` with the ID of your project. You can find this under Project ID in your Supabase project settings.

## Read-Only Mode

If you wish to restrict the Supabase MCP server to read-only queries, you can modify the `mcp.config.json` file to include the `--read-only` flag:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "${SUPABASE_ACCESS_TOKEN}",
        "--read-only"
      ]
    }
  }
}
```

This prevents write operations on any of your databases by executing SQL as a read-only Postgres user.

## Resources

- [Supabase MCP Server Documentation](https://github.com/supabase/mcp-server-supabase)
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp)
