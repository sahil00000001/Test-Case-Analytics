import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, Settings, PieChart as PieChartIcon, LayoutGrid, FileText, Download, RefreshCw, CheckCircle, XCircle, MinusCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import type { DashboardState } from "@shared/schema";

const COLORS = {
  passed: "hsl(142, 76%, 36%)", // Professional Green
  failed: "hsl(348, 86%, 61%)", // Professional Red
  skipped: "hsl(35, 91%, 62%)", // Professional Orange
  info: "hsl(221, 83%, 53%)",   // Professional Blue
};

const ENVIRONMENTS = [
  { value: "PROD", label: "PROD" },
  { value: "UAT", label: "UAT" },
  { value: "DEV", label: "DEV" },
  { value: "Sandbox", label: "Sandbox" },
];

const SITES = [
  { value: "LON1A", label: "LON1A" },
  { value: "LON1B", label: "LON1B" },
  { value: "NOV1A", label: "NOV1A" },
  { value: "NOV1B", label: "NOV1B" },
  { value: "FRA1", label: "FRA1" },
  { value: "JHB1A", label: "JHB1A" },
];

interface ChartData {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = data.percent ? `${(data.percent * 100).toFixed(1)}%` : '';
    return (
      <div className="bg-black/90 text-white p-3 rounded-lg border border-gray-200 shadow-lg">
        <p className="text-sm font-medium">{`${data.name}: ${data.value}`}</p>
        {percentage && <p className="text-xs text-gray-300">{percentage}</p>}
      </div>
    );
  }
  return null;
};

const PieChartComponent = ({ data, size = 200, innerRadius = 60, showTotal = false }: { 
  data: ChartData[]; 
  size?: number; 
  innerRadius?: number; 
  showTotal?: boolean;
}) => {
  const hasData = data.some(item => item.value > 0);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const getColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'passed': return COLORS.passed;
      case 'failed': return COLORS.failed;
      case 'skipped': return COLORS.skipped;
      default: return COLORS.info;
    }
  };
  
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4" style={{ height: size + 20, width: size + 20 }}>
      {hasData ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={size} height={size}>
              <Pie
                data={data.filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={(size / 2) - 15} // Reduced outer radius to prevent edge touching
                paddingAngle={3} // Increased padding between segments
                dataKey="value"
                animationBegin={0}
                animationDuration={600}
              >
                {data.filter(item => item.value > 0).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.name)}
                    stroke="white"
                    strokeWidth={3} // Increased stroke width for better separation
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {showTotal && total > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{total}</div>
                <div className="text-xs text-muted-foreground font-medium">Total</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <PieChartIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { toast } = useToast();
  
  const [state, setState] = useState<DashboardState>({
    config: {},
    testCases: {},
    widgets: {
      telemetry: {},
      inbound: {},
      outbound: {},
    },
    remarks: {},
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  
  const totalTestCases = state.testCases.totalTestCases || 0;
  const passedTestCases = state.testCases.passedTestCases || 0;
  const failedTestCases = state.testCases.failedTestCases || 0;
  const skippedTestCases = state.testCases.skippedTestCases || 0;
  
  // Validation logic
  const validateTestCases = () => {
    const errors: string[] = [];
    const sum = passedTestCases + failedTestCases + skippedTestCases;
    
    if (totalTestCases > 0 && sum > totalTestCases) {
      errors.push("Sum of passed, failed, and skipped test cases cannot exceed total test cases");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  useEffect(() => {
    validateTestCases();
  }, [totalTestCases, passedTestCases, failedTestCases, skippedTestCases]);
  
  const overallChartData: ChartData[] = [
    { name: "Passed", value: passedTestCases },
    { name: "Failed", value: failedTestCases },
    { name: "Skipped", value: skippedTestCases },
  ];
  
  const getWidgetChartData = (widgetKey: keyof typeof state.widgets): ChartData[] => {
    const widget = state.widgets[widgetKey];
    return [
      { name: "Passed", value: widget.passed || 0 },
      { name: "Failed", value: widget.failed || 0 },
      { name: "Skipped", value: widget.skipped || 0 },
    ];
  };
  
  const handleEnvironmentChange = (value: string) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, environment: value as any }
    }));
  };
  
  const handleSiteChange = (value: string) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, site: value as any }
    }));
  };
  
  const handleTotalCasesChange = (value: string) => {
    const total = parseInt(value) || 0;
    setState(prev => ({
      ...prev,
      testCases: { ...prev.testCases, totalTestCases: total }
    }));
  };
  
  const handlePassedCasesChange = (value: string) => {
    const passed = parseInt(value) || 0;
    setState(prev => ({
      ...prev,
      testCases: { ...prev.testCases, passedTestCases: passed }
    }));
  };
  
  const handleFailedCasesChange = (value: string) => {
    const failed = parseInt(value) || 0;
    setState(prev => ({
      ...prev,
      testCases: { ...prev.testCases, failedTestCases: failed }
    }));
  };
  
  const handleSkippedCasesChange = (value: string) => {
    const skipped = parseInt(value) || 0;
    setState(prev => ({
      ...prev,
      testCases: { ...prev.testCases, skippedTestCases: skipped }
    }));
  };
  
  const handleWidgetChange = (widget: keyof typeof state.widgets, field: 'total' | 'passed' | 'failed' | 'skipped', value: string) => {
    const numValue = parseInt(value) || 0;
    setState(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widget]: { ...prev.widgets[widget], [field]: numValue }
      }
    }));
  };
  
  const handleRemarksChange = (field: keyof typeof state.remarks, value: string) => {
    setState(prev => ({
      ...prev,
      remarks: { ...prev.remarks, [field]: value }
    }));
  };
  
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      // Show loading toast
      toast({
        title: "Exporting Dashboard",
        description: "Generating optimized PDF-ready export...",
      });
      
      // Show the optimized export layout temporarily
      const exportContent = document.querySelector('.export-only-content') as HTMLElement;
      if (!exportContent) {
        throw new Error('Export layout not found');
      }
      
      // Temporarily show the export content
      exportContent.style.display = 'block';
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configure html2canvas for high quality
      const canvas = await html2canvas(exportContent, {
        scale: 2, // High resolution for professional quality
        backgroundColor: '#ffffff', // White background for professional appearance
        useCORS: true, // Handle cross-origin images
        allowTaint: true,
        height: exportContent.scrollHeight,
        width: exportContent.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        removeContainer: false,
        logging: false, // Disable console logs
        windowWidth: 1200, // Ensure consistent width
        windowHeight: exportContent.scrollHeight,
      });
      
      // Hide the export content again
      exportContent.style.display = 'none';
      
      // Ensure minimum resolution for professional quality
      if (canvas.width < 800) {
        throw new Error('Export resolution too low for professional quality');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.download = generateFilename();
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success notification
      toast({
        title: "Export Successful",
        description: `Optimized dashboard exported as ${generateFilename()}`,
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      
      // Hide export content if it's still showing
      const exportContent = document.querySelector('.export-only-content') as HTMLElement;
      if (exportContent) {
        exportContent.style.display = 'none';
      }
      
      // Try fallback export method
      try {
        await handleFallbackExport();
      } catch (fallbackError) {
        console.error('Fallback export also failed:', fallbackError);
        
        // Error notification with retry option
        toast({
          title: "Export Failed",
          description: "Unable to export dashboard. Please check your browser settings and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleFallbackExport = async () => {
    // Fallback method: try to export with basic settings using optimized layout
    const exportContent = document.querySelector('.export-only-content') as HTMLElement;
    if (!exportContent) {
      throw new Error('Export layout not found');
    }
    
    // Show the export content temporarily
    exportContent.style.display = 'block';
    
    // Wait a moment for rendering
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(exportContent, {
      scale: 1, // Reduced scale for compatibility
      backgroundColor: '#ffffff',
      useCORS: false,
      allowTaint: false,
      logging: false,
    });
    
    // Hide the export content again
    exportContent.style.display = 'none';
    
    const link = document.createElement('a');
    link.download = generateFilename();
    link.href = canvas.toDataURL('image/png', 0.8);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful (Fallback)",
      description: "Optimized dashboard exported with basic quality settings.",
    });
  };
  
  const generateFilename = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const environment = state.config.environment?.replace(/\s+/g, '-') || 'NoEnv';
    const site = state.config.site?.replace(/\s+/g, '-') || 'NoSite';
    
    return `test-case-dashboard-${environment}-${site}-${dateStr}.png`;
  };
  
  const handleReset = () => {
    setState({
      config: {},
      testCases: {},
      widgets: {
        telemetry: {},
        inbound: {},
        outbound: {},
      },
      remarks: {},
    });
    setValidationErrors([]);
    
    toast({
      title: "Dashboard Reset",
      description: "All data has been cleared successfully.",
    });
  };
  
  return (
    <div className="min-h-screen gradient-bg" id="dashboard-export-container">
      {/* Modern Header */}
      <header className="glass-effect backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Test Case Analytics
                </h1>
                <p className="text-muted-foreground font-medium">Enterprise Quality Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className={`modern-button text-white shadow-lg transition-all duration-200 ${
                  isExporting 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                }`}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Report</span>
                  </>
                )}
              </Button>
              
              <Button onClick={handleReset} className="modern-button bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg">
                <RefreshCw className="w-5 h-5" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Configuration Section */}
        <div className="animate-fade-in">
          <Card className="dashboard-card mb-12">
            <CardHeader className="pb-8">
              <CardTitle className="section-header">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Environment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Environment and Site Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Environment
                  </Label>
                  <Select value={state.config.environment || ""} onValueChange={handleEnvironmentChange}>
                    <SelectTrigger className="modern-input h-14 text-lg font-medium">
                      <SelectValue placeholder="Select Environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map(env => (
                        <SelectItem key={env.value} value={env.value} className="text-lg py-3">
                          {env.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-foreground flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Site Location
                  </Label>
                  <Select value={state.config.site || ""} onValueChange={handleSiteChange}>
                    <SelectTrigger className="modern-input h-14 text-lg font-medium">
                      <SelectValue placeholder="Select Site" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITES.map(site => (
                        <SelectItem key={site.value} value={site.value} className="text-lg py-3">
                          {site.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Test Case Metrics Input */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  Test Case Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center text-base font-semibold text-foreground">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
                        <FileText className="w-3 h-3 text-blue-600" />
                      </div>
                      Total Cases
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={state.testCases.totalTestCases || ""}
                      onChange={(e) => handleTotalCasesChange(e.target.value)}
                      className={`modern-input h-12 text-lg font-semibold ${validationErrors.length > 0 ? 'validation-error' : ''}`}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="flex items-center text-base font-semibold text-foreground">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      Passed
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={state.testCases.passedTestCases || ""}
                      onChange={(e) => handlePassedCasesChange(e.target.value)}
                      className={`modern-input h-12 text-lg font-semibold ${validationErrors.length > 0 ? 'validation-error' : ''}`}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="flex items-center text-base font-semibold text-foreground">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-2">
                        <XCircle className="w-3 h-3 text-red-600" />
                      </div>
                      Failed
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={state.testCases.failedTestCases || ""}
                      onChange={(e) => handleFailedCasesChange(e.target.value)}
                      className={`modern-input h-12 text-lg font-semibold ${validationErrors.length > 0 ? 'validation-error' : ''}`}
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="flex items-center text-base font-semibold text-foreground">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-2">
                        <MinusCircle className="w-3 h-3 text-orange-600" />
                      </div>
                      Skipped
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={state.testCases.skippedTestCases || ""}
                      onChange={(e) => handleSkippedCasesChange(e.target.value)}
                      className={`modern-input h-12 text-lg font-semibold ${validationErrors.length > 0 ? 'validation-error' : ''}`}
                      min="0"
                    />
                  </div>
                </div>
              
              {/* Validation Status */}
              <div className="mt-4 space-y-2">
                {validationErrors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Validation Error</span>
                    </div>
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{totalTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sum:</span>
                    <span className="font-medium">{passedTestCases + failedTestCases + skippedTestCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difference:</span>
                    <span className={`font-medium ${(totalTestCases - (passedTestCases + failedTestCases + skippedTestCases)) < 0 ? 'text-red-500' : ''}`}>
                      {totalTestCases - (passedTestCases + failedTestCases + skippedTestCases)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${validationErrors.length === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {validationErrors.length === 0 ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
        
        {/* Analytics Section - REVERSED LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          
          {/* LEFT SIDE: Three Widget Charts */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                    <LayoutGrid className="w-4 h-4 text-white" />
                  </div>
                  Widget Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Telemetry Widget */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-bold text-foreground flex items-center justify-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2">
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        Telemetry
                      </h4>
                      
                      {/* Total input for Telemetry */}
                      <div className="mb-3">
                        <Label className="text-xs text-muted-foreground">Total Tests</Label>
                        <Input
                          type="number"
                          value={state.widgets.telemetry.total || ""}
                          onChange={(e) => handleWidgetChange('telemetry', 'total', e.target.value)}
                          className="metric-input text-sm text-center h-8"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <PieChartComponent data={getWidgetChartData('telemetry')} size={120} innerRadius={30} showTotal={true} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <Label className="text-xs text-muted-foreground">Passed</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.passed || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'passed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Failed</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.failed || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'failed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Skipped</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.skipped || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'skipped', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inbound Widget */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-bold text-foreground flex items-center justify-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-2">
                          <LayoutGrid className="w-3 h-3 text-white" />
                        </div>
                        Inbound
                      </h4>
                      
                      {/* Total input for Inbound */}
                      <div className="mb-3">
                        <Label className="text-xs text-muted-foreground">Total Tests</Label>
                        <Input
                          type="number"
                          value={state.widgets.inbound.total || ""}
                          onChange={(e) => handleWidgetChange('inbound', 'total', e.target.value)}
                          className="metric-input text-sm text-center h-8"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <PieChartComponent data={getWidgetChartData('inbound')} size={120} innerRadius={30} showTotal={true} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <Label className="text-xs text-muted-foreground">Passed</Label>
                          <Input
                            type="number"
                            value={state.widgets.inbound.passed || ""}
                            onChange={(e) => handleWidgetChange('inbound', 'passed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Failed</Label>
                          <Input
                            type="number"
                            value={state.widgets.inbound.failed || ""}
                            onChange={(e) => handleWidgetChange('inbound', 'failed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Skipped</Label>
                          <Input
                            type="number"
                            value={state.widgets.inbound.skipped || ""}
                            onChange={(e) => handleWidgetChange('inbound', 'skipped', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outbound Widget */}
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h4 className="text-sm font-bold text-foreground flex items-center justify-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                          <LayoutGrid className="w-3 h-3 text-white" />
                        </div>
                        Outbound
                      </h4>
                      
                      {/* Total input for Outbound */}
                      <div className="mb-3">
                        <Label className="text-xs text-muted-foreground">Total Tests</Label>
                        <Input
                          type="number"
                          value={state.widgets.outbound.total || ""}
                          onChange={(e) => handleWidgetChange('outbound', 'total', e.target.value)}
                          className="metric-input text-sm text-center h-8"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <PieChartComponent data={getWidgetChartData('outbound')} size={120} innerRadius={30} showTotal={true} />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <Label className="text-xs text-muted-foreground">Passed</Label>
                          <Input
                            type="number"
                            value={state.widgets.outbound.passed || ""}
                            onChange={(e) => handleWidgetChange('outbound', 'passed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Failed</Label>
                          <Input
                            type="number"
                            value={state.widgets.outbound.failed || ""}
                            onChange={(e) => handleWidgetChange('outbound', 'failed', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Skipped</Label>
                          <Input
                            type="number"
                            value={state.widgets.outbound.skipped || ""}
                            onChange={(e) => handleWidgetChange('outbound', 'skipped', e.target.value)}
                            className="metric-input text-xs h-7"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* RIGHT SIDE: Overall Chart */}
          <div className="xl:col-span-1">
            <Card className="dashboard-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
                    <PieChartIcon className="w-4 h-4 text-white" />
                  </div>
                  Overall Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <PieChartComponent data={overallChartData} size={240} innerRadius={60} showTotal={true} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Passed</span>
                    </div>
                    <span className="font-bold">{passedTestCases}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Failed</span>
                    </div>
                    <span className="font-bold">{failedTestCases}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span>Skipped</span>
                    </div>
                    <span className="font-bold">{skippedTestCases}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Remarks Section */}
        <Card className="dashboard-card mb-12 animate-fade-in">
          <CardHeader className="pb-6">
            <CardTitle className="section-header">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Analysis & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
                  Overall Analysis
                </Label>
                <Textarea
                  rows={8}
                  placeholder="Describe overall test failures, patterns, root causes, and improvement recommendations..."
                  value={state.remarks.overall || ""}
                  onChange={(e) => handleRemarksChange('overall', e.target.value)}
                  className="modern-input resize-none text-base"
                />
              </div>
              
              <div className="space-y-6">
                <Label className="text-lg font-semibold text-foreground flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mr-2"></div>
                  Widget-Specific Notes
                </Label>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                    <Label className="text-sm font-bold text-foreground flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-2">
                        <BarChart3 className="w-3 h-3 text-white" />
                      </div>
                      Telemetry Widget
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Telemetry-specific failures, patterns, and issues..."
                      value={state.remarks.telemetry || ""}
                      onChange={(e) => handleRemarksChange('telemetry', e.target.value)}
                      className="modern-input resize-none text-sm"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4">
                    <Label className="text-sm font-bold text-foreground flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-2">
                        <LayoutGrid className="w-3 h-3 text-white" />
                      </div>
                      Inbound Widget
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Inbound-specific failures, patterns, and issues..."
                      value={state.remarks.inbound || ""}
                      onChange={(e) => handleRemarksChange('inbound', e.target.value)}
                      className="modern-input resize-none text-sm"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4">
                    <Label className="text-sm font-bold text-foreground flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                        <LayoutGrid className="w-3 h-3 text-white" />
                      </div>
                      Outbound Widget
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Outbound-specific failures, patterns, and issues..."
                      value={state.remarks.outbound || ""}
                      onChange={(e) => handleRemarksChange('outbound', e.target.value)}
                      className="modern-input resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Modern Status Summary */}
        <Card className="dashboard-card bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-800/50 border-0 animate-fade-in">
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{totalTestCases}</div>
                <div className="text-sm font-medium text-muted-foreground">Total Test Cases</div>
              </div>
              <div className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{passedTestCases + failedTestCases + skippedTestCases}</div>
                <div className="text-sm font-medium text-muted-foreground">Processed Cases</div>
              </div>
              
              <div className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-all duration-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                  validationErrors.length === 0 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}>
                  {validationErrors.length === 0 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  validationErrors.length === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {validationErrors.length === 0 ? 'Valid' : 'Invalid'}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Data Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Optimized Export Layout - Only visible during export */}
      <div className="export-only-content hidden print:block" style={{ display: 'none' }}>
        {/* Minimal Header */}
        <div className="export-header bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-start space-x-4">
            <span className="text-lg font-semibold text-gray-800">
              Environment: {state.config.environment || 'Not Selected'}
            </span>
            <span className="text-lg font-semibold text-gray-800">
              Site: {state.config.site || 'Not Selected'}
            </span>
          </div>
        </div>

        {/* Optimized Main Content Layout */}
        <div className="export-main-content bg-white p-8">
          {/* Color Legend at the top */}
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-bold text-gray-900 mb-3 text-center">Chart Color Legend</h4>
            <div className="flex justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.passed }}></div>
                <span className="text-sm font-semibold text-gray-800">Passed Test Cases</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.failed }}></div>
                <span className="text-sm font-semibold text-gray-800">Failed Test Cases</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.skipped }}></div>
                <span className="text-sm font-semibold text-gray-800">Skipped Test Cases</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 min-h-[500px]">
            
            {/* Left Section - Overall Test Cases (60% space) */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <PieChartComponent 
                  data={overallChartData} 
                  size={320} 
                  innerRadius={100} 
                  showTotal={false}
                />
                {/* Large, clear center display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{totalTestCases}</div>
                    <div className="text-base font-medium text-gray-600 mb-3">Total Test Cases</div>
                    <div className="space-y-1 text-sm font-bold">
                      <div className="text-green-700">✓ Passed: {passedTestCases}</div>
                      <div className="text-red-700">✗ Failed: {failedTestCases}</div>
                      <div className="text-orange-700">⊖ Skipped: {skippedTestCases}</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center">Overall Test Cases</h3>
            </div>

            {/* Right Section - Critical Widgets (40% space) */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Top Widget */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <PieChartComponent 
                    data={getWidgetChartData('telemetry')} 
                    size={160} 
                    innerRadius={45} 
                    showTotal={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {(state.widgets.telemetry.total || 0)}
                      </div>
                      <div className="text-xs font-medium text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
                <h4 className="text-base font-bold text-gray-900">Critical Telemetry</h4>
              </div>

              {/* Bottom Two Widgets Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <PieChartComponent 
                      data={getWidgetChartData('inbound')} 
                      size={140} 
                      innerRadius={40} 
                      showTotal={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {(state.widgets.inbound.total || 0)}
                        </div>
                        <div className="text-xs font-medium text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 text-center">Critical Inbound</h4>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <PieChartComponent 
                      data={getWidgetChartData('outbound')} 
                      size={140} 
                      innerRadius={40} 
                      showTotal={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {(state.widgets.outbound.total || 0)}
                        </div>
                        <div className="text-xs font-medium text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 text-center">Critical Outbound</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Remarks Section - Centered */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">Test Case Failure Analysis</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-4xl mx-auto">
              <div className="text-sm text-gray-800 leading-relaxed text-center">
                <div className="mb-3 font-medium">
                  {state.remarks.overall || 'No general remarks provided.'}
                </div>
                {state.remarks.telemetry && (
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-500">
                    <strong>Critical Telemetry Analysis:</strong> {state.remarks.telemetry}
                  </div>
                )}
                {state.remarks.inbound && (
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-green-500">
                    <strong>Critical Inbound Analysis:</strong> {state.remarks.inbound}
                  </div>
                )}
                {state.remarks.outbound && (
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-purple-500">
                    <strong>Critical Outbound Analysis:</strong> {state.remarks.outbound}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
