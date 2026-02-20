'use client';

import { Button } from '@/components/ui/button';
import { FormInput, FormSelect } from './form-field';
import { SecretSelect } from './secret-select';
import { SettingsCard } from './settings-card';
import { Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConfigurationCard({
  title,
  description,
  fields = [],
  values = {},
  editing = false,
  loading = false,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  disabled = false,
  className,
  ...props
}) {
  const handleFieldChange = (fieldName, value) => {
    onFieldChange?.(fieldName, value);
  };

  const handleSave = () => {
    onSave?.(values);
  };

  const isReadonly = !editing;

  return (
    <SettingsCard
      title={title}
      description={description}
      loading={loading}
      className={className}
      footer={
        <div className="flex gap-2 pt-2">
          {editing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={loading || disabled}
                className="ml-auto"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onEdit} disabled={loading || disabled}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      }
      {...props}
    >
      <div className="space-y-4">
        {fields.map((field) => {
          const fieldValue = values[field.name];
          const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

          switch (field.type) {
            case 'secret':
              return (
                <SecretSelect
                  key={field.name}
                  secrets={field.secrets || []}
                  selectedSecretId={fieldValue || ''}
                  onSecretChange={(value) => handleFieldChange(field.name, value)}
                  onSecretCreate={field.onSecretCreate}
                  scope={field.scope}
                  placeholder={field.placeholder}
                  disabled={isReadonly || disabled || loading}
                />
              );

            case 'select':
              return (
                <FormSelect
                  key={field.name}
                  label={field.label}
                  description={field.description}
                  required={field.required}
                  placeholder={field.placeholder}
                  options={field.options}
                  value={fieldValue || ''}
                  onValueChange={(value) => handleFieldChange(field.name, value)}
                  disabled={isReadonly || disabled || loading}
                />
              );

            case 'number':
              return (
                <FormInput
                  key={field.name}
                  label={field.label}
                  description={field.description}
                  required={field.required}
                  type="number"
                  placeholder={field.placeholder}
                  value={fieldValue || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  disabled={isReadonly || disabled || loading}
                  style={{
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                  }}
                />
              );

            default:
              return (
                <div key={field.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{field.label}</label>
                    {isReadonly && field.editable && (
                      <Button variant="outline" size="sm" onClick={onEdit}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {hasValue && !editing ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                      <span className="font-mono text-sm">{fieldValue}</span>
                      {field.badge && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {field.badge}
                        </span>
                      )}
                    </div>
                  ) : (
                    <FormInput
                      placeholder={field.placeholder}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      disabled={isReadonly || disabled || loading}
                      className={isReadonly ? 'bg-muted/50' : ''}
                    />
                  )}
                  
                  {field.description && !editing && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              );
          }
        })}
      </div>
    </SettingsCard>
  );
}
