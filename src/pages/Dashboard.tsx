
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FolderPlus, Plus, Users, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  group_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [deleteType, setDeleteType] = useState<"group" | "project">("group");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchProjects(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Group[]>("/api/groups/my");
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (groupId: string) => {
    try {
      const data = await apiGet<Project[]>(`/api/projects/group/${groupId}`);
      setProjects(data);
    } catch (error) {
      console.error(`Failed to fetch projects for group ${groupId}`, error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const group = await apiPost<Group>("/api/groups/", newGroup);
      setGroups([...groups, group]);
      setNewGroup({ name: "", description: "" });
      setIsGroupDialogOpen(false);
      toast.success("Group created successfully");
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const handleCreateProject = async () => {
    if (!selectedGroup) return;

    try {
      const project = await apiPost<Project>(
        `/api/projects/group/${selectedGroup.id}`,
        newProject
      );
      setProjects([...projects, project]);
      setNewProject({ name: "", description: "" });
      setIsProjectDialogOpen(false);
      toast.success("Project created successfully");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === "group") {
        await apiDelete(`/api/groups/${deleteItemId}`);
        setGroups(groups.filter((group) => group.id !== deleteItemId));
        if (selectedGroup && selectedGroup.id === deleteItemId) {
          setSelectedGroup(groups.length > 1 ? 
            groups.find(g => g.id !== deleteItemId) || null : 
            null);
        }
        toast.success("Group deleted successfully");
      } else {
        await apiDelete(`/api/projects/${deleteItemId}`);
        setProjects(projects.filter((project) => project.id !== deleteItemId));
        toast.success("Project deleted successfully");
      }
    } catch (error) {
      console.error(`Failed to delete ${deleteType}`, error);
      toast.error(`Failed to delete ${deleteType}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    // Don't navigate if clicking the delete button
    if ((e.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const openDeleteDialog = (id: string, type: "group" | "project", e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteItemId(id);
    setDeleteType(type);
    setIsDeleteDialogOpen(true);
  };

  const viewGeneratedBrds = () => {
    navigate('/brds');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Groups</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <h1 className="text-3xl font-bold text-gray-800">My Groups</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={viewGeneratedBrds}
            className="bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            <FileText className="mr-2 h-4 w-4" /> View Generated BRDs
          </Button>
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-700 hover:bg-gray-800 text-white">
                <Plus className="mr-2 h-4 w-4" /> Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Groups help you organize your projects and collaborate with team members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Description</Label>
                  <Input
                    id="group-description"
                    placeholder="Enter group description"
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateGroup} className="bg-gray-700 hover:bg-gray-800 text-white">Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center p-8 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">No Groups Yet</CardTitle>
            <CardDescription className="text-gray-600">
              Create your first group to start organizing your projects
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => setIsGroupDialogOpen(true)} className="bg-gray-700 hover:bg-gray-800 text-white">
              <Users className="mr-2 h-4 w-4" /> Create Your First Group
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-all bg-white ${
                selectedGroup?.id === group.id
                  ? "border-gray-500 border-2"
                  : "hover:border-gray-400 border-gray-200"
              }`}
              onClick={() => handleGroupClick(group)}
            >
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 delete-button"
                  onClick={(e) => openDeleteDialog(group.id, "group", e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardTitle className="flex items-center text-gray-800">
                  <Users className="h-5 w-5 mr-2 text-gray-600" />
                  {group.name}
                </CardTitle>
                <CardDescription className="line-clamp-1 text-gray-600">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Created on {new Date(group.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGroup && (
        <>
          <div className="flex justify-between items-center mt-12">
            <h2 className="text-2xl font-bold text-gray-800">
              Projects in {selectedGroup.name}
            </h2>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-700 hover:bg-gray-800 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project in the {selectedGroup.name} group.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateProject} className="bg-gray-700 hover:bg-gray-800 text-white">Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <Card className="text-center p-8 bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">No Projects Yet</CardTitle>
                <CardDescription className="text-gray-600">
                  Create your first project in this group
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button onClick={() => setIsProjectDialogOpen(true)} className="bg-gray-700 hover:bg-gray-800 text-white">
                  <FolderPlus className="mr-2 h-4 w-4" /> Create Your First Project
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:border-gray-400 transition-all bg-white border-gray-200"
                  onClick={(e) => handleProjectClick(project, e)}
                >
                  <CardHeader className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 delete-button"
                      onClick={(e) => openDeleteDialog(project.id, "project", e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardTitle className="flex items-center text-gray-800">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-600">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Created on{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType}.
              {deleteType === "group" && " All projects in this group will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-700 border-gray-300 hover:bg-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete {deleteType === "group" ? "Group" : "Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
