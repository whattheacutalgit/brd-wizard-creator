
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface InitialBrdResponse {
  content: string;
  questions: string[];
  brd_id: string;
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
      const response = await apiPost<InitialBrdResponse>("/api/brd/generate-initial", formData);
      setInitialBrd(response);
      toast.success("Initial BRD draft generated successfully");
    } catch (error) {
      console.error("Failed to generate initial BRD", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleContinue = () => {
    if (!initialBrd) return;
    navigate(`/brd/final/${initialBrd.brd_id}`, { 
      state: { 
        questions: initialBrd.questions,
        content: initialBrd.content,
        projectId 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin-slow">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generate BRD - Initial Draft</h1>
        <p className="text-muted-foreground mt-2">
          {project?.name} - Create an initial draft of your Business Requirements Document
        </p>
      </div>

      {!initialBrd ? (
        <Card>
          <CardHeader>
            <CardTitle>BRD Generation Settings</CardTitle>
            <CardDescription>
              Provide information to generate your initial BRD draft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want in your Business Requirements Document..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                For example: "Create a BRD for an e-commerce platform with user authentication, product catalog, cart functionality, and payment processing."
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template (Optional)</Label>
              <Input
                id="template"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Upload a template document to base your BRD on (DOCX, PDF, etc.)
              </p>
            </div>

            <Button 
              onClick={handleGenerateInitialBrd} 
              disabled={!prompt || generating}
              className="w-full"
            >
              {generating ? 
                "Generating Draft..." : 
                "Generate Initial BRD Draft"
              }
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Initial BRD Draft</CardTitle>
              <CardDescription>
                Review the AI-generated draft of your Business Requirements Document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <div className="p-4 max-h-96 overflow-y-auto border rounded-md bg-secondary/50">
                  {initialBrd.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up Questions</CardTitle>
              <CardDescription>
                The AI has identified these questions to help refine your BRD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {initialBrd.questions.map((question, idx) => (
                  <li key={idx} className="text-sm">{question}</li>
                ))}
              </ul>
              <div className="mt-8">
                <Button onClick={handleContinue} className="w-full">
                  Continue to Final BRD <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
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
