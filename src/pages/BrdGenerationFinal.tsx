
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { apiPost, apiGet } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Copy, Check, Plus, Trash, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import BrdEditor from "@/components/BrdEditor";

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
  const [editedBrdContent, setEditedBrdContent] = useState<string>("");

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

  useEffect(() => {
    if (finalBrd) {
      setEditedBrdContent(finalBrd.brd_document);
    }
  }, [finalBrd]);

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
      setEditedBrdContent(response.brd_document);
      toast.success("Final BRD generated successfully");
    } catch (error) {
      console.error("Failed to generate final BRD", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!editedBrdContent) return;
    
    navigator.clipboard.writeText(editedBrdContent)
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

  const handleEditorSave = (content: string) => {
    setEditedBrdContent(content);
    toast.success("BRD content updated");
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Generate BRD - Final Draft</h1>
        <p className="mt-2 opacity-90">
          Answer the follow-up questions to refine your Business Requirements Document
        </p>
      </div>

      {!finalBrd ? (
        <Card className="bg-white border-gray-200 shadow-md">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-800">Follow-up Questions</CardTitle>
            <CardDescription className="text-gray-600">
              Please answer these questions to help refine your BRD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {questions.map((question, idx) => (
              <div key={idx} className="space-y-2 relative p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`question-${idx}`} className="text-gray-800 font-medium">{idx + 1}. {question}</Label>
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
                  className="border-gray-300 focus:border-gray-400"
                />
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <p className="font-medium text-gray-800 mb-2">Add Custom Question</p>
              <div className="flex space-x-2">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter a custom question..."
                  className="flex-1 border-gray-300 focus:border-gray-400"
                />
                <Button 
                  onClick={addCustomQuestion} 
                  disabled={!newQuestion.trim()}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleGenerateFinalBrd} 
              disabled={generating || Object.values(answers).some(a => !a.trim())}
              className="w-full mt-4 bg-gray-800 hover:bg-gray-900 text-white"
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
            <TabsList className="bg-gray-50 border-b border-gray-200 p-1 rounded-t-lg w-full grid grid-cols-3">
              <TabsTrigger value="brd" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">Final BRD</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">AI Feedback</TabsTrigger>
              <TabsTrigger value="questions" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">Questions & Answers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="brd" className="space-y-4 p-6">
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b border-gray-200">
                  <div>
                    <CardTitle className="text-gray-800">Final Business Requirements Document</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your completed BRD based on provided information and answers
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="text-gray-700 border-gray-300 hover:bg-gray-100">
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <BrdEditor 
                    initialContent={editedBrdContent} 
                    onSave={handleEditorSave} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feedback" className="p-6">
              <Card className="border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-gray-800">AI Review & Feedback</CardTitle>
                  <CardDescription className="text-gray-600">
                    AI-generated feedback and suggestions for your BRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50/50">
                      {finalBrd.review_feedback.split('\n').map((line, i) => (
                        <div key={i}>{line || "\u00A0"}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions" className="p-6">
              <Card className="border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-gray-800">Questions & Answers</CardTitle>
                  <CardDescription className="text-gray-600">
                    The questions and your answers that helped refine the BRD
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Object.entries(answers).map(([question, answer], idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="font-medium text-gray-800">{idx + 1}. {question}</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
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
              className="bg-gray-800 hover:bg-gray-900 text-white"
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
