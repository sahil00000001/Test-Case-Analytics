import { z } from "zod";

// Dashboard configuration schema
export const dashboardConfigSchema = z.object({
  environment: z.enum(["PROD", "UAT", "DEV", "Sandbox"]),
  site: z.enum(["LON1A", "LON1B", "NOV1A", "NOV1B", "FRA1", "JHB1A"]),
});

// Test case data schema
export const testCaseDataSchema = z.object({
  totalTestCases: z.number().min(0),
  passedTestCases: z.number().min(0),
  failedTestCases: z.number().min(0),
  skippedTestCases: z.number().min(0),
});

// Widget data schema
export const widgetDataSchema = z.object({
  total: z.number().min(0),
  passed: z.number().min(0),
  failed: z.number().min(0),
  skipped: z.number().min(0),
});

// Remarks schema
export const remarksSchema = z.object({
  overall: z.string().optional(),
  telemetry: z.string().optional(),
  inbound: z.string().optional(),
  outbound: z.string().optional(),
});

// Complete dashboard state schema with validation
export const dashboardStateSchema = z.object({
  config: dashboardConfigSchema.partial(),
  testCases: testCaseDataSchema.partial(),
  widgets: z.object({
    telemetry: widgetDataSchema.partial(),
    inbound: widgetDataSchema.partial(),
    outbound: widgetDataSchema.partial(),
  }),
  remarks: remarksSchema,
}).refine((data) => {
  // Validate that sum of passed + failed + skipped equals total for overall test cases
  const { totalTestCases, passedTestCases, failedTestCases, skippedTestCases } = data.testCases;
  if (totalTestCases && (passedTestCases || failedTestCases || skippedTestCases)) {
    const sum = (passedTestCases || 0) + (failedTestCases || 0) + (skippedTestCases || 0);
    return sum <= totalTestCases;
  }
  return true;
}, {
  message: "Sum of passed, failed, and skipped test cases cannot exceed total test cases",
});

export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;
export type TestCaseData = z.infer<typeof testCaseDataSchema>;
export type WidgetData = z.infer<typeof widgetDataSchema>;
export type Remarks = z.infer<typeof remarksSchema>;
export type DashboardState = z.infer<typeof dashboardStateSchema>;
