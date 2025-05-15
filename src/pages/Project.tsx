
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiUpload } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  group_id: string;
}

interface Document {
  id: string;
  filename: string;
  description: string;
  created_at: string;
  summary: string | null;
  project_id: string;
}

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Normally we'd fetch the project details here, but for now we'll create a mock project
      // since the API doesn't have a specific endpoint for project details
      const mockProject: Project = {
        id: projectId!,
        name: "Project " + projectId?.substring(0, 5),
        description: "A sample project for BRD generation",
        created_at: new Date().toISOString(),
        group_id: "group-id",
      };
      setProject(mockProject);
      
      // Fetch documents
      const docs = await apiGet<Document[]>(`/api/documents/project/${projectId}`);
      setDocuments(docs);
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

  const handleUpload = async () => {
    if (!selectedFile || !projectId) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("project_id", projectId);
    formData.append("description", description);
    
    try {
      await apiUpload<Document>("/api/documents/upload", formData);
      toast.success("Document uploaded successfully");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      // Refetch documents
      const docs = await apiGet<Document[]>(`/api/documents/project/${projectId}`);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to upload document", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl font-medium mb-4">Project not found</p>
        <Link to="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex space-x-4">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document to be analyzed and included in the BRD generation process.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Document</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, DOCX, TXT, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-description">Description</Label>
                  <Textarea
                    id="document-description"
                    placeholder="Enter a short description of this document"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link to={`/brd/generate/${projectId}`}>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Generate BRD
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="documents" className="mt-8">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Project Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          {documents.length === 0 ? (
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle className="text-xl">No Documents Yet</CardTitle>
                <CardDescription>
                  Upload documents to be analyzed for BRD generation
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Upload Your First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      {doc.filename}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-sm">
                      {doc.summary ? (
                        <div className="space-y-2">
                          <p className="font-medium">AI Summary:</p>
                          <p className="text-muted-foreground line-clamp-5">
                            {doc.summary}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No summary available
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        Uploaded on {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Manage settings for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Project settings coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Project;
