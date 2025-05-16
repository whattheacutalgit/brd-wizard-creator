
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatMarkdownText } from "@/lib/utils";

interface GeneratedBrd {
  id: string;
  project_id: string;
  project_name: string;
  summary: string;
  created_at: string;
  brd_preview: string;
}

const GeneratedBrds = () => {
  const navigate = useNavigate();
  const [brds, setBrds] = useState<GeneratedBrd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBrds();
  }, []);

  const fetchBrds = async () => {
    setLoading(true);
    try {
      const data = await apiGet<GeneratedBrd[]>("/api/brds/my");
      setBrds(data);
    } catch (error) {
      console.error("Failed to fetch generated BRDs", error);
      toast.error("Failed to load generated BRDs");
    } finally {
      setLoading(false);
    }
  };

  const viewBrd = (brdId: string) => {
    navigate(`/brd/final/${brdId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBrds = brds.filter(brd => {
    const searchLower = searchTerm.toLowerCase();
    return (
      brd.project_name.toLowerCase().includes(searchLower) ||
      brd.summary.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Generated BRDs</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Generated BRDs</h1>
        <div className="w-1/3">
          <Input
            placeholder="Search BRDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300"
          />
        </div>
      </div>

      {brds.length === 0 ? (
        <Card className="text-center p-8 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">No BRDs Generated Yet</CardTitle>
            <CardDescription className="text-gray-600">
              Create a project and generate your first BRD
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              <FileText className="mr-2 h-4 w-4" /> Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredBrds.map((brd) => (
            <Card 
              key={brd.id}
              className="bg-white border-gray-200 hover:border-gray-400 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-800 mb-1">{brd.project_name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 inline" /> 
                      {formatDate(brd.created_at)}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => viewBrd(brd.id)}
                    className="bg-gray-700 hover:bg-gray-800 text-white"
                  >
                    View BRD <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-gray-800 font-medium mb-2">Summary:</h3>
                  <p className="text-gray-600 text-sm">{brd.summary}</p>
                </div>
                <div>
                  <h3 className="text-gray-800 font-medium mb-2">Preview:</h3>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md max-h-24 overflow-hidden text-sm text-gray-600">
                    <div dangerouslySetInnerHTML={{ 
                      __html: brd.brd_preview ? formatMarkdownText(brd.brd_preview.substring(0, 200) + '...') : "No preview available" 
                    }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratedBrds;
