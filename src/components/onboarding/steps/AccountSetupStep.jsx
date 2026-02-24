'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Building2, Handshake, Factory } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AccountPreviewCard from '../components/AccountPreviewCard';

const ACCOUNT_TYPES = [
  { value: 'sme', label: 'SME', icon: Building },
  { value: 'mid-market', label: 'Mid-Market', icon: Building2 },
  { value: 'enterprise', label: 'Enterprise', icon: Factory },
  { value: 'crm-partner', label: 'CRM Partner', icon: Handshake },
];

const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1-10' },
  { value: '11-25', label: '11-25' },
  { value: '26-50', label: '26-50' },
  { value: '50-100', label: '50-100' },
  { value: '100-250', label: '100-250' },
  { value: '250+', label: '250+' },
];

const INDUSTRIES = [
  'Agriculture',
  'Aerospace',
  'Automotive',
  'Biotechnology',
  'Construction',
  'Consulting',
  'E-commerce',
  'Education',
  'Energy',
  'Entertainment',
  'Finance',
  'Financial Services',
  'Government',
  'Healthcare',
  'Hospitality',
  'Information Technology',
  'Insurance',
  'Legal',
  'Logistics',
  'Manufacturing',
  'Marketing',
  'Media',
  'Non-profit',
  'Pharmaceuticals',
  'Real Estate',
  'Retail',
  'Technology',
  'Telecommunications',
  'Transportation',
  'Other',
];

export default function AccountSetupStep({
  user,
  profile,
  data,
  onDataChange,
  onNext,
  onPrevious,
}) {
  const [accountName, setAccountName] = useState(data?.account_name || '');
  const [industry, setIndustry] = useState(
    data?.industry || profile?.industry || '',
  );
  const [accountType, setAccountType] = useState(data?.account_type || '');
  const [employeeRange, setEmployeeRange] = useState(
    data?.employee_range || '',
  );

  useEffect(() => {
    onDataChange({
      account_name: accountName,
      industry,
      account_type: accountType,
      employee_range: employeeRange,
    });
  }, [accountName, industry, accountType, employeeRange, onDataChange]);

  const canProceed =
    accountName.trim().length > 0 && industry && accountType && employeeRange;

  return (
    <div className='w-full min-h-screen flex items-center justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='w-full max-w-4xl'
      >
        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          {/* Left Column - Form */}
          <div className='space-y-8'>
            {/* Form Fields */}
            <motion.div
              className='space-y-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Account Name */}
              <div className='space-y-2'>
                <Label htmlFor='accountName'>Account Name</Label>
                <Input
                  id='accountName'
                  type='text'
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder='Your organization name'
                  className='h-12'
                  autoComplete='organization'
                />
              </div>

              {/* Industry and Company Size */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Industry Search Dropdown */}
                <div className='space-y-2 w-full'>
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className='h-12 w-full'>
                      <SelectValue placeholder='Select your industry' />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Size Selection */}
                <div className='space-y-2 w-full'>
                  <Label>Company Size</Label>
                  <Select
                    value={employeeRange}
                    onValueChange={setEmployeeRange}
                  >
                    <SelectTrigger className='h-12 w-full'>
                      <SelectValue placeholder='Select company size' />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Account Type Selection */}
              <div className='space-y-3'>
                <Label>Account Type</Label>
                <RadioGroup
                  value={accountType}
                  onValueChange={setAccountType}
                  className='grid grid-cols-2 gap-3'
                >
                  {ACCOUNT_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div key={type.value} className='relative'>
                        <RadioGroupItem
                          value={type.value}
                          id={type.value}
                          className='sr-only'
                        />
                        <Label
                          htmlFor={type.value}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                            transition-all duration-200 hover:border-primary/50 hover:bg-accent/50
                            ${
                              accountType === type.value
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border'
                            }
                          `}
                        >
                          <IconComponent className='w-6 h-6 mb-2 text-primary' />
                          <span className='text-sm font-medium'>
                            {type.label}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview */}
          <motion.div
            className='lg:sticky lg:top-8'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className=''>
              <AccountPreviewCard
                accountName={accountName}
                industry={industry}
                accountType={accountType}
                employeeRange={employeeRange}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
