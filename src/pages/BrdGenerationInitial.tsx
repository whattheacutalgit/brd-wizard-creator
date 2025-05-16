
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiUpload } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, ArrowRight, UploadCloud } from "lucide-react";
import { formatMarkdownText } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface InitialBrdResponse {
  reworded_summary: string;
  completion_suggestions: {
    status: string;
    details: string[];
  };
  brd_draft: string;
  brd_id: string; // Added for tracking the BRD
}

const BrdGenerationInitial = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialBrd, setInitialBrd] = useState<InitialBrdResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch project details here
      const mockProject: Project = {
        id: projectId!,
        name: "Project " + projectId?.substring(0, 5),
        description: "A sample project for BRD generation",
      };
      setProject(mockProject);
    } catch (error) {
      console.error("Failed to fetch project data", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadDate(new Date().toISOString());
    }
  };

  const handleGenerateInitialBrd = async () => {
    if (!projectId || !prompt) {
      toast.error("Please provide a prompt for BRD generation");
      return;
    }

    setGenerating(true);
    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("prompt", prompt);
    
    if (selectedFile) {
      formData.append("template", selectedFile);
    }

    try {
      const response = await apiUpload<InitialBrdResponse>("/api/brd/generate-initial", formData);
      setInitialBrd(response);
      toast.success("Initial BRD draft generated successfully");
    } catch (error) {
      console.error("Failed to generate initial BRD", error);
      // Error is already shown by the api function
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = () => {
    if (!initialBrd) return;
    
    const questions = Array.isArray(initialBrd.completion_suggestions?.details) 
      ? initialBrd.completion_suggestions.details 
      : [];
      
    navigate(`/brd/final/${initialBrd.brd_id || 'temp'}`, { 
      state: { 
        questions: questions,
        content: initialBrd.brd_draft || '',
        summary: initialBrd.reworded_summary || '',
        projectId,
        uploadDate
      } 
    });
  };

  const viewDocument = () => {
    if (!selectedFile) return;
    
    // Create object URL for the uploaded file
    const fileUrl = URL.createObjectURL(selectedFile);
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin-slow">
          <FileText className="h-8 w-8 text-gray-700" />
        </div>
        <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-700 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Generate BRD - Initial Draft</h1>
        <p className="mt-2 opacity-90">
          {project?.name} - Create an initial draft of your Business Requirements Document
        </p>
      </div>

      {!initialBrd ? (
        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-800">BRD Generation Settings</CardTitle>
            <CardDescription className="text-gray-600">
              Provide information to generate your initial BRD draft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-gray-700 font-medium">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want in your Business Requirements Document..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="border-gray-300 focus:border-gray-400"
              />
              <p className="text-xs text-gray-600">
                For example: "Create a BRD for an e-commerce platform with user authentication, product catalog, cart functionality, and payment processing."
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Label htmlFor="template" className="text-gray-700 font-medium">Template (Optional)</Label>
              <div className="flex flex-col space-y-3">
                <Input
                  id="template"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="border-gray-300 focus:border-gray-400"
                />
                {selectedFile && (
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-300">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="text-sm">{selectedFile.name}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={viewDocument}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      View
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Upload a template document to base your BRD on (DOCX, PDF, etc.)
              </p>
            </div>

            <Button 
              onClick={handleGenerateInitialBrd} 
              disabled={!prompt || generating}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white"
            >
              {generating ? (
                <>
                  <div className="mr-2 animate-spin">
                    <FileText className="h-5 w-5" />
                  </div>
                  Generating Draft...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Generate Initial BRD Draft
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2 bg-white border-gray-200 shadow-md">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-gray-800">Initial BRD Draft</CardTitle>
              <CardDescription className="text-gray-600">
                Review the AI-generated draft of your Business Requirements Document
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="p-4 max-h-96 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                  {typeof initialBrd.brd_draft === 'string' && 
                    initialBrd.brd_draft.split('\n').map((line, i) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: formatMarkdownText(line) }} />
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-md">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-gray-800">Follow-up Questions</CardTitle>
              <CardDescription className="text-gray-600">
                The AI has identified these questions to help refine your BRD
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {Array.isArray(initialBrd.completion_suggestions?.details) && 
                  initialBrd.completion_suggestions.details.map((question, idx) => (
                    <li key={idx} className="text-sm">{question}</li>
                  ))}
              </ul>
              <div className="mt-8">
                <Button 
                  onClick={handleContinue} 
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                >
                  Continue to Final BRD <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-gray-600 mt-2">
                  You'll be able to answer these questions in the next step
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BrdGenerationInitial;
