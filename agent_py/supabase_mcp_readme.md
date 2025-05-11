# Supabase MCP Server Integration

This document explains how the Supabase MCP (Model Context Protocol) server is integrated into the Slack Assistant agent.

## Overview

The Supabase MCP server allows the AI assistant to interact directly with your Supabase project. It provides tools for managing tables, fetching configuration, querying data, and more.

## Configuration

The Supabase MCP server is configured in the following files:

1. `custom_slack_agent.py` - Defines the Supabase MCP server instance
2. `mcp_agent.config.yaml` - Configures the Supabase MCP server for the agent
3. `.env` - Contains the environment variables needed for the Supabase MCP server

### Environment Variables

The following environment variables are required for the Supabase MCP server:

- `SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_KEY` - The service role key for your Supabase project
- `SUPABASE_ACCESS_TOKEN` - Your Supabase personal access token

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

### Cost Confirmation
- `get_cost` - Gets the cost of a new project or branch for an organization
- `confirm_cost` - Confirms the user's understanding of new project or branch costs

## Usage

The AI assistant can use these tools to interact with your Supabase project. For example, it can:

- Query data from your Supabase database
- Create or modify tables in your database
- Deploy edge functions
- Generate TypeScript types based on your database schema

## Resources

- [Supabase MCP Server Documentation](https://github.com/supabase/mcp-server-supabase)
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp)
