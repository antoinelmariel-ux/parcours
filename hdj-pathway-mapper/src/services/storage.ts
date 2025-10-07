import Dexie, { Table } from "dexie";
import type { ProjectData } from "../models/project";

class ProjectDatabase extends Dexie {
  projects!: Table<ProjectData>;

  constructor() {
    super("hdj-pathway-mapper");
    this.version(1).stores({
      projects: "projectId"
    });
  }
}

const db = new ProjectDatabase();

export const saveProject = async (project: ProjectData) => {
  await db.projects.put(project);
};

export const loadProject = async (projectId: string) => {
  return db.projects.get(projectId);
};

export const listProjects = async () => {
  return db.projects.toArray();
};
