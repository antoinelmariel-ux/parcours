import type { ProjectData } from "../models/project";

const isFileSystemSupported = () => "showSaveFilePicker" in window;

export const saveToFile = async (project: ProjectData) => {
  const data = JSON.stringify(project, null, 2);
  if (isFileSystemSupported()) {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${project.meta.name}.hdjpm.json`,
      types: [
        {
          description: "HDJ Pathway Mapper",
          accept: { "application/json": [".hdjpm.json"] }
        }
      ]
    });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
    return;
  }
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.meta.name}.hdjpm.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const importFromFile = async () => {
  if (isFileSystemSupported()) {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: "HDJ Pathway Mapper",
          accept: { "application/json": [".hdjpm.json"] }
        }
      ]
    });
    const file = await handle.getFile();
    return JSON.parse(await file.text()) as ProjectData;
  }
  return new Promise<ProjectData>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hdjpm.json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error("Aucun fichier sélectionné"));
      try {
        const text = await file.text();
        resolve(JSON.parse(text) as ProjectData);
      } catch (error) {
        reject(error);
      }
    };
    input.click();
  });
};
