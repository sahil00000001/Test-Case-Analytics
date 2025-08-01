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
  skipped: "hsl(210, 6%, 50%)", // Professional Gray
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
    },
    remarks: {},
  });
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Comment system state
  const [comments, setComments] = useState<Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    formatting: {
      isBold: boolean;
      isItalic: boolean;
      fontSize: string;
    };
  }>>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentTitle, setNewCommentTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  
  // Formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState('text-base');
  
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
    if (!widget) return [];
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
      },
      remarks: {},
    });
    setValidationErrors([]);
    setComments([]);
    
    toast({
      title: "Dashboard Reset",
      description: "All data has been cleared successfully.",
    });
  };

  // Comment system handlers
  const handleSaveComment = () => {
    if (!newCommentContent.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      title: newCommentTitle.trim() || '',
      content: newCommentContent.trim(),
      timestamp: Date.now(),
      formatting: {
        isBold,
        isItalic,
        fontSize,
      },
    };
    
    setComments(prev => [...prev, newComment]);
    setNewCommentTitle('');
    setNewCommentContent('');
    setIsAddingComment(false);
    
    // Reset formatting
    setIsBold(false);
    setIsItalic(false);
    setFontSize('text-base');
    
    toast({
      title: "Comment Added",
      description: "Your analysis comment has been saved successfully.",
    });
  };

  const handleEditComment = (comment: typeof comments[0]) => {
    setEditingCommentId(comment.id);
    setEditingTitle(comment.title);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editingTitle.trim() || !editingContent.trim()) return;
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, title: editingTitle.trim(), content: editingContent.trim() }
        : comment
    ));
    
    setEditingCommentId(null);
    setEditingTitle('');
    setEditingContent('');
    
    toast({
      title: "Comment Updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    
    toast({
      title: "Comment Deleted",
      description: "The comment has been removed successfully.",
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-12">
          
          {/* LEFT SIDE: Single Critical Features Widget */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="dashboard-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                    <LayoutGrid className="w-4 h-4 text-white" />
                  </div>
                  Critical Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {/* Single Telemetry Widget - Premium Design */}
                  <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-indigo-900/30 rounded-2xl p-8 shadow-2xl border border-blue-200/50 dark:border-blue-700/50 max-w-2xl w-full">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-bold text-foreground flex items-center justify-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        Telemetry
                      </h4>
                      
                      {/* Total and Passed Test Cases - Side by Side */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 shadow-md">
                          <Label className="text-base font-semibold text-muted-foreground block mb-2">Total Test Cases</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.total || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'total', e.target.value)}
                            className="metric-input text-xl text-center h-12 font-bold border-2 border-blue-200 focus:border-blue-400"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div className="bg-green-50/80 dark:bg-green-900/30 rounded-xl p-4 shadow-md border border-green-200 dark:border-green-700">
                          <Label className="text-base font-semibold text-green-700 dark:text-green-300 block mb-2">Passed Test Cases</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.passed || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'passed', e.target.value)}
                            className="metric-input text-xl text-center h-12 font-bold border-2 border-green-200 focus:border-green-400 bg-white/90 dark:bg-gray-700/90"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6 bg-white/50 dark:bg-gray-800/30 rounded-2xl p-4 shadow-inner">
                        <PieChartComponent data={getWidgetChartData('telemetry')} size={200} innerRadius={60} showTotal={true} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div className="bg-red-50/80 dark:bg-red-900/30 rounded-xl p-4 shadow-md border border-red-200 dark:border-red-700">
                          <Label className="text-base font-semibold text-red-700 dark:text-red-300 block mb-2">Failed</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.failed || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'failed', e.target.value)}
                            className="metric-input text-lg text-center h-11 font-bold border-2 border-red-200 focus:border-red-400 bg-white/90 dark:bg-gray-700/90"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div className="bg-gray-50/80 dark:bg-gray-700/30 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-600">
                          <Label className="text-base font-semibold text-gray-700 dark:text-gray-300 block mb-2">Skipped</Label>
                          <Input
                            type="number"
                            value={state.widgets.telemetry.skipped || ""}
                            onChange={(e) => handleWidgetChange('telemetry', 'skipped', e.target.value)}
                            className="metric-input text-lg text-center h-11 font-bold border-2 border-gray-200 focus:border-gray-400 bg-white/90 dark:bg-gray-700/90"
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
          
          {/* RIGHT SIDE: Overall Chart - 75% Larger */}
          <div className="xl:col-span-3">
            <Card className="dashboard-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  Overall Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <PieChartComponent data={overallChartData} size={280} innerRadius={80} showTotal={true} />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-base">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-semibold">Passed</span>
                    </div>
                    <span className="font-bold text-lg">{passedTestCases}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-semibold">Failed</span>
                    </div>
                    <span className="font-bold text-lg">{failedTestCases}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                      <span className="font-semibold">Skipped</span>
                    </div>
                    <span className="font-bold text-lg">{skippedTestCases}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Analysis & Insights Section - Modular Comment System */}
        <Card className="dashboard-card mb-12 animate-fade-in">
          <CardHeader className="pb-6">
            <CardTitle className="section-header">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Analysis & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Comment Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsAddingComment(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAddingComment}
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">+</span>
                </div>
                Add New Comment
              </button>
            </div>

            {/* New Comment Input Box */}
            {isAddingComment && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700 shadow-lg animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-2 block">Comment Title (Optional)</Label>
                    <Input
                      type="text"
                      value={newCommentTitle}
                      onChange={(e) => setNewCommentTitle(e.target.value)}
                      placeholder="Enter a title (optional)..."
                      className="modern-input text-base h-12 border-2 border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground mb-2 block">Comment Content</Label>
                    
                    {/* Formatting Toolbar */}
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-white/60 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setIsBold(!isBold)}
                        className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                          isBold ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsItalic(!isItalic)}
                        className={`px-3 py-1 rounded text-sm italic transition-colors ${
                          isItalic ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        I
                      </button>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="px-2 py-1 rounded text-sm bg-gray-100 border border-gray-300 focus:border-blue-400"
                      >
                        <option value="text-sm">Small</option>
                        <option value="text-base">Normal</option>
                        <option value="text-lg">Large</option>
                        <option value="text-xl">Extra Large</option>
                      </select>
                    </div>
                    
                    <Textarea
                      rows={6}
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Write your analysis, insights, observations, or recommendations..."
                      className={`modern-input resize-none border-2 border-blue-200 focus:border-blue-400 ${fontSize} ${
                        isBold ? 'font-bold' : ''
                      } ${isItalic ? 'italic' : ''}`}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsAddingComment(false);
                        setNewCommentTitle('');
                        setNewCommentContent('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveComment}
                      disabled={!newCommentContent.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Save Comment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Comments Display - Clean Card Design */}
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all duration-200 ${
                    index % 4 === 0 ? 'bg-blue-50/60 border-blue-100' :
                    index % 4 === 1 ? 'bg-green-50/60 border-green-100' :
                    index % 4 === 2 ? 'bg-purple-50/60 border-purple-100' :
                    'bg-amber-50/60 border-amber-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <Input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="text-lg font-semibold bg-white/80 border-gray-200 focus:border-blue-400"
                          />
                          <Textarea
                            rows={3}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="bg-white/80 border-gray-200 focus:border-blue-400 resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          {comment.title && (
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              {comment.title}
                            </h4>
                          )}
                          <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${
                            comment.formatting?.fontSize || 'text-base'
                          } ${comment.formatting?.isBold ? 'font-bold' : ''} ${
                            comment.formatting?.isItalic ? 'italic' : ''
                          }`}>
                            {comment.content}
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 ml-4">
                      {editingCommentId === comment.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingTitle('');
                              setEditingContent('');
                            }}
                            className="p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && !isAddingComment && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">No comments added yet</p>
                  <p className="text-sm">Click the + button above to add your first analysis comment</p>
                </div>
              )}
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
                  size={450} 
                  innerRadius={130} 
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

            {/* Right Section - Telemetry (40% space) */}
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <PieChartComponent 
                    data={getWidgetChartData('telemetry')} 
                    size={320} 
                    innerRadius={90} 
                    showTotal={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {(state.widgets.telemetry.total || 0)}
                      </div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Total Tests</div>
                      <div className="space-y-1 text-xs font-bold">
                        <div className="text-green-700">✓ Passed: {state.widgets.telemetry.passed || 0}</div>
                        <div className="text-red-700">✗ Failed: {state.widgets.telemetry.failed || 0}</div>
                        <div className="text-gray-600">⊖ Skipped: {state.widgets.telemetry.skipped || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center">Telemetry</h3>
              </div>
            </div>
          </div>

          {/* Analysis Section - Enhanced with Comments */}
          <div className="mt-8 border-t-2 border-gray-300 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">📋</span>
              </div>
              Analysis & Insights
            </h3>
            
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={comment.id} className={`rounded-2xl p-5 border shadow-sm ${
                    index % 4 === 0 ? 'bg-blue-50/60 border-blue-100' :
                    index % 4 === 1 ? 'bg-green-50/60 border-green-100' :
                    index % 4 === 2 ? 'bg-purple-50/60 border-purple-100' :
                    'bg-amber-50/60 border-amber-100'
                  }`}>
                    {comment.title && (
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">{comment.title}</h4>
                    )}
                    <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap ${
                      comment.formatting?.fontSize || 'text-base'
                    } ${comment.formatting?.isBold ? 'font-bold' : ''} ${
                      comment.formatting?.isItalic ? 'italic' : ''
                    }`}>
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-8 shadow-lg text-center">
                <div className="text-gray-500 text-lg">
                  No analysis comments have been added yet.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
