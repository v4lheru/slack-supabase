# Railway Deployment Instructions

This document provides instructions for deploying the Slack bot and Python agent to Railway.

## Overview

The application consists of two parts that need to be deployed separately:
1. **Node.js Slack Bot** - Handles Slack events and messaging
2. **Python Agent** - Runs the OpenAI Agent with MCP tool integration

## Deployment Steps

### 1. Deploy the Python Agent (agent_py)

1. Create a new project in Railway
2. Connect your GitHub repository
3. Configure the deployment:
   - **Root Directory**: `agent_py`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port 8001`
   - **Port**: `8001`
   - **Environment Variables**:
     ```
     OPENAI_API_KEY=your-openai-api-key
     AGENT_MODEL=gpt-4o
     SLACK_BOT_TOKEN=your-slack-bot-token
     SLACK_TEAM_ID=your-slack-team-id
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-supabase-key
     SUPABASE_ACCESS_TOKEN=your-supabase-access-token
     ```
4. Deploy the service
5. Generate a public domain for this service
6. Copy the public URL (e.g., `https://your-agent-py-service.up.railway.app`)

### 2. Deploy the Node.js Slack Bot (root)

1. Create another new project in Railway
2. Connect the same GitHub repository
3. Configure the deployment:
   - **Root Directory**: `/` (root)
   - **Start Command**: `npm start` (default)
   - **Environment Variables**:
     ```
     SLACK_BOT_TOKEN=your-slack-bot-token
     SLACK_SIGNING_SECRET=your-slack-signing-secret
     SLACK_APP_TOKEN=your-slack-app-token
     PY_AGENT_URL=https://your-agent-py-service.up.railway.app
     SUPABASE_URL=your-supabase-url
     SUPABASE_KEY=your-supabase-key
     SUPABASE_ACCESS_TOKEN=your-supabase-access-token
     NODE_ENV=production
     ```
4. Deploy the service
5. Generate a public domain for this service
6. Copy the public URL (e.g., `https://your-slack-bot-service.up.railway.app`)

### 3. Configure Slack App

1. Go to your [Slack App's configuration page](https://api.slack.com/apps)
2. Under "Event Subscriptions":
   - Set the Request URL to your Node.js Slack Bot URL + `/slack/events` (e.g., `https://your-slack-bot-service.up.railway.app/slack/events`)
   - Subscribe to the necessary bot events (e.g., `message.channels`, `message.im`, etc.)
3. Under "Interactivity & Shortcuts":
   - Set the Request URL to your Node.js Slack Bot URL + `/slack/events` (e.g., `https://your-slack-bot-service.up.railway.app/slack/events`)
4. Save changes

## Important Notes

1. Make sure both services are deployed and running before configuring the Slack app
2. The `PY_AGENT_URL` environment variable in the Node.js Slack Bot deployment should point to the Python Agent's public URL
3. Both deployments should use the same Slack and Supabase credentials
4. The Python Agent deployment needs to have port 8001 exposed
5. If you make changes to the code, you'll need to redeploy both services

## Troubleshooting

### Slack Events Not Being Received

1. Check that the Request URL in your Slack App configuration is correct
2. Verify that the Node.js Slack Bot is running and accessible
3. Check the logs in Railway for any errors

### Agent Not Responding

1. Check that the Python Agent is running and accessible
2. Verify that the `PY_AGENT_URL` environment variable is set correctly in the Node.js Slack Bot deployment
3. Check the logs in Railway for any errors

### MCP Tools Not Working

1. Verify that the Supabase credentials are set correctly in both deployments
2. Check that the MCP server is configured correctly in the Python Agent
3. Check the logs in Railway for any errors related to the MCP server
