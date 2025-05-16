import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { apiPost, apiGet,apiUpload } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Copy, Check, Plus, Trash, ExternalLink, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatMarkdownText } from "@/lib/utils";

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
  const [uploadDate, setUploadDate] = useState<string>("");
  const [finalBrd, setFinalBrd] = useState<FinalBrdResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");

  useEffect(() => {
    if (location.state) {
      const { questions, content, summary, projectId: id, uploadDate: date } = location.state;
      setQuestions(questions || []);
      setInitialContent(content || "");
      setInitialSummary(summary || "");
      setProjectId(id || "");
      setUploadDate(date || new Date().toISOString());
      
      const initialAnswers: Record<string, string> = {};
      questions?.forEach((q: string) => {
        initialAnswers[q] = "";
      });
      setAnswers(initialAnswers);
    } else {
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
    const formData = new FormData();
    formData.append("project_id", projectId);
    formData.append("prompt", initialSummary);
    formData.append("completion_answers", JSON.stringify(answers));

    // Optional: If you want to send the same template file used in initial step (if available)
    const lastTemplate = location.state?.template as File | undefined;
    if (lastTemplate) {
      formData.append("template", lastTemplate);
    }

    const response = await apiUpload<FinalBrdResponse>("/api/brd/generate-final", formData);
    setFinalBrd(response);
    toast.success("Final BRD generated successfully");
  } catch (error) {
    console.error("Failed to generate final BRD", error);
    toast.error("Failed to generate final BRD");
  } finally {
    setGenerating(false);
  }
};


  const handleDownload = async () => {
    if (!projectId) return;
    
    try {
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

  const openInCanva = () => {
    if (!finalBrd) return;
    
    const formattedDate = new Date(uploadDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const encodedContent = encodeURIComponent(finalBrd.brd_document);
    const documentTitle = encodeURIComponent(`BRD - ${formattedDate}`);
    
    const canvaUrl = `https://www.canva.com/design/create?type=document&title=${documentTitle}`;
    
    window.open(canvaUrl, '_blank');
    toast.success("Opening in Canva for editing");
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Generate BRD - Final Draft</h1>
        <p className="mt-2 opacity-90">
          Answer the follow-up questions to refine your Business Requirements Document
        </p>
      </div>

      {!finalBrd ? (
        <Card className="bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-blue-800">Follow-up Questions</CardTitle>
            <CardDescription className="text-blue-600">
              Please answer these questions to help refine your BRD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {questions.map((question, idx) => (
              <div key={idx} className="space-y-2 relative p-4 bg-white rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`question-${idx}`} className="text-blue-800 font-medium">{idx + 1}. {question}</Label>
                  {!question.startsWith("What is the") && !question.startsWith("Who are the") && !question.startsWith("Are there any") && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(question)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            ))}

            <div className="pt-4 border-t border-blue-100">
              <p className="font-medium text-blue-800 mb-2">Add Custom Question</p>
              <div className="flex space-x-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter a custom question..."
                  className="flex-1 border-blue-200 focus:border-blue-400"
                />
                <Button 
                  onClick={addCustomQuestion} 
                  disabled={!newQuestion.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleGenerateFinalBrd} 
              disabled={generating || Object.values(answers).some(a => !a.trim())}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            >
              {generating ? (
                <>
                  <div className="mr-2 animate-spin">
                    <FileText className="h-5 w-5" />
                  </div>
                  Generating Final BRD...
                </>
              ) : (
                "Generate Final BRD"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Tabs defaultValue="brd" className="bg-white rounded-lg shadow-md">
            <TabsList className="bg-blue-50 border-b border-blue-200 p-1 rounded-t-lg w-full grid grid-cols-3">
              <TabsTrigger value="brd" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Final BRD</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">AI Feedback</TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Questions & Answers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brd" className="space-y-4 p-6">
              <Card className="border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <div>
                    <CardTitle className="text-blue-800">Final Business Requirements Document</CardTitle>
                    <CardDescription className="text-blue-600">
                      Your completed BRD based on provided information and answers
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="text-blue-700 border-blue-300 hover:bg-blue-50">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button size="sm" onClick={openInCanva} className="bg-purple-600 hover:bg-purple-700">
                      <Edit className="h-4 w-4 mr-1" /> Edit in Canva
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="p-6 border border-blue-200 rounded-md bg-white shadow-sm">
                      {finalBrd.brd_document.split('\n').map((line, i) => {
                        const formattedLine = formatMarkdownText(line);
                        return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }} />;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feedback" className="p-6">
              <Card className="border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="text-blue-800">AI Review & Feedback</CardTitle>
                  <CardDescription className="text-blue-600">
                    AI-generated feedback and suggestions for your BRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="p-4 border border-blue-200 rounded-md bg-blue-50/50">
                      {finalBrd.review_feedback.split('\n').map((line, i) => {
                        const formattedLine = formatMarkdownText(line);
                        return <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }} />;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions" className="p-6">
              <Card className="border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="text-blue-800">Questions & Answers</CardTitle>
                  <CardDescription className="text-blue-600">
                    The questions and your answers that helped refine the BRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Object.entries(answers).map(([question, answer], idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="font-medium text-blue-800">{idx + 1}. {question}</p>
                        <p className="text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-100">
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
            <Button 
              onClick={() => navigate(`/projects/${projectId}`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            >
              Return to Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrdGenerationFinal;
