// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Code, 
 Cpu, 
 Folder, 
 ArrowRight,
 Zap} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Project } from '../../../shared/types/project';

export const Dashboard: React.FC = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const { currentPlan } = useSubscription();
 const [projects, setProjects] = useState<Project[]>([]);
 const [usage, setUsage] = useState({
   promptsUsed: 0,
   promptLimit: 0,
   lastGenerated: null as Date | null
 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       // Fetch projects
       const projectsResponse = await fetch('/api/projects?limit=5');
       const projectsData = await projectsResponse.json();
       setProjects(projectsData);

       // Fetch usage stats
       const usageResponse = await fetch('/api/usage/stats');
       const usageData = await usageResponse.json();
       setUsage({
         promptsUsed: usageData.promptsUsed,
         promptLimit: usageData.promptLimit,
         lastGenerated: usageData.lastGenerated ? new Date(usageData.lastGenerated) : null
       });
     } catch (error) {
       console.error('Failed to fetch dashboard data:', error);
     } finally {
       setLoading(false);
     }
   };

   fetchDashboardData();
 }, []);

 const stats = [
   {
     label: 'Prompts Used',
     value: `${usage.promptsUsed}/${usage.promptLimit === -1 ? '∞' : usage.promptLimit}`,
     icon: Cpu,
     color: 'text-blue-500'
   },
   {
     label: 'Projects Created',
     value: projects.length,
     icon: Folder,
     color: 'text-green-500'
   },
   {
     label: 'Active Plan',
     value: currentPlan?.name || 'Free',
     icon: Zap,
     color: 'text-purple-500'
   }
 ];

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
     </div>
   );
 }

 return (
   <div className="container mx-auto px-4 py-8">
     {/* Welcome Section */}
     <div className="mb-8">
       <h1 className="text-2xl font-bold mb-2">
         Welcome back, {user?.name || 'Developer'}
       </h1>
       <p className="text-gray-600">
         Here's what's happening with your projects
       </p>
     </div>

     {/* Stats Grid */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       {stats.map((stat, index) => (
         <div
           key={index}
           className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow"
         >
           <div className="flex items-center justify-between">
             <div>
               <p className="text-gray-500 text-sm">{stat.label}</p>
               <p className="text-2xl font-bold mt-1">{stat.value}</p>
             </div>
             <stat.icon className={`h-8 w-8 ${stat.color}`} />
           </div>
         </div>
       ))}
     </div>

     {/* Quick Actions */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
       <div className="bg-white p-6 rounded-lg border">
         <h2 className="font-semibold mb-4">Quick Actions</h2>
         <div className="grid grid-cols-2 gap-4">
           <Button
             onClick={() => navigate('/builder')}
             className="flex items-center justify-center"
           >
             <Code className="mr-2 h-5 w-5" />
             New Project
           </Button>
           <Button
             variant="outline"
             onClick={() => navigate('/projects')}
             className="flex items-center justify-center"
           >
             <Folder className="mr-2 h-5 w-5" />
             View Projects
           </Button>
         </div>
       </div>

       <div className="bg-white p-6 rounded-lg border">
         <h2 className="font-semibold mb-4">Usage Overview</h2>
         <div className="space-y-4">
           <div className="flex items-center justify-between">
             <span>Prompts</span>
             <span className="text-gray-500">
               {usage.promptsUsed} / {usage.promptLimit === -1 ? '∞' : usage.promptLimit}
             </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-2">
             <div
               className="bg-primary rounded-full h-2 transition-all"
               style={{
                 width: usage.promptLimit === -1 
                   ? '0%' 
                   : `${(usage.promptsUsed / usage.promptLimit) * 100}%`
               }}
             />
           </div>
         </div>
       </div>
     </div>

     {/* Recent Projects */}
     <div className="bg-white rounded-lg border">
       <div className="p-6 border-b">
         <div className="flex items-center justify-between">
           <h2 className="font-semibold">Recent Projects</h2>
           <Button
             variant="ghost"
             onClick={() => navigate('/projects')}
             className="flex items-center"
           >
             View All
             <ArrowRight className="ml-2 h-4 w-4" />
           </Button>
         </div>
       </div>
       
       {projects.length > 0 ? (
         <div className="divide-y">
           {projects.map((project) => (
             <div
               key={project.id}
               className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
               onClick={() => navigate(`/projects/${project.id}`)}
             >
               <div>
                 <h3 className="font-medium">{project.name}</h3>
                 <p className="text-sm text-gray-500">
                   Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                 </p>
               </div>
               <Button variant="ghost" size="icon">
                 <ArrowRight className="h-4 w-4" />
               </Button>
             </div>
           ))}
         </div>
       ) : (
         <div className="p-12 text-center">
           <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
           <h3 className="font-medium mb-2">No projects yet</h3>
           <p className="text-gray-500 mb-4">
             Start by creating your first project
           </p>
           <Button onClick={() => navigate('/builder')}>
             Create Project
           </Button>
         </div>
       )}
     </div>
   </div>
 );
};

export default Dashboard;