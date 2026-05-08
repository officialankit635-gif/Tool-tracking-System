import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInventoryScan } from "@workspace/api-client-react";
import { ScanBarcode, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import type { ScanResult } from "@workspace/api-client-react";

export default function Scan() {
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const scanApi = useInventoryScan();

  const handleScan = () => {
    const tools = scanInput
      .split(/[\n,]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    if (tools.length === 0) return;

    scanApi.mutate({ data: { scannedTools: tools } }, {
      onSuccess: (data) => {
        setResult(data);
      }
    });
  };

  const handleReset = () => {
    setScanInput("");
    setResult(null);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFID Inventory Scan</h1>
          <p className="text-muted-foreground">Bulk scan area to verify current physical inventory against records.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-md h-fit border-primary/20">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2">
                <ScanBarcode className="h-5 w-5 text-primary" />
                <CardTitle>Scanner Terminal</CardTitle>
              </div>
              <CardDescription>Enter comma or newline separated RFID tags</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Textarea 
                placeholder="T001&#10;T002&#10;T003" 
                className="font-mono min-h-[300px] resize-none uppercase"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                disabled={!!result || scanApi.isPending}
              />
              {!result ? (
                <Button className="w-full font-bold" size="lg" onClick={handleScan} disabled={scanApi.isPending || !scanInput.trim()}>
                  {scanApi.isPending ? "PROCESSING..." : "RUN VERIFICATION"}
                </Button>
              ) : (
                <Button className="w-full font-bold" variant="outline" size="lg" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" /> NEW SCAN
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-card border rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Scanned</p>
                    <p className="text-3xl font-black mt-1">{result.summary.total}</p>
                  </div>
                  <div className="bg-card border rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-green-500">Correct</p>
                    <p className="text-3xl font-black mt-1 text-green-500">{result.summary.correct}</p>
                  </div>
                  <div className="bg-destructive/10 border-destructive/30 border rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-destructive">Missing</p>
                    <p className="text-3xl font-black mt-1 text-destructive">{result.summary.missing}</p>
                  </div>
                  <div className="bg-orange-500/10 border-orange-500/30 border rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-orange-500">Extra/Unknown</p>
                    <p className="text-3xl font-black mt-1 text-orange-500">{result.summary.extra}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-green-500/20 shadow-sm">
                    <CardHeader className="bg-green-500/5 pb-3">
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <CardTitle className="text-sm">Verified Tools</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
                      {result.correctTools.length === 0 && <p className="text-xs text-muted-foreground italic">None</p>}
                      <div className="flex flex-col gap-1">
                        {result.correctTools.map(t => (
                          <div key={t} className="font-mono text-sm bg-green-500/10 text-green-600 px-2 py-1 rounded">{t}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/20 shadow-sm">
                    <CardHeader className="bg-destructive/5 pb-3">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <CardTitle className="text-sm">Missing Expected</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
                      {result.missingTools.length === 0 && <p className="text-xs text-muted-foreground italic">None</p>}
                      <div className="flex flex-col gap-1">
                        {result.missingTools.map(t => (
                          <div key={t} className="font-mono text-sm bg-destructive/10 text-destructive px-2 py-1 rounded">{t}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-500/20 shadow-sm">
                    <CardHeader className="bg-orange-500/5 pb-3">
                      <div className="flex items-center gap-2 text-orange-500">
                        <AlertCircle className="h-4 w-4" />
                        <CardTitle className="text-sm">Extra / Unknown</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-[400px] overflow-y-auto">
                      {result.extraTools.length === 0 && <p className="text-xs text-muted-foreground italic">None</p>}
                      <div className="flex flex-col gap-1">
                        {result.extraTools.map(t => (
                          <div key={t} className="font-mono text-sm bg-orange-500/10 text-orange-500 px-2 py-1 rounded">{t}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <ScanBarcode className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">Awaiting Scan Data</h3>
                <p className="max-w-sm">Enter RFIDs in the terminal to the left and run verification to see discrepancy report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
