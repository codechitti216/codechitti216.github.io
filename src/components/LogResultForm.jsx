import { useState } from 'react';

export function LogResultForm({ post, onSave }) {
  const [formData, setFormData] = useState({
    executed: post.results.executed || false,
    outcome: post.results.outcome || '',
    summary: post.results.summary || '',
    next_action: post.next_action || '',
    evolution_note: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: In a real implementation, this would save to the markdown file
    // For now, we'll just show what would be saved
    const updatedData = {
      results: {
        executed: formData.executed,
        outcome: formData.outcome,
        summary: formData.summary,
      },
      next_action: formData.next_action,
      evolution: formData.evolution_note ? [
        ...(post.evolution || []),
        {
          date: new Date().toISOString().split('T')[0],
          note: formData.evolution_note,
        }
      ] : post.evolution || [],
    };
    
    console.log('Would save:', updatedData);
    alert('Log Result functionality will be fully implemented with file editing capabilities in Phase 4');
    
    if (onSave) {
      onSave(updatedData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Experiment Results</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Results Execution */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="executed"
            checked={formData.executed}
            onChange={(e) => handleInputChange('executed', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="executed" className="text-sm font-medium text-gray-700">
            Experiment executed
          </label>
        </div>

        {/* Outcome */}
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            id="outcome"
            value={formData.outcome}
            onChange={(e) => handleInputChange('outcome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select outcome...</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="partial">Partial Success</option>
          </select>
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Results Summary
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the key findings, metrics, and insights from the experiment..."
          />
        </div>

        {/* Next Action */}
        <div>
          <label htmlFor="next_action" className="block text-sm font-medium text-gray-700 mb-1">
            Next Action
          </label>
          <input
            type="text"
            id="next_action"
            value={formData.next_action}
            onChange={(e) => handleInputChange('next_action', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What should be done next?"
          />
        </div>

        {/* Evolution Note */}
        <div>
          <label htmlFor="evolution_note" className="block text-sm font-medium text-gray-700 mb-1">
            Add Evolution Note (Optional)
          </label>
          <input
            type="text"
            id="evolution_note"
            value={formData.evolution_note}
            onChange={(e) => handleInputChange('evolution_note', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief note about how this idea evolved..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setFormData({
              executed: post.results.executed || false,
              outcome: post.results.outcome || '',
              summary: post.results.summary || '',
              next_action: post.next_action || '',
              evolution_note: '',
            })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Results
          </button>
        </div>
      </form>
    </div>
  );
} 