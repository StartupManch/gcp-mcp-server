#!/usr/bin/env node

/**
 * Full GCP MCP Server Test with Authentication
 * Tests actual GCP operations with real credentials
 */

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

async function testMCPServerWithGCP() {
  console.log('🚀 Testing GCP MCP Server with Authentication\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
  });

  const client = new Client(
    {
      name: 'test-client-gcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  try {
    console.log('📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');

    // Test 1: List projects
    console.log('📋 Test 1: Listing GCP projects...');
    try {
      const projectsResponse = await client.callTool({
        name: 'list-projects',
        arguments: {},
      });

      console.log('✅ Projects retrieved successfully!');
      if (projectsResponse.content && projectsResponse.content[0]) {
        const content = projectsResponse.content[0];
        if (content.type === 'text') {
          const projectsData = JSON.parse(content.text);
          console.log(`   Found ${projectsData.projects?.length || 0} projects`);

          if (projectsData.projects && projectsData.projects.length > 0) {
            console.log('   First few projects:');
            projectsData.projects.slice(0, 3).forEach(project => {
              console.log(`     • ${project.projectId} (${project.name})`);
            });

            // Test 2: Select a project
            const firstProject = projectsData.projects[0];
            console.log(`\n🎯 Test 2: Selecting project "${firstProject.projectId}"...`);

            const selectResponse = await client.callTool({
              name: 'select-project',
              arguments: {
                projectId: firstProject.projectId,
              },
            });

            console.log('✅ Project selected successfully!');
            if (selectResponse.content && selectResponse.content[0]) {
              const selectContent = selectResponse.content[0];
              if (selectContent.type === 'text') {
                console.log(`   ${selectContent.text}`);
              }
            }

            // Test 3: Get billing info
            console.log(`\n💰 Test 3: Getting billing information...`);
            try {
              const billingResponse = await client.callTool({
                name: 'get-billing-info',
                arguments: {},
              });

              console.log('✅ Billing info retrieved successfully!');
              if (billingResponse.content && billingResponse.content[0]) {
                const billingContent = billingResponse.content[0];
                if (billingContent.type === 'text') {
                  const billingData = JSON.parse(billingContent.text);
                  console.log(`   Billing enabled: ${billingData.billingEnabled}`);
                  if (billingData.billingAccountName) {
                    console.log(`   Billing account: ${billingData.billingAccountName}`);
                  }
                }
              }
            } catch (billingError) {
              console.log('⚠️  Billing info not available (may require additional permissions)');
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to list projects:', error.message);
    }

    console.log('\n🎉 GCP MCP Server testing completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Test session ended\n');
  }
}

testMCPServerWithGCP().catch(console.error);
