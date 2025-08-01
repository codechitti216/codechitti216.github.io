#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import fm from 'front-matter';

const GARDEN_DIR = './content/garden';
const STALE_THRESHOLD_DAYS = 7;

function validateGardenPosts() {
  console.log('🔍 Validating Garden Posts...\n');
  
  const files = fs.readdirSync(GARDEN_DIR).filter(file => file.endsWith('.md'));
  const issues = [];
  const warnings = [];
  const recommendations = [];
  
  files.forEach(file => {
    const filePath = path.join(GARDEN_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { attributes: data } = fm(content);
    
    const slug = file.replace('.md', '');
    
    // Check for missing critical fields
    if (!data.hypothesis && data.status !== 'archived') {
      issues.push({
        type: 'missing_hypothesis',
        file: file,
        message: 'No hypothesis defined'
      });
    }
    
    if (data.status === 'experiment' && !data.experiment?.defined) {
      issues.push({
        type: 'missing_experiment',
        file: file,
        message: 'Status is "experiment" but no experiment defined'
      });
    }
    
    if (data.experiment?.defined && !data.results?.executed) {
      // Check for staleness
      const postDate = new Date(data.date);
      const daysSinceUpdate = Math.floor((new Date() - postDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > STALE_THRESHOLD_DAYS) {
        warnings.push({
          type: 'stale_experiment',
          file: file,
          message: `Experiment defined ${daysSinceUpdate} days ago but no results logged`,
          days: daysSinceUpdate
        });
      }
    }
    
    // Check for incomplete experiment definitions
    if (data.experiment?.defined) {
      if (!data.experiment.description) {
        warnings.push({
          type: 'incomplete_experiment',
          file: file,
          message: 'Experiment defined but no description provided'
        });
      }
      
      if (!data.experiment.baseline) {
        warnings.push({
          type: 'incomplete_experiment',
          file: file,
          message: 'Experiment defined but no baseline specified'
        });
      }
      
      if (!data.experiment.metric) {
        warnings.push({
          type: 'incomplete_experiment',
          file: file,
          message: 'Experiment defined but no metric specified'
        });
      }
    }
    
    // Check for missing next actions
    if (!data.next_action && data.status !== 'validated' && data.status !== 'archived') {
      recommendations.push({
        type: 'missing_next_action',
        file: file,
        message: 'No next action defined'
      });
    }
    
    // Check for results without outcomes
    if (data.results?.executed && !data.results?.outcome) {
      warnings.push({
        type: 'incomplete_results',
        file: file,
        message: 'Results executed but no outcome documented'
      });
    }
  });
  
  // Generate report
  console.log('📊 Validation Report\n');
  
  if (issues.length === 0 && warnings.length === 0 && recommendations.length === 0) {
    console.log('✅ All garden posts are properly structured!');
    return;
  }
  
  if (issues.length > 0) {
    console.log('🔴 Critical Issues:');
    issues.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.message}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('🟡 Warnings:');
    warnings.forEach(warning => {
      console.log(`  - ${warning.file}: ${warning.message}`);
    });
    console.log('');
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    recommendations.forEach(rec => {
      console.log(`  - ${rec.file}: ${rec.message}`);
    });
    console.log('');
  }
  
  // Summary statistics
  const totalFiles = files.length;
  const filesWithIssues = new Set([...issues, ...warnings, ...recommendations].map(item => item.file)).size;
  
  console.log('📈 Summary:');
  console.log(`  - Total files: ${totalFiles}`);
  console.log(`  - Files with issues: ${filesWithIssues}`);
  console.log(`  - Critical issues: ${issues.length}`);
  console.log(`  - Warnings: ${warnings.length}`);
  console.log(`  - Recommendations: ${recommendations.length}`);
  
  // Exit with error code if there are critical issues
  if (issues.length > 0) {
    process.exit(1);
  }
}

// Run validation
try {
  validateGardenPosts();
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
} 