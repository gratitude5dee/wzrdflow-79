
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useAuth } from '@/providers/AuthProvider';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export const ApiKeysForm = () => {
  const { apiKeys, isLoading, storeApiKeys } = useApiKeys();
  const { user } = useAuth();
  const [lumaApiKey, setLumaApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showLumaKey, setShowLumaKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when API keys are loaded
  useState(() => {
    if (apiKeys) {
      if (apiKeys.lumaApiKey) setLumaApiKey(apiKeys.lumaApiKey);
      if (apiKeys.claudeApiKey) setClaudeApiKey(apiKeys.claudeApiKey);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    await storeApiKeys(lumaApiKey || null, claudeApiKey || null);
    setIsSaving(false);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>You must be logged in to manage API keys</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Add your API keys to enable advanced features. Your keys are securely stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="luma-api-key" className="text-sm font-medium">
              Luma API Key
            </label>
            <div className="flex">
              <Input
                id="luma-api-key"
                type={showLumaKey ? "text" : "password"}
                placeholder="Enter your Luma API key"
                value={lumaApiKey}
                onChange={(e) => setLumaApiKey(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowLumaKey(!showLumaKey)}
                className="ml-2"
              >
                {showLumaKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="claude-api-key" className="text-sm font-medium">
              Claude API Key
            </label>
            <div className="flex">
              <Input
                id="claude-api-key"
                type={showClaudeKey ? "text" : "password"}
                placeholder="Enter your Claude API key"
                value={claudeApiKey}
                onChange={(e) => setClaudeApiKey(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowClaudeKey(!showClaudeKey)}
                className="ml-2"
              >
                {showClaudeKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? 'Saving...' : 'Save API Keys'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeysForm;
