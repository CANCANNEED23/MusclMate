import { Client, query } from "pg";

export async function get_exercise_by_uid(client: Client, uid: string): Promise<Array<any> | undefined>{
    const sql: string = "SELECT * FROM public.exercises WHERE uid = $1;"; 
    const values = [uid];

    try{
        const res = await client.query(sql, values);
        return res.rows;
    } catch(err) {
        console.error("Problem fetching\n", err);
        return undefined;
    }
}

export async function get_exercises(client: Client, exercise_name: string = '', exercise_target: string = '', n_reps: number = 0, n_sets: number = 0, arr_keywords: Array<string> = [], weight: number = 0): Promise<Object | undefined> {
    let conditions: Array<string> = [];
    let values: Array<any> = [];
    let index = 1;

    if (exercise_name) {
        conditions.push(`exercise_name = $${index++}`);
        values.push(exercise_name);
    }
    if (exercise_target) {
        conditions.push(`exercise_target = $${index++}`);
        values.push(exercise_target);
    }
    if (n_reps > 0) {
        conditions.push(`n_reps = $${index++}`);
        values.push(n_reps);
    }
    if (n_sets > 0) { 
        conditions.push(`n_sets = $${index++}`);
        values.push(n_sets);
    }
    if (arr_keywords.length > 0) {
        conditions.push(`arr_keywords && $${index++}`);
        values.push(arr_keywords);
    }
    if (weight > 0) { 
        conditions.push(`weight = $${index++}`);
        values.push(weight);
    }

    const sql_string = `SELECT * FROM public.exercises WHERE ${conditions.join(' OR ')}`;

    const query = {
        name: "get_exercises",
        text: sql_string,
        values: values
    }

    const results = client.query(query);

    query.on('end', () => {
        return results;
    });

    query.on('error', (err) => {
        console.error(err.stack);
        return undefined;
    });
    return undefined;
}


export async function create_exercise(client: Client, item_name: string, target: string, reps: Number, sets: Number, keywords: string[], weight: Number): Promise<string | null>{
    const sql: string = `INSERT INTO public.exercises (uid, exercise_name, exercise_target, n_reps, n_sets,` +
                        ` arr_keywords, weight) VALUES (uuid_generate_v4(), $1, $2,` +
                        ` $3, $4, $5, $6) RETURNING uid`;
    const values = [item_name, target, reps.toString(), sets.toString(), keywords, weight.toString()]

    try{
        const result = await client.query(sql, values);
        const uid = result.rows[0].uid;
        return uid;
    } catch(err) {
        console.error("Problem creating new exercise\n", err);
        return null;
    }
}

export async function delete_from(client: Client, table_name: String, uid: String){
    const sql: string = `DELETE FROM public.${table_name} WHERE uid = $1`;
    const values = [uid];

    try{
        await client.query(sql, values);
        return true;
    } catch(err){
        console.error("Problem deleting new exercise\n", err);
        return false;
    }
}

/**
 * edit a row in exercise with given value
 * new_value must be the in the same structure as what was returned from get()
 * @param client client instance
 * @param new_value object representing all updated values
 * @param 
 */
export async function edit_exercise(client: Client, uid: String, new_value: Object){
    const sql: string = `UPDATE? public.exercises (uid, exercise_name, exercise_target, 
                        n_reps, n_sets, arr_keywords, weight) VALUES $1 WHERE uid = $2` ;
    const values = [uid, new_value];

    try{
        await client.query(sql, values);
        return true;
    } catch(err){
        console.error("Problem creating new exercise\n", err);
        return false;
    }

}