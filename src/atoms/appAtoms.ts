import { atom } from "jotai";
import { atomWithRefresh, loadable } from "jotai/utils";

const refreshStudentListAtom = atomWithRefresh(
  async () =>
    new Promise<any>((resolve) =>
      setTimeout(async () => {
        const response = await fetch("http://localhost:5000/api/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        resolve(data);
      }, 250)
    )
);
const loadableStudentListAtom = loadable(refreshStudentListAtom);
export const studentListAtom = atom(
  (get) => get(loadableStudentListAtom),
  (_get, set) => set(refreshStudentListAtom)
);
