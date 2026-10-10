import * as XLSX from "xlsx";
import type { Perspective } from "bsc-shared";

export interface ImportRow {
  perspective: string;
  project: string;
  activity: string;
  progress: number;
  description?: string;
}

export interface PreviewRow {
  perspective: string;
  project: string;
  activity: string;
  currentProgress: number;
  newProgress: number;
  activityId: string;
  description: string;
  error?: string;
}

export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;
export const SUPPORTED_IMPORT_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export const IMPORT_COLUMNS_ERROR =
  "No se pudieron leer filas del archivo. Asegúrese de que las columnas sean: perspectiva, proyecto, actividad, avance";

export function validateImportFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const isSupported = SUPPORTED_IMPORT_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!isSupported) {
    return "El archivo debe ser formato CSV o Excel (.xlsx, .xls)";
  }
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return "El archivo es demasiado grande (máximo 5 MB)";
  }
  return null;
}

export function parseCSVLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cols.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cols.push(current);
  return cols.map((c) => c.trim());
}

export function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const pIdx = header.indexOf("perspectiva");
  const prIdx = header.indexOf("proyecto");
  const aIdx = header.indexOf("actividad");
  const vIdx = header.indexOf("avance");
  const dIdx =
    header.indexOf("descripción") !== -1
      ? header.indexOf("descripción")
      : header.indexOf("descripcion");
  if (pIdx === -1 || prIdx === -1 || aIdx === -1 || vIdx === -1) return [];
  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length <= Math.max(pIdx, prIdx, aIdx, vIdx)) continue;
    const progress = parseFloat(cols[vIdx]);
    if (isNaN(progress)) continue;
    rows.push({
      perspective: cols[pIdx],
      project: cols[prIdx],
      activity: cols[aIdx],
      progress: Math.min(100, Math.max(0, progress)),
      description: dIdx !== -1 && cols[dIdx] ? cols[dIdx] : undefined,
    });
  }
  return rows;
}

function findColumnValue(row: Record<string, unknown>, key: string): unknown {
  const lowerKey = key.toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (k.toLowerCase().trim() === lowerKey) return v;
  }
  return undefined;
}

export function parseExcel(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const rows: ImportRow[] = [];
  for (const row of jsonData) {
    const perspective = findColumnValue(row, "perspectiva");
    const project = findColumnValue(row, "proyecto");
    const activity = findColumnValue(row, "actividad");
    const progress = findColumnValue(row, "avance");
    const description =
      findColumnValue(row, "descripción") ?? findColumnValue(row, "descripcion");
    if (!perspective || !project || !activity || progress === undefined) continue;
    const progressNum = parseFloat(String(progress));
    if (isNaN(progressNum)) continue;
    rows.push({
      perspective: String(perspective),
      project: String(project),
      activity: String(activity),
      progress: Math.min(100, Math.max(0, progressNum)),
      description: description ? String(description) : undefined,
    });
  }
  return rows;
}

export function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchImportRows(
  rows: ImportRow[],
  perspectives: Perspective[],
): PreviewRow[] {
  const preview: PreviewRow[] = [];
  for (const row of rows) {
    const foundPerspective = perspectives.find(
      (p) => normalize(p.name) === normalize(row.perspective),
    );
    if (!foundPerspective) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Perspectiva "${row.perspective}" no encontrada`,
      });
      continue;
    }
    const foundProject = foundPerspective.projects.find(
      (pr) => normalize(pr.name) === normalize(row.project),
    );
    if (!foundProject) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Proyecto "${row.project}" no encontrado en "${foundPerspective.name}"`,
      });
      continue;
    }
    const foundActivity = foundProject.activities.find(
      (a) => normalize(a.name) === normalize(row.activity),
    );
    if (!foundActivity) {
      preview.push({
        perspective: row.perspective,
        project: row.project,
        activity: row.activity,
        currentProgress: 0,
        newProgress: row.progress,
        activityId: "",
        description: row.description || "",
        error: `Actividad "${row.activity}" no encontrada en "${foundProject.name}"`,
      });
      continue;
    }
    preview.push({
      perspective: foundPerspective.name,
      project: foundProject.name,
      activity: foundActivity.name,
      currentProgress: foundActivity.progress,
      newProgress: row.progress,
      activityId: foundActivity.id,
      description: row.description || "",
    });
  }
  return preview;
}

export function parseImportFile(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (isExcel) {
          resolve(parseExcel(evt.target?.result as ArrayBuffer));
        } else {
          const text = evt.target?.result as string;
          if (text.includes("\0")) {
            reject(
              new Error(
                "El archivo parece ser binario. Por favor intente con un archivo CSV válido o Excel",
              ),
            );
            return;
          }
          resolve(parseCSV(text));
        }
      } catch {
        reject(new Error(IMPORT_COLUMNS_ERROR));
      }
    };
    reader.onerror = () => reject(new Error(IMPORT_COLUMNS_ERROR));
    if (isExcel) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}
