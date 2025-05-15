
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { apiPost, apiGet } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Copy, Check, Plus, Trash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface FinalBrdResponse {
  brd_document: string;
  review_feedback: string;
}

const BrdGenerationFinal = () => {
  const { brdId } = useParams<{ brdId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [initialContent, setInitialContent] = useState<string>("");
  const [initialSummary, setInitialSummary] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [finalBrd, setFinalBrd] = useState<FinalBrdResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    // Getting data from navigation state or fetching it if needed
    if (location.state) {
      const { questions, content, summary, projectId: id } = location.state;
      setQuestions(questions || []);
      setInitialContent(content || "");
      setInitialSummary(summary || "");
      setProjectId(id || "");
      
      // Initialize answers object with empty strings for each question
      const initialAnswers: Record<string, string> = {};
      questions?.forEach((q: string) => {
        initialAnswers[q] = "";
      });
      setAnswers(initialAnswers);
    } else {
      // If no state was passed, fetch data from API
      // In a real app, you would implement this
      toast.error("Missing BRD information. Please start over.");
      navigate("/dashboard");
    }
  }, [location.state, navigate]);

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) return;
    
    setQuestions(prev => [...prev, newQuestion]);
    setAnswers(prev => ({
      ...prev,
      [newQuestion]: ""
    }));
    setNewQuestion("");
  };

  const removeQuestion = (questionToRemove: string) => {
    setQuestions(questions.filter(q => q !== questionToRemove));
    const newAnswers = { ...answers };
    delete newAnswers[questionToRemove];
    setAnswers(newAnswers);
  };

  const handleGenerateFinalBrd = async () => {
    if (!brdId || Object.values(answers).some(a => !a.trim())) {
      toast.error("Please answer all questions to generate the final BRD");
      return;
    }

    setGenerating(true);
    try {
      const response = await apiPost<FinalBrdResponse>("/api/brd/generate-final", {
        project_id: projectId,
        completion_answers: JSON.stringify(answers)
      });
      setFinalBrd(response);
      toast.success("Final BRD generated successfully");
    } catch (error) {
      console.error("Failed to generate final BRD", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!projectId) return;
    
    try {
      // Use the api function directly with custom options
      const url = `/api/brd/download?project_id=${projectId}`;
      window.open(`http://127.0.0.1:8000${url}`, '_blank');
      toast.success("Downloading document");
    } catch (error) {
      console.error("Failed to download BRD", error);
      toast.error("Failed to download document");
    }
  };

  const handleCopyToClipboard = () => {
    if (!finalBrd) return;
    
    navigator.clipboard.writeText(finalBrd.brd_document)
      .then(() => {
        setCopied(true);
        toast.success("BRD content copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generate BRD - Final Draft</h1>
        <p className="text-muted-foreground mt-2">
          Answer the follow-up questions to refine your Business Requirements Document
        </p>
      </div>

      {!finalBrd ? (
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Questions</CardTitle>
            <CardDescription>
              Please answer these questions to help refine your BRD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, idx) => (
              <div key={idx} className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`question-${idx}`}>{idx + 1}. {question}</Label>
                  {!question.startsWith("What is the") && !question.startsWith("Who are the") && !question.startsWith("Are there any") && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(question)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  id={`question-${idx}`}
                  placeholder="Your answer..."
                  value={answers[question] || ""}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  rows={3}
                />
              </div>
            ))}

            <div className="pt-4 border-t">
              <p className="font-medium text-sm mb-2">Add Custom Question</p>
              <div className="flex space-x-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter a custom question..."
                  className="flex-1"
                />
                <Button onClick={addCustomQuestion} disabled={!newQuestion.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleGenerateFinalBrd} 
              disabled={generating || Object.values(answers).some(a => !a.trim())}
              className="w-full mt-4"
            >
              {generating ? 
                "Generating Final BRD..." : 
                "Generate Final BRD"
              }
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Tabs defaultValue="brd">
            <TabsList>
              <TabsTrigger value="brd">Final BRD</TabsTrigger>
              <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
              <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brd" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Final Business Requirements Document</CardTitle>
                    <CardDescription>
                      Your completed BRD based on provided information and answers
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="p-6 border rounded-md bg-white">
                      {finalBrd.brd_document.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feedback">
              <Card>
                <CardHeader>
                  <CardTitle>AI Review & Feedback</CardTitle>
                  <CardDescription>
                    AI-generated feedback and suggestions for your BRD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="p-4 border rounded-md bg-secondary/30">
                      {finalBrd.review_feedback.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                  <CardDescription>
                    The questions and your answers that helped refine the BRD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(answers).map(([question, answer], idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="font-medium">{idx + 1}. {question}</p>
                        <p className="text-muted-foreground bg-secondary/30 p-3 rounded-md">
                          {answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button onClick={() => navigate(`/projects/${projectId}`)}>
              Return to Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrdGenerationFinal;
