
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, FolderPlus, Plus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
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
        <h1 className="text-3xl font-bold">My Groups</h1>
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="text-xl">No Groups Yet</CardTitle>
            <CardDescription>
              Create your first group to start organizing your projects
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => setIsGroupDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" /> Create Your First Group
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-all ${
                selectedGroup?.id === group.id
                  ? "border-primary border-2"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleGroupClick(group)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {group.name}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
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
            <h2 className="text-2xl font-bold">
              Projects in {selectedGroup.name}
            </h2>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle className="text-xl">No Projects Yet</CardTitle>
                <CardDescription>
                  Create your first project in this group
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button onClick={() => setIsProjectDialogOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" /> Create Your First Project
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => handleProjectClick(project)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
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
    </div>
  );
};

export default Dashboard;
