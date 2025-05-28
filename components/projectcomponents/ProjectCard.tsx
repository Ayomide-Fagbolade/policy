"use client";

import React from "react";
import { Project } from "../../utils/types";
import Card from "@/components/ui/card";

interface Props {
  projects: Project[];
}

const ProjectList: React.FC<Props> = ({ projects }) => {
 return (
  <div className="flex-1 w-full flex text-blue-900 flex-col p-4">
    <h1 className="text-white">Active Projects</h1>
    <div className="flex w-full flex-col sm:flex-row gap-4 p-4 ">
      {projects.map((project) => (
        <a key={project.id} href={`/protected/${project.id}`} >
          <Card className="px-10 py-6">
            <h2>{project.Project_title}</h2>
            <p>{project.Project_descr}</p>
            <small>Created at: {new Date(project.created_at).toLocaleString()}</small>
          </Card>
        </a>
      ))}
    </div>
  </div>
 );
};

export default ProjectList;
