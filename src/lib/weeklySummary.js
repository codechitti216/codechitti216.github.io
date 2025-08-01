export function generateWeeklySummary(posts) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter posts by date
  const recentPosts = posts.filter(post => {
    const postDate = new Date(post.date);
    return postDate >= oneWeekAgo;
  });
  
  // Group by status
  const newHypotheses = recentPosts.filter(p => p.status === 'hypothesis');
  const newExperiments = recentPosts.filter(p => p.status === 'experiment');
  const completedExperiments = recentPosts.filter(p => p.results.executed);
  
  // Find stale experiments
  const staleExperiments = posts.filter(p => p.isStale);
  
  // Find posts that need attention
  const needsExperiment = posts.filter(p => p.hypothesis && !p.experiment.defined);
  const needsResults = posts.filter(p => p.experiment.defined && !p.results.executed);
  
  // Calculate statistics
  const totalPosts = posts.length;
  const completionRate = totalPosts > 0 ? Math.round((posts.filter(p => p.results.executed).length / totalPosts) * 100) : 0;
  
  const summary = {
    period: {
      start: oneWeekAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    statistics: {
      totalPosts,
      completionRate,
      newHypotheses: newHypotheses.length,
      newExperiments: newExperiments.length,
      completedThisWeek: completedExperiments.length,
      staleExperiments: staleExperiments.length
    },
    newHypotheses,
    newExperiments,
    completedExperiments,
    staleExperiments,
    needsAttention: {
      needsExperiment,
      needsResults
    },
    recommendations: generateRecommendations(posts, needsExperiment, needsResults, staleExperiments)
  };
  
  return summary;
}

function generateRecommendations(posts, needsExperiment, needsResults, staleExperiments) {
  const recommendations = [];
  
  if (needsExperiment.length > 0) {
    recommendations.push({
      type: 'experiment_definition',
      priority: 'high',
      message: `${needsExperiment.length} post${needsExperiment.length > 1 ? 's' : ''} have hypotheses but no experiments defined`,
      posts: needsExperiment.slice(0, 3) // Show top 3
    });
  }
  
  if (needsResults.length > 0) {
    recommendations.push({
      type: 'results_logging',
      priority: 'high',
      message: `${needsResults.length} experiment${needsResults.length > 1 ? 's' : ''} defined but no results logged`,
      posts: needsResults.slice(0, 3)
    });
  }
  
  if (staleExperiments.length > 0) {
    recommendations.push({
      type: 'stale_experiments',
      priority: 'medium',
      message: `${staleExperiments.length} experiment${staleExperiments.length > 1 ? 's' : ''} defined >7 days ago with no results`,
      posts: staleExperiments.slice(0, 3)
    });
  }
  
  // Suggest next actions based on completion patterns
  const completedPosts = posts.filter(p => p.results.executed);
  if (completedPosts.length > 0) {
    const recentCompletions = completedPosts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    recommendations.push({
      type: 'follow_up',
      priority: 'low',
      message: 'Consider follow-up experiments based on recent completions',
      posts: recentCompletions
    });
  }
  
  return recommendations;
}

export function formatWeeklySummary(summary) {
  const { period, statistics, newHypotheses, newExperiments, completedExperiments, staleExperiments, needsAttention, recommendations } = summary;
  
  let markdown = `# Weekly Research Summary
**Period**: ${period.start} to ${period.end}

## 📊 Statistics
- **Total Posts**: ${statistics.totalPosts}
- **Completion Rate**: ${statistics.completionRate}%
- **New Hypotheses**: ${statistics.newHypotheses}
- **New Experiments**: ${statistics.newExperiments}
- **Completed This Week**: ${statistics.completedThisWeek}
- **Stale Experiments**: ${statistics.staleExperiments}

`;

  if (newHypotheses.length > 0) {
    markdown += `## 🧠 New Hypotheses
${newHypotheses.map(post => `- **${post.title}**: ${post.hypothesis}`).join('\n')}

`;
  }
  
  if (newExperiments.length > 0) {
    markdown += `## 🔬 New Experiments
${newExperiments.map(post => `- **${post.title}**: ${post.experiment.description}`).join('\n')}

`;
  }
  
  if (completedExperiments.length > 0) {
    markdown += `## ✅ Completed Experiments
${completedExperiments.map(post => `- **${post.title}**: ${post.results.outcome} - ${post.results.summary}`).join('\n')}

`;
  }
  
  if (staleExperiments.length > 0) {
    markdown += `## ⚠️ Stale Experiments (Need Attention)
${staleExperiments.map(post => `- **${post.title}**: Defined ${post.daysSinceUpdate} days ago`).join('\n')}

`;
  }
  
  if (recommendations.length > 0) {
    markdown += `## 🎯 Recommendations
    
`;
    
    recommendations.forEach(rec => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      markdown += `${priorityIcon} **${rec.message}**
`;
      
      if (rec.posts && rec.posts.length > 0) {
        rec.posts.forEach(post => {
          markdown += `  - ${post.title}
`;
        });
      }
      markdown += `
`;
    });
  }
  
  if (needsAttention.needsExperiment.length > 0) {
    markdown += `## 📝 Next Actions
### Define Experiments
${needsAttention.needsExperiment.map(post => `- [ ] Define experiment for: ${post.title}`).join('\n')}

`;
  }
  
  if (needsAttention.needsResults.length > 0) {
    markdown += `### Log Results
${needsAttention.needsResults.map(post => `- [ ] Log results for: ${post.title}`).join('\n')}

`;
  }
  
  markdown += `---
*Generated on ${new Date().toISOString().split('T')[0]}*
`;
  
  return markdown;
} 