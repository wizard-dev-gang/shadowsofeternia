import { getDatabase, ref, set, update, remove } from "firebase/database";

export const createEnemyInDatabase = (id: string, x: number, y: number, direction: number) => {
    const db = getDatabase();
    const dbRef = ref(db, "enemies/" + id);
    set(dbRef, {
        x: x,
        hp: 100,
        y: y,
        direction: direction,
    });
}

export const updateEnemyInDatabase = (id: string, x: number, y: number, direction: number) => {
    const db = getDatabase();
    const dbRef = ref(db, "enemies/" + id);
    update(dbRef, {
        x: x,
        y: y,
        direction: direction,
    });
}

export const removeEnemyFromDatabase = (id: string) => {
    const db = getDatabase();
    const dbRef = ref(db, "enemies/" + id);
    remove(dbRef);
}
