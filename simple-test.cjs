#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const execFile = promisify(require('child_process').execFile);

console.log('🐾 PeteCoin Smart Contract Test Suite\n');

async function runClarinet(commands) {
  return new Promise((resolve, reject) => {
    const clarinet = spawn('clarinet', ['console'], { stdio: ['pipe', 'pipe', 'inherit'] });
    let output = '';
    
    clarinet.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    clarinet.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Clarinet exited with code ${code}`));
      }
    });
    
    clarinet.stdin.write(commands.join('\n') + '\n');
    clarinet.stdin.end();
  });
}

async function runTest(testName, commands, expectedOutputPattern) {
  console.log(`Testing: ${testName}`);
  try {
    const output = await runClarinet(commands);
    
    if (expectedOutputPattern.test(output)) {
      console.log('✅ PASS\n');
      return true;
    } else {
      console.log('❌ FAIL - Output did not match expected pattern');
      console.log('Output:', output.split('\n').slice(-5).join('\n'));
      return false;
    }
  } catch (error) {
    console.log('❌ FAIL - Error running test:', error.message);
    return false;
  }
}

async function main() {
  const tests = [
    {
      name: 'Token name should be "PeteCoin"',
      commands: ['(contract-call? .petecoin get-name)'],
      expected: /\(ok "PeteCoin"\)/
    },
    {
      name: 'Token symbol should be "PETE"',
      commands: ['(contract-call? .petecoin get-symbol)'],
      expected: /\(ok "PETE"\)/
    },
    {
      name: 'Token decimals should be 6',
      commands: ['(contract-call? .petecoin get-decimals)'],
      expected: /\(ok u6\)/
    },
    {
      name: 'Total supply should be 1 billion tokens',
      commands: ['(contract-call? .petecoin get-total-supply)'],
      expected: /\(ok u1000000000000000\)/
    },
    {
      name: 'Contract owner should have all tokens initially',
      commands: ['(contract-call? .petecoin get-balance tx-sender)'],
      expected: /\(ok u1000000000000000\)/
    },
    {
      name: 'Token URI should be set',
      commands: ['(contract-call? .petecoin get-token-uri)'],
      expected: /\(ok \(some u"https:\/\/petecoin\.io\/token-metadata\.json"\)\)/
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    if (await runTest(test.name, test.commands, test.expected)) {
      passed++;
    }
  }

  console.log(`\n🎯 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! PeteCoin contract is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the contract implementation.');
    process.exit(1);
  }
}

main().catch(console.error);